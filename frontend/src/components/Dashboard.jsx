import { Link } from 'react-router-dom';
import { FaBug, FaPlus, FaBook, FaChartPie, FaHistory, FaRobot, FaArrowRight } from 'react-icons/fa';

const LABEL_COLORS = {
  bug: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  feature: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  docs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const PRIORITY_COLORS = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-gray-500 dark:text-gray-400',
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex items-center gap-4`}>
      <div className={`p-3 rounded-xl ${color} text-white`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ recentPredictions, stats }) {
  const recent = recentPredictions?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <FaRobot className="text-3xl" />
          <h1 className="text-3xl font-bold">AI Bug Triage Assistant</h1>
        </div>
        <p className="text-blue-100 max-w-xl mb-6">
          Automatically predict issue labels and priorities for GitHub issues using AI.
          Save time, stay consistent, and focus on what matters.
        </p>
        <Link
          to="/predict"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow"
        >
          Try a Prediction <FaArrowRight />
        </Link>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaHistory className="text-xl" />}
          label="Total Predictions"
          value={stats?.total ?? 0}
          color="bg-blue-600"
        />
        <StatCard
          icon={<FaBug className="text-xl" />}
          label="Bugs Found"
          value={stats?.label_distribution?.bug ?? 0}
          color="bg-red-500"
        />
        <StatCard
          icon={<FaPlus className="text-xl" />}
          label="Features"
          value={stats?.label_distribution?.feature ?? 0}
          color="bg-green-500"
        />
        <StatCard
          icon={<FaBook className="text-xl" />}
          label="Docs Issues"
          value={stats?.label_distribution?.docs ?? 0}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick access cards */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Access</h2>
          {[
            { to: '/predict', icon: <FaRobot className="text-blue-600" />, label: 'New Prediction', desc: 'Predict a GitHub issue' },
            { to: '/history', icon: <FaHistory className="text-purple-600" />, label: 'View History', desc: 'Browse past predictions' },
            { to: '/stats', icon: <FaChartPie className="text-green-600" />, label: 'Statistics', desc: 'Charts & analytics' },
          ].map(({ to, icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
              <FaArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Recent predictions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Predictions</h2>
            <Link to="/history" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <FaRobot className="text-4xl mx-auto mb-3 opacity-30" />
              <p>No predictions yet.</p>
              <Link to="/predict" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
                Make your first prediction →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recent.map((p) => (
                <div key={p.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(p.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${LABEL_COLORS[p.label]}`}>
                    {p.label}
                  </span>
                  <span className={`text-xs font-semibold ${PRIORITY_COLORS[p.priority]}`}>
                    {p.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '⚡', title: 'Instant Predictions', desc: 'Get AI predictions in milliseconds' },
          { icon: '📊', title: 'Analytics Dashboard', desc: 'Track trends and label distribution' },
          { icon: '🔄', title: 'Feedback Loop', desc: 'Improve accuracy with your feedback' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 text-center">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
