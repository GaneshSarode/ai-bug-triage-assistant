import { Link, useLocation } from 'react-router-dom';
import { FaBug, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/predict', label: 'Predict' },
  { to: '/history', label: 'History' },
  { to: '/stats', label: 'Statistics' },
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl">
            <FaBug className="text-2xl" />
            <span className="hidden sm:inline">AI Bug Triage</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  location.pathname === to
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-yellow-400 text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pb-4 animate-fade-in">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium mt-1 transition-colors ${
                location.pathname === to
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
