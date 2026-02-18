/* ──────────────────────────────────────────────
 *  CallStack — Vertical stack visualization
 * ────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizerStore } from '../../store/visualizerStore';

export default function CallStack() {
  const callStack = useVisualizerStore((s) => s.callStack);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-cyan animate-pulse-glow" />
        <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
          Call Stack
        </h3>
        <span className="ml-auto text-[10px] font-mono text-white/20">
          {callStack.length} frame{callStack.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 flex flex-col-reverse gap-1.5 min-h-[120px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {callStack.map((frame, i) => {
            const isTop = i === callStack.length - 1;
            return (
              <motion.div
                key={frame.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative px-3 py-2 rounded-lg font-mono text-xs border transition-colors ${
                  isTop
                    ? 'bg-cyan/10 border-cyan/25 text-cyan glow-cyan'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{frame.name}</span>
                  {frame.line > 0 && (
                    <span className={`text-[10px] shrink-0 ${isTop ? 'text-cyan/40' : 'text-white/15'}`}>
                      :{frame.line}
                    </span>
                  )}
                </div>
                {isTop && (
                  <motion.div
                    layoutId="stack-top-indicator"
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-cyan"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {callStack.length === 0 && (
          <div className="flex items-center justify-center h-full text-[11px] text-white/15 font-mono">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}
