import { useState, useEffect } from 'react';
import { FaChartPie, FaSync } from 'react-icons/fa';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LABEL_COLORS_MAP = { bug: '#ef4444', feature: '#22c55e', docs: '#3b82f6' };
const PRIORITY_COLORS_MAP = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Unable to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 dark:text-gray-500">
        <FaSync className="animate-spin text-3xl mr-3" />
        Loading statistics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p>{error}</p>
        <button onClick={fetchStats} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const labelData = stats
    ? Object.entries(stats.label_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const priorityData = stats
    ? Object.entries(stats.priority_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const avgConfidencePct = stats ? Math.round((stats.avg_confidence || 0) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-600 rounded-xl text-white">
            <FaChartPie className="text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analytics for all predictions</p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Predictions', value: stats?.total ?? 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Bug Issues', value: stats?.label_distribution?.bug ?? 0, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Feature Requests', value: stats?.label_distribution?.feature ?? 0, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Avg Confidence', value: `${avgConfidencePct}%`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {stats?.total === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center text-gray-400 dark:text-gray-500">
          <FaChartPie className="text-5xl mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No data yet</p>
          <p className="text-sm mt-1">Make some predictions to see statistics here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Label distribution pie chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Label Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={labelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={110}
                  dataKey="value"
                >
                  {labelData.map((entry) => (
                    <Cell key={entry.name} fill={LABEL_COLORS_MAP[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                />
                <Legend
                  formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority distribution bar chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fontWeight: 500 }}
                  tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [value, 'Count']}
                  labelFormatter={label => label.charAt(0).toUpperCase() + label.slice(1) + ' Priority'}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS_MAP[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Label breakdown detail */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Label Breakdown</h3>
            <div className="space-y-3">
              {labelData.map(({ name, value }) => {
                const pct = stats.total ? Math.round((value / stats.total) * 100) : 0;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{value} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: LABEL_COLORS_MAP[name] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority breakdown detail */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              {priorityData.map(({ name, value }) => {
                const pct = stats.total ? Math.round((value / stats.total) * 100) : 0;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{value} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: PRIORITY_COLORS_MAP[name] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
