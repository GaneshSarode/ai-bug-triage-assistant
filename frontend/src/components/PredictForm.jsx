import { useState } from 'react';
import { FaRobot, FaSpinner, FaBug, FaPlus, FaBook } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LABEL_COLORS = {
  bug: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  feature: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  docs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const LABEL_ICONS = {
  bug: <FaBug />,
  feature: <FaPlus />,
  docs: <FaBook />,
};

export default function PredictForm({ onNewPrediction }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an issue title.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error('Prediction failed. Please try again.');
      const data = await res.json();
      setResult(data);
      if (onNewPrediction) onNewPrediction(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (correct) => {
    if (!result) return;
    setFeedback(correct ? 'correct' : 'incorrect');
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, correct }),
      });
    } catch {
      // feedback is non-critical
    }
  };

  const handleClear = () => {
    setTitle('');
    setBody('');
    setResult(null);
    setError('');
    setFeedback(null);
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <FaRobot className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Predict Issue</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter a GitHub issue to get an instant AI prediction</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Login page crashes with error 500"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Predicting…
                </>
              ) : (
                <>
                  <FaRobot />
                  Predict
                </>
              )}
            </button>
            {result && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-150 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Example prompts */}
        <div className="mt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-wide">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {[
              { title: 'App crashes on login', body: 'Getting 500 error when submitting credentials' },
              { title: 'Add dark mode support', body: 'Users have requested a dark theme option' },
              { title: 'Update API docs', body: 'The authentication section is outdated' },
            ].map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setTitle(ex.title); setBody(ex.body); setResult(null); setError(''); }}
                className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors border border-blue-100 dark:border-gray-600"
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Prediction Results</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">Label</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${LABEL_COLORS[result.label]}`}>
                {LABEL_ICONS[result.label]}
                {result.label.toUpperCase()}
              </span>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">Priority</p>
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${PRIORITY_COLORS[result.priority]}`}>
                {result.priority.toUpperCase()}
              </span>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">Confidence</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{confidencePct}%</p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Confidence Score</span>
              <span>{confidencePct}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  confidencePct >= 80 ? 'bg-green-500' : confidencePct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>

          {/* Feedback */}
          {!feedback ? (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Was this prediction correct?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  className="px-4 py-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-green-200 dark:border-green-700 font-medium"
                >
                  👍 Correct
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-700 font-medium"
                >
                  👎 Incorrect
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feedback === 'correct' ? '✅ Thanks for the feedback!' : '❌ Thanks! We\'ll use this to improve.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
