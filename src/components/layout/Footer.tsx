import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-void/80 backdrop-blur-sm" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-linear-to-br from-cyan to-lavender flex items-center justify-center text-void font-bold text-xs">
              JS
            </div>
            <span className="text-sm text-white/30">
              Event Loop Visualizer
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about-runtime" className="text-sm text-white/25 hover:text-cyan/70 transition-colors duration-300">
              Learn
            </Link>
            <Link to="/visualizer" className="text-sm text-white/25 hover:text-cyan/70 transition-colors duration-300">
              Visualizer
            </Link>
            <Link to="/examples" className="text-sm text-white/25 hover:text-cyan/70 transition-colors duration-300">
              Examples
            </Link>
          </div>

          <p className="text-xs text-white/15">
            Built for learning JavaScript internals
          </p>
        </div>
      </div>
    </footer>
  );
}
