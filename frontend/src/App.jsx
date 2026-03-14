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

  // Fetch initial stats and history on mount
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [statsRes, histRes] = await Promise.all([
          fetch(`${API_BASE}/stats`),
          fetch(`${API_BASE}/history?limit=10`),
        ]);
        if (!cancelled) {
          if (statsRes.ok) setStats(await statsRes.json());
          if (histRes.ok) setRecentPredictions((await histRes.json()).history || []);
        }
      } catch {
        // non-critical - API may not be running yet
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleNewPrediction = useCallback(async (prediction) => {
    setRecentPredictions(prev => [prediction, ...prev].slice(0, 10));
    // Refresh stats after new prediction
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) setStats(await res.json());
    } catch {
      // non-critical
    }
  }, []);

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
