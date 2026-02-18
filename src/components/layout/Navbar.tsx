import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about-runtime', label: 'Runtime' },
  { path: '/event-loop', label: 'Event Loop' },
  { path: '/node-vs-browser', label: 'Node vs Browser' },
  { path: '/examples', label: 'Examples' },
  { path: '/visualizer', label: 'Visualizer' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-sm">
              JS
            </div>
            <span className="text-lg font-semibold text-white group-hover:text-accent-blue transition-colors hidden sm:block">
              Event Loop Visualizer
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
