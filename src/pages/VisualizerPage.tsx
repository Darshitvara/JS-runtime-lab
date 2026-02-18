import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizerStore } from '../store/visualizerStore';
import {
  CallStack,
  TaskQueue,
  WebAPIsPanel,
  EventLoopIndicator,
  ConsoleOutput,
  Controls,
  CodeEditor,
} from '../components/visualizer';

/* ── Mobile tab type ── */
type MobileTab = 'editor' | 'panels';

export default function VisualizerPage() {
  const {
    microtaskQueue,
    macrotaskQueue,
    playbackState,
    steps,
    step: stepForward,
    play,
    pause,
    loadAndRun,
  } = useVisualizerStore();

  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('.monaco-editor')
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (playbackState === 'playing') pause();
          else if (steps.length > 0) play();
          else { loadAndRun(); setTimeout(() => play(), 50); }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (steps.length === 0) loadAndRun();
          else stepForward();
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            loadAndRun();
          }
          break;
      }
    },
    [playbackState, steps.length, play, pause, stepForward, loadAndRun],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-void overflow-hidden" role="main" aria-label="JavaScript Event Loop Visualizer">
      {/* Controls bar */}
      <div className="shrink-0 px-3 sm:px-4 py-2.5 border-b border-white/[0.04] glass-strong" role="toolbar" aria-label="Playback controls">
        <Controls />
      </div>

      {/* Mobile tab switcher (visible below lg) */}
      <div className="lg:hidden shrink-0 flex border-b border-white/[0.04] bg-abyss/60">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2.5 text-xs font-mono font-semibold transition-colors relative ${
            mobileTab === 'editor' ? 'text-cyan' : 'text-white/30 hover:text-white/50'
          }`}
          aria-selected={mobileTab === 'editor'}
          role="tab"
        >
          Code & Console
          {mobileTab === 'editor' && (
            <motion.div layoutId="mobile-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan rounded-full" />
          )}
        </button>
        <button
          onClick={() => setMobileTab('panels')}
          className={`flex-1 py-2.5 text-xs font-mono font-semibold transition-colors relative ${
            mobileTab === 'panels' ? 'text-lavender' : 'text-white/30 hover:text-white/50'
          }`}
          aria-selected={mobileTab === 'panels'}
          role="tab"
        >
          Visualizer
          {mobileTab === 'panels' && (
            <motion.div layoutId="mobile-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-lavender rounded-full" />
          )}
        </button>
      </div>

      {/* Main grid — desktop: side by side, mobile: tabbed */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
        {/* ── Left: Editor + Console ── */}
        <div className={`flex flex-col overflow-hidden border-r border-white/[0.04] ${
          mobileTab !== 'editor' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Code Editor */}
          <div className="flex-1 min-h-0" role="region" aria-label="Code editor">
            <CodeEditor />
          </div>

          {/* Console */}
          <div className="h-[160px] sm:h-[180px] lg:h-[200px] shrink-0 border-t border-white/[0.04] p-3 overflow-hidden" role="log" aria-label="Console output" aria-live="polite">
            <ConsoleOutput />
          </div>
        </div>

        {/* ── Right: Visualization Panels ── */}
        <div className={`flex flex-col overflow-y-auto p-3 sm:p-4 gap-3 sm:gap-4 bg-abyss/50 ${
          mobileTab !== 'panels' ? 'hidden lg:flex' : 'flex'
        }`} role="region" aria-label="Visualization panels">
          {/* Call Stack */}
          <div className="glass-card rounded-xl p-3 sm:p-4" role="region" aria-label="Call Stack">
            <CallStack />
          </div>

          {/* Event Loop Indicator */}
          <div className="glass-card rounded-xl p-3 sm:p-4 flex justify-center" role="img" aria-label="Event loop phase indicator">
            <EventLoopIndicator />
          </div>

          {/* Web APIs */}
          <div className="glass-card rounded-xl p-3 sm:p-4" role="region" aria-label="Web APIs">
            <WebAPIsPanel />
          </div>

          {/* Microtask Queue */}
          <div className="glass-card rounded-xl p-3 sm:p-4" role="region" aria-label="Microtask Queue">
            <TaskQueue
              title="Microtask Queue"
              items={microtaskQueue}
              color="lavender"
              emptyLabel="No microtasks"
            />
          </div>

          {/* Macrotask Queue */}
          <div className="glass-card rounded-xl p-3 sm:p-4" role="region" aria-label="Macrotask Queue">
            <TaskQueue
              title="Macrotask Queue"
              items={macrotaskQueue}
              color="coral"
              emptyLabel="No macrotasks"
            />
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-[10px] font-mono text-white/15 text-center px-2 pb-2 hidden lg:block" aria-hidden="true">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mr-1">Space</span> play/pause
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mx-1 ml-3">→</span> step
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mx-1 ml-3">Ctrl+Enter</span> run
          </div>
        </div>
      </div>
    </div>
  );
}
