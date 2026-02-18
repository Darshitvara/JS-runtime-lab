/* ──────────────────────────────────────────────
 *  WebAPIsPanel — Shows active timers/APIs
 * ────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizerStore } from '../../store/visualizerStore';

export default function WebAPIsPanel() {
  const webAPIs = useVisualizerStore((s) => s.webAPIs);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full bg-amber ${webAPIs.length > 0 ? 'animate-pulse-glow' : 'opacity-40'}`} />
        <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
          Web APIs
        </h3>
        <span className="ml-auto text-[10px] font-mono text-white/20">
          {webAPIs.filter((w) => !w.resolved).length} active
        </span>
      </div>

      <div className="space-y-1.5 min-h-[36px]">
        <AnimatePresence mode="popLayout">
          {webAPIs.filter((w) => !w.resolved).map((api) => (
            <motion.div
              key={api.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber/20 bg-amber/5"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-amber truncate">{api.label}</div>
              </div>
              <div className="text-[10px] font-mono text-amber/40 shrink-0">
                {api.delay}ms
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {webAPIs.filter((w) => !w.resolved).length === 0 && (
          <span className="text-[11px] text-white/15 font-mono">No active APIs</span>
        )}
      </div>
    </div>
  );
}
