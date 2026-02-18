import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutRuntimePage from './pages/AboutRuntimePage';
import EventLoopPage from './pages/EventLoopPage';
import NodeVsBrowserPage from './pages/NodeVsBrowserPage';
import ExamplesPage from './pages/ExamplesPage';
import VisualizerPage from './pages/VisualizerPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about-runtime" element={<AboutRuntimePage />} />
        <Route path="event-loop" element={<EventLoopPage />} />
        <Route path="node-vs-browser" element={<NodeVsBrowserPage />} />
        <Route path="examples" element={<ExamplesPage />} />
        <Route path="visualizer" element={<VisualizerPage />} />
      </Route>
    </Routes>
  );
}

export default App;
