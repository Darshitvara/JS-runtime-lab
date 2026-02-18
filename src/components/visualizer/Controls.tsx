/* ──────────────────────────────────────────────
 *  Controls — Playback, speed, mode, examples
 * ────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { useVisualizerStore } from '../../store/visualizerStore';
import { getExamples } from '../../engine';

export default function Controls() {
  const {
    playbackState, speed, steps, stepIndex, mode, code,
    loadAndRun, step, play, pause, reset, setSpeed, setMode, setCode,
  } = useVisualizerStore();

  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const examples = getExamples(mode);

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const example = examples.find((ex) => ex.id === e.target.value);
    if (example) {
      setCode(example.code);
      reset();
    }
  };

  const handleRun = () => {
    loadAndRun();
  };

  const handlePlayPause = () => {
    if (playbackState === 'playing') {
      pause();
    } else {
      if (stepIndex === -1 && steps.length === 0) {
        loadAndRun();
        // Small delay to allow steps to populate, then auto-play
        setTimeout(() => play(), 50);
      } else {
        play();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Top controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Run button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleRun}
          aria-label="Run code"
          className="px-3 py-1.5 rounded-lg bg-mint/15 border border-mint/25 text-mint text-xs font-mono font-semibold hover:bg-mint/20 transition-colors"
        >
          Run
        </motion.button>

        {/* Play / Pause */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handlePlayPause}
          disabled={totalSteps === 0 && playbackState === 'idle'}
          aria-label={playbackState === 'playing' ? 'Pause playback' : 'Play execution'}
          className="px-3 py-1.5 rounded-lg bg-cyan/15 border border-cyan/25 text-cyan text-xs font-mono font-semibold hover:bg-cyan/20 transition-colors disabled:opacity-30"
        >
          {playbackState === 'playing' ? '⏸ Pause' : '▶ Play'}
        </motion.button>

        {/* Step */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={step}
          disabled={totalSteps === 0 || stepIndex >= totalSteps - 1}
          aria-label="Step forward one execution step"
          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-mono font-semibold hover:bg-white/[0.07] transition-colors disabled:opacity-30"
        >
          Step →
        </motion.button>

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          aria-label="Reset execution"
          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-mono font-semibold hover:bg-white/[0.07] transition-colors"
        >
          ↺ Reset
        </motion.button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg border border-white/[0.06] p-0.5" role="radiogroup" aria-label="Runtime mode">
          <button
            onClick={() => { setMode('browser'); reset(); }}
            role="radio"
            aria-checked={mode === 'browser'}
            aria-label="Browser mode"
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
              mode === 'browser'
                ? 'bg-cyan/15 text-cyan border border-cyan/20'
                : 'text-white/30 hover:text-white/50 border border-transparent'
            }`}
          >
            Browser
          </button>
          <button
            onClick={() => { setMode('node'); reset(); }}
            role="radio"
            aria-checked={mode === 'node'}
            aria-label="Node.js mode"
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
              mode === 'node'
                ? 'bg-mint/15 text-mint border border-mint/20'
                : 'text-white/30 hover:text-white/50 border border-transparent'
            }`}
          >
            Node.js
          </button>
        </div>
      </div>

      {/* Speed + Examples row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/25" id="speed-label">Speed</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={2100 - speed}
            onChange={(e) => setSpeed(2100 - Number(e.target.value))}
            aria-labelledby="speed-label"
            aria-valuemin={100}
            aria-valuemax={2000}
            aria-valuenow={speed}
            aria-valuetext={`${speed} milliseconds per step`}
            className="w-20 h-1 accent-cyan cursor-pointer"
          />
          <span className="text-[10px] font-mono text-white/25 w-10">
            {speed}ms
          </span>
        </div>

        {/* Example dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="example-select" className="text-[10px] font-mono text-white/25">Example</label>
          <select
            id="example-select"
            onChange={handleExampleChange}
            value=""
            aria-label="Load example code"
            className="bg-white/[0.04] border border-white/[0.08] rounded-md text-[11px] font-mono text-white/60 px-2 py-1 cursor-pointer outline-none focus:border-cyan/30"
          >
            <option value="" disabled>
              Load example...
            </option>
            {examples.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-slate-deep text-white/80">
                {ex.title}
              </option>
            ))}
          </select>
        </div>

        {/* Step counter */}
        {totalSteps > 0 && (
          <span className="text-[10px] font-mono text-white/20 ml-auto" aria-live="polite" aria-atomic="true">
            Step {stepIndex + 1} / {totalSteps}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Execution progress">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #b48eff)',
            }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}
    </div>
  );
}
