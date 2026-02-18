import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-xs">
              JS
            </div>
            <span className="text-sm text-gray-400">
              Event Loop Visualizer
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about-runtime" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Learn
            </Link>
            <Link to="/visualizer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Visualizer
            </Link>
            <Link to="/examples" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Examples
            </Link>
          </div>

          <p className="text-xs text-gray-600">
            Built for learning JavaScript internals
          </p>
        </div>
      </div>
    </footer>
  );
}
