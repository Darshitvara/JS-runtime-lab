/* ──────────────────────────────────────────────
 *  ConsoleOutput — Terminal-style console panel
 * ────────────────────────────────────────────── */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizerStore } from '../../store/visualizerStore';

export default function ConsoleOutput() {
  const consoleOutput = useVisualizerStore((s) => s.consoleOutput);
  const error = useVisualizerStore((s) => s.error);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-coral/60" />
          <div className="w-2 h-2 rounded-full bg-amber/60" />
          <div className="w-2 h-2 rounded-full bg-mint/60" />
        </div>
        <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
          Console
        </h3>
        <span className="ml-auto text-[10px] font-mono text-white/20">
          {consoleOutput.length} line{consoleOutput.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto bg-black/30 rounded-lg border border-white/[0.04] p-3 font-mono text-xs min-h-[80px]">
        <AnimatePresence>
          {consoleOutput.map((entry, i) => {
            const colorClass =
              entry.type === 'error' ? 'text-coral' :
              entry.type === 'warn' ? 'text-amber' :
              'text-mint';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-2 py-0.5 ${colorClass}`}
              >
                <span className="text-white/10 select-none shrink-0 w-5 text-right">
                  {i + 1}
                </span>
                <span className="break-all">
                  {entry.type === 'error' && <span className="text-coral/50 mr-1">!</span>}
                  {entry.type === 'warn' && <span className="text-amber/50 mr-1">!</span>}
                  {Array.isArray(entry.args) ? entry.args.join(' ') : String(entry.args)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {error && consoleOutput.length === 0 && (
          <div className="text-coral text-xs py-1">
            <span className="text-coral/50">Error: </span>{error}
          </div>
        )}

        {consoleOutput.length === 0 && !error && (
          <div className="text-white/10 text-[11px] py-1">
            // output will appear here
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
