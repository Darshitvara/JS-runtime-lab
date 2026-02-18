import { useEffect, useCallback } from 'react';
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

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if user is typing in editor or an input
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
    <div className="h-[calc(100vh-64px)] flex flex-col bg-void overflow-hidden">
      {/* Controls bar */}
      <div className="shrink-0 px-3 sm:px-4 py-2.5 border-b border-white/[0.04] glass-strong">
        <Controls />
      </div>

      {/* Main grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
        {/* ── Left: Editor + Console ── */}
        <div className="flex flex-col overflow-hidden border-r border-white/[0.04]">
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor />
          </div>

          {/* Console */}
          <div className="h-[180px] sm:h-[200px] shrink-0 border-t border-white/[0.04] p-3 overflow-hidden">
            <ConsoleOutput />
          </div>
        </div>

        {/* ── Right: Visualization Panels ── */}
        <div className="flex flex-col overflow-y-auto p-3 sm:p-4 gap-4 bg-abyss/50">
          {/* Call Stack */}
          <div className="glass-card rounded-xl p-3 sm:p-4">
            <CallStack />
          </div>

          {/* Event Loop Indicator */}
          <div className="glass-card rounded-xl p-3 sm:p-4 flex justify-center">
            <EventLoopIndicator />
          </div>

          {/* Web APIs */}
          <div className="glass-card rounded-xl p-3 sm:p-4">
            <WebAPIsPanel />
          </div>

          {/* Microtask Queue */}
          <div className="glass-card rounded-xl p-3 sm:p-4">
            <TaskQueue
              title="Microtask Queue"
              items={microtaskQueue}
              color="lavender"
              emptyLabel="No microtasks"
            />
          </div>

          {/* Macrotask Queue */}
          <div className="glass-card rounded-xl p-3 sm:p-4">
            <TaskQueue
              title="Macrotask Queue"
              items={macrotaskQueue}
              color="coral"
              emptyLabel="No macrotasks"
            />
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-[10px] font-mono text-white/15 text-center px-2 pb-2">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mr-1">Space</span> play/pause
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mx-1 ml-3">→</span> step
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mx-1 ml-3">Ctrl+Enter</span> run
          </div>
        </div>
      </div>
    </div>
  );
}
