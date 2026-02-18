import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutRuntimePage from './pages/AboutRuntimePage';
import EventLoopPage from './pages/EventLoopPage';
import NodeVsBrowserPage from './pages/NodeVsBrowserPage';
import ExamplesPage from './pages/ExamplesPage';

// Lazy-load the heavy Visualizer page (Monaco Editor ~500kB)
const VisualizerPage = lazy(() => import('./pages/VisualizerPage'));

function LazyVisualizer() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-void gap-4">
          <div className="w-10 h-10 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          <span className="text-xs font-mono text-white/25">Loading visualizer...</span>
        </div>
      }
    >
      <VisualizerPage />
    </Suspense>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about-runtime" element={<AboutRuntimePage />} />
        <Route path="event-loop" element={<EventLoopPage />} />
        <Route path="node-vs-browser" element={<NodeVsBrowserPage />} />
        <Route path="examples" element={<ExamplesPage />} />
        <Route path="visualizer" element={<LazyVisualizer />} />
      </Route>
    </Routes>
  );
}

export default App;
