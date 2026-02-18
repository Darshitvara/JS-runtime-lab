/* ──────────────────────────────────────────────
 *  Zustand Store — Visualizer State
 *  Manages call stack, queues, console, playback controls.
 * ────────────────────────────────────────────── */

import { create } from 'zustand';
import {
  type ExecutionStep,
  type StackFrame,
  type ConsoleEntry,
  type RuntimeMode,
  ExecutionEngine,
} from '../engine';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Playback State ──
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stepping' | 'finished';

// ── Queue Item (for UI display) ──
export interface QueueItem {
  id: string;
  label: string;
}

// ── Web API Item (for UI display) ──
export interface WebAPIItem {
  id: number;
  label: string;
  delay: number;
  progress: number; // 0-1
  resolved: boolean;
}

// ── Store State ──
export interface VisualizerState {
  // Code
  code: string;
  mode: RuntimeMode;

  // Engine output
  steps: ExecutionStep[];
  stepIndex: number;

  // Visual state (derived per step)
  callStack: StackFrame[];
  microtaskQueue: QueueItem[];
  macrotaskQueue: QueueItem[];
  webAPIs: WebAPIItem[];
  consoleOutput: ConsoleEntry[];
  currentLine: number | null;
  currentPhase: string; // 'idle' | 'stack' | 'microtask' | 'macrotask' | 'webapi'

  // Playback
  playbackState: PlaybackState;
  speed: number; // ms per step
  error: string | null;

  // Actions
  setCode: (code: string) => void;
  setMode: (mode: RuntimeMode) => void;
  setSpeed: (speed: number) => void;
  loadAndRun: () => void;
  step: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  goToStep: (index: number) => void;
}

// ── Reconstruct visual state from steps[0..index] ──
function reconstructState(steps: ExecutionStep[], index: number) {
  const callStack: StackFrame[] = [];
  const microtaskQueue: QueueItem[] = [];
  const macrotaskQueue: QueueItem[] = [];
  const webAPIs: WebAPIItem[] = [];
  const consoleOutput: ConsoleEntry[] = [];
  let currentLine: number | null = null;
  let currentPhase = 'idle';

  for (let i = 0; i <= index && i < steps.length; i++) {
    const step = steps[i];

    switch (step.type) {
      case 'PUSH_STACK':
        callStack.push({
          id: step.payload.id as string,
          name: step.payload.name as string,
          line: (step.line ?? 0) as number,
        });
        currentPhase = 'stack';
        break;

      case 'POP_STACK':
        callStack.pop();
        break;

      case 'HIGHLIGHT_LINE':
        currentLine = step.line ?? null;
        break;

      case 'SCHEDULE_MICROTASK':
        microtaskQueue.push({
          id: step.payload.id as string ?? `micro-${i}`,
          label: step.payload.label as string,
        });
        break;

      case 'DEQUEUE_MICROTASK':
        microtaskQueue.shift();
        break;

      case 'EXECUTE_MICROTASK':
        currentPhase = 'microtask';
        break;

      case 'SCHEDULE_MACROTASK':
        macrotaskQueue.push({
          id: step.payload.id as string ?? `macro-${i}`,
          label: step.payload.label as string,
        });
        break;

      case 'DEQUEUE_MACROTASK':
        macrotaskQueue.shift();
        break;

      case 'EXECUTE_MACROTASK':
        currentPhase = 'macrotask';
        break;

      case 'REGISTER_WEB_API': {
        const delay = step.payload.delay as number;
        webAPIs.push({
          id: step.payload.id as number,
          label: step.payload.label as string,
          delay,
          progress: 0,
          resolved: false,
        });
        currentPhase = 'webapi';
        break;
      }

      case 'RESOLVE_WEB_API': {
        const apiId = step.payload.id as number;
        const api = webAPIs.find((w) => w.id === apiId);
        if (api) {
          api.resolved = true;
          api.progress = 1;
        }
        break;
      }

      case 'EVENT_LOOP_CHECK':
        currentPhase = step.payload.phase as string;
        break;

      case 'CONSOLE_LOG':
        consoleOutput.push({
          type: 'log',
          args: step.payload.args as unknown[],
          timestamp: step.timestamp,
        });
        break;

      case 'CONSOLE_WARN':
        consoleOutput.push({
          type: 'warn',
          args: step.payload.args as unknown[],
          timestamp: step.timestamp,
        });
        break;

      case 'CONSOLE_ERROR':
        consoleOutput.push({
          type: 'error',
          args: step.payload.args as unknown[],
          timestamp: step.timestamp,
        });
        break;
    }
  }

  return { callStack, microtaskQueue, macrotaskQueue, webAPIs, consoleOutput, currentLine, currentPhase };
}

