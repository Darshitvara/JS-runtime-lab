import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function Layout() {
  const location = useLocation();
  const isVisualizer = location.pathname === '/visualizer';

  return (
    <div className="min-h-screen flex flex-col bg-void">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-cyan focus:text-void focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className={isVisualizer ? 'flex-1 pt-16' : 'flex-1 pt-16'}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageTransition} className="h-full">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isVisualizer && <Footer />}
    </div>
  );
}
