import { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaSort, FaSortUp, FaSortDown, FaDownload } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LABEL_COLORS = {
  bug: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  feature: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  docs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <FaSort className="text-gray-300 dark:text-gray-600" />;
  return sortDir === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterLabel, setFilterLabel] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/history?limit=200`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || 'Unable to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const filtered = history
    .filter(p => {
      const q = search.toLowerCase();
      return (
        (!q || p.title.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q)) &&
        (filterLabel === 'all' || p.label === filterLabel) &&
        (filterPriority === 'all' || p.priority === filterPriority)
      );
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'confidence') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const downloadCSV = () => {
    const rows = [['ID', 'Title', 'Label', 'Priority', 'Confidence', 'Timestamp']];
    history.forEach(p => rows.push([p.id, `"${p.title}"`, p.label, p.priority, p.confidence, p.timestamp]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predictions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-xl text-white">
            <FaHistory className="text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prediction History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{history.length} total predictions</p>
          </div>
        </div>
        <button
          onClick={downloadCSV}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or body..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterLabel}
          onChange={e => { setFilterLabel(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Labels</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="docs">Docs</option>
        </select>
        <select
          value={filterPriority}
          onChange={e => { setFilterPriority(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <div className="animate-spin text-3xl mb-3">⟳</div>
            Loading history…
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 dark:text-red-400">
            <p className="mb-2">{error}</p>
            <button onClick={fetchHistory} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Retry
            </button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <FaHistory className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No predictions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {[
                    { field: 'title', label: 'Title' },
                    { field: 'label', label: 'Label' },
                    { field: 'priority', label: 'Priority' },
                    { field: 'confidence', label: 'Confidence' },
                    { field: 'timestamp', label: 'Date' },
                  ].map(({ field, label }) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none"
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate font-medium text-gray-900 dark:text-white">{p.title}</p>
                      {p.body && <p className="truncate text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.body}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${LABEL_COLORS[p.label]}`}>
                        {p.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${PRIORITY_COLORS[p.priority]}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.confidence >= 0.8 ? 'bg-green-500' : p.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.round(p.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          {Math.round(p.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(p.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filtered.length > PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