// ── Playback timer ──
let playTimer: ReturnType<typeof setInterval> | null = null;

// ── Create Store ──
export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  // Initial state
  code: `console.log("Hello");

setTimeout(function timer() {
  console.log("Timeout");
}, 0);

Promise.resolve().then(function micro() {
  console.log("Microtask");
});

console.log("End");`,

  mode: 'browser',
  steps: [],
  stepIndex: -1,

  callStack: [],
  microtaskQueue: [],
  macrotaskQueue: [],
  webAPIs: [],
  consoleOutput: [],
  currentLine: null,
  currentPhase: 'idle',

  playbackState: 'idle',
  speed: 800,
  error: null,

  // Actions
  setCode: (code) => set({ code }),

  setMode: (mode) => set({ mode }),

  setSpeed: (speed) => set({ speed }),

  loadAndRun: () => {
    const { code, mode } = get();
    if (playTimer) { clearInterval(playTimer); playTimer = null; }

    try {
      const engine = new ExecutionEngine(mode);
      const steps = engine.run(code);

      set({
        steps,
        stepIndex: -1,
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: [],
        consoleOutput: [],
        currentLine: null,
        currentPhase: 'idle',
        playbackState: 'idle',
        error: engine.errors.length > 0 ? engine.errors[0] : null,
      });
    } catch (err: any) {
      set({
        error: err.message ?? 'Execution error',
        steps: [],
        stepIndex: -1,
        playbackState: 'idle',
      });
    }
  },

  step: () => {
    const { steps, stepIndex } = get();
    if (stepIndex >= steps.length - 1) {
      set({ playbackState: 'finished' });
      return;
    }

    const nextIndex = stepIndex + 1;
    const state = reconstructState(steps, nextIndex);
    set({
      stepIndex: nextIndex,
      ...state,
      playbackState: nextIndex >= steps.length - 1 ? 'finished' : 'stepping',
    });
  },

  play: () => {
    const { steps, stepIndex } = get();
    if (stepIndex >= steps.length - 1) return;

    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    set({ playbackState: 'playing' });

    const tick = () => {
      const { steps, stepIndex, playbackState } = get();

      if (playbackState !== 'playing' || stepIndex >= steps.length - 1) {
        if (playTimer) { clearInterval(playTimer); playTimer = null; }
        if (stepIndex >= steps.length - 1) set({ playbackState: 'finished' });
        return;
      }

      const nextIndex = stepIndex + 1;
      const state = reconstructState(steps, nextIndex);
      set({
        stepIndex: nextIndex,
        ...state,
        playbackState: nextIndex >= steps.length - 1 ? 'finished' : 'playing',
      });

      // Reschedule with current speed to support dynamic speed changes
      if (playTimer) { clearInterval(playTimer); playTimer = null; }
      if (get().playbackState === 'playing') {
        playTimer = setInterval(tick, get().speed);
      }
    };

    playTimer = setInterval(tick, get().speed);
  },

  pause: () => {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    set({ playbackState: 'paused' });
  },

  reset: () => {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    set({
      stepIndex: -1,
      callStack: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      webAPIs: [],
      consoleOutput: [],
      currentLine: null,
      currentPhase: 'idle',
      playbackState: 'idle',
      error: null,
    });
  },

  goToStep: (index: number) => {
    const { steps } = get();
    const clamped = Math.max(-1, Math.min(index, steps.length - 1));
    if (clamped < 0) {
      set({
        stepIndex: -1,
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: [],
        consoleOutput: [],
        currentLine: null,
        currentPhase: 'idle',
      });
      return;
    }
    const state = reconstructState(steps, clamped);
    set({
      stepIndex: clamped,
      ...state,
      playbackState: clamped >= steps.length - 1 ? 'finished' : 'paused',
    });
  },
}));
