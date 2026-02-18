/* ──────────────────────────────────────────────
 *  EventLoopIndicator — Animated ring showing current phase
 * ────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizerStore } from '../../store/visualizerStore';

const PHASES = [
  { id: 'stack', label: 'Stack', color: '#00f0ff' },
  { id: 'microtask', label: 'Micro', color: '#b48eff' },
  { id: 'macrotask', label: 'Macro', color: '#ff3d71' },
  { id: 'webapi', label: 'APIs', color: '#ffaa00' },
];

export default function EventLoopIndicator() {
  const currentPhase = useVisualizerStore((s) => s.currentPhase);
  const playbackState = useVisualizerStore((s) => s.playbackState);

  const activeIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const isRunning = playbackState === 'playing' || playbackState === 'stepping';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        {/* Background ring */}
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="4"
          />
          {/* Phase segments */}
          {PHASES.map((phase, i) => {
            const circumference = 2 * Math.PI * 42;
            const segmentLength = circumference / PHASES.length;
            const gap = 4;
            const dashArray = `${segmentLength - gap} ${circumference - segmentLength + gap}`;
            const offset = -(i * segmentLength);
            const isActive = i === activeIndex;

            return (
              <motion.circle
                key={phase.id}
                cx="50" cy="50" r="42"
                fill="none"
                stroke={phase.color}
                strokeWidth={isActive ? 5 : 3}
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.15,
                  filter: isActive ? `drop-shadow(0 0 6px ${phase.color})` : 'none',
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
                {isRunning ? 'Phase' : 'Event'}
              </div>
              <div
                className="text-sm font-mono font-bold mt-0.5"
                style={{ color: PHASES[activeIndex]?.color ?? 'rgba(255,255,255,0.3)' }}
              >
                {PHASES[activeIndex]?.label ?? 'Loop'}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rotating indicator */}
        {isRunning && (
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: PHASES[activeIndex]?.color ?? '#fff',
                boxShadow: `0 0 8px ${PHASES[activeIndex]?.color ?? '#fff'}`,
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {PHASES.map((phase, i) => (
          <div
            key={phase.id}
            className={`flex items-center gap-1.5 text-[10px] font-mono transition-opacity ${
              i === activeIndex ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: phase.color }}
            />
            <span style={{ color: i === activeIndex ? phase.color : 'rgba(255,255,255,0.5)' }}>
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
