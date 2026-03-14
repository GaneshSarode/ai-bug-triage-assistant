import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PredictForm from './components/PredictForm';
import History from './components/History';
import Stats from './components/Stats';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // stats are non-critical
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/history?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setRecentPredictions(data.history || []);
      }
    } catch {
      // history is non-critical
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [fetchStats, fetchHistory]);

  const handleNewPrediction = useCallback((prediction) => {
    setRecentPredictions(prev => [prediction, ...prev].slice(0, 10));
    fetchStats();
  }, [fetchStats]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(d => !d)} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard recentPredictions={recentPredictions} stats={stats} />} />
            <Route path="/predict" element={<PredictForm onNewPrediction={handleNewPrediction} />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
