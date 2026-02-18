import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isVisualizer = location.pathname === '/visualizer';

  return (
    <div className="min-h-screen flex flex-col bg-navy-900">
      <Navbar />
      <main className={isVisualizer ? 'flex-1 pt-16' : 'flex-1 pt-16'}>
        <Outlet />
      </main>
      {!isVisualizer && <Footer />}
    </div>
  );
}
