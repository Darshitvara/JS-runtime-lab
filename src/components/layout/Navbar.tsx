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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative font-mono text-lg font-extrabold tracking-tight select-none">
              <span className="text-white/30 group-hover:text-white/50 transition-colors duration-300">{'{'}</span>
              <span className="text-[#ff6b6b] drop-shadow-[0_0_8px_rgba(255,107,107,0.5)]">J</span>
              <span className="text-[#48dbfb] drop-shadow-[0_0_8px_rgba(72,219,251,0.5)]">S</span>
              <span className="text-white/30 group-hover:text-white/50 transition-colors duration-300">{'}'}</span>
              <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-mint shadow-[0_0_5px_theme(colors.mint)]">
                <span className="absolute inset-0 rounded-full bg-mint animate-ping opacity-30" />
              </span>
            </div>
            <span className="text-lg font-semibold text-white/90 group-hover:text-cyan transition-colors duration-300 hidden sm:block">
              Event Loop Visualizer
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isVisualizer = link.path === '/visualizer';
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300',
                    isVisualizer && !isActive && 'text-cyan hover:text-cyan',
                    isActive
                      ? 'text-white'
                      : !isVisualizer && 'text-white/50 hover:text-white/90'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.08]"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-white/50 hover:text-cyan transition-colors"
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
                        ? 'text-cyan bg-cyan/5'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
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
