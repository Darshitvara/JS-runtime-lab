/* ──────────────────────────────────────────────
 *  TaskQueue — Horizontal queue for micro/macro tasks
 * ────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import type { QueueItem } from '../../store/visualizerStore';

interface TaskQueueProps {
  title: string;
  items: QueueItem[];
  color: 'lavender' | 'coral' | 'amber' | 'mint' | 'cyan';
  emptyLabel?: string;
}

const COLOR_MAP = {
  cyan: {
    dot: 'bg-cyan',
    border: 'border-cyan/25',
    bg: 'bg-cyan/8',
    text: 'text-cyan',
    glow: 'glow-cyan',
    dimText: 'text-cyan/40',
  },
  lavender: {
    dot: 'bg-lavender',
    border: 'border-lavender/25',
    bg: 'bg-lavender/8',
    text: 'text-lavender',
    glow: 'glow-lavender',
    dimText: 'text-lavender/40',
  },
  coral: {
    dot: 'bg-coral',
    border: 'border-coral/25',
    bg: 'bg-coral/8',
    text: 'text-coral',
    glow: 'glow-coral',
    dimText: 'text-coral/40',
  },
  amber: {
    dot: 'bg-amber',
    border: 'border-amber/25',
    bg: 'bg-amber/8',
    text: 'text-amber',
    glow: 'glow-amber',
    dimText: 'text-amber/40',
  },
  mint: {
    dot: 'bg-mint',
    border: 'border-mint/25',
    bg: 'bg-mint/8',
    text: 'text-mint',
    glow: 'glow-mint',
    dimText: 'text-mint/40',
  },
};

export default function TaskQueue({ title, items, color, emptyLabel = 'Empty' }: TaskQueueProps) {
  const c = COLOR_MAP[color];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${c.dot} ${items.length > 0 ? 'animate-pulse-glow' : 'opacity-40'}`} />
        <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
          {title}
        </h3>
        <span className="ml-auto text-[10px] font-mono text-white/20">
          {items.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[36px] items-start">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-[11px] ${c.border} ${c.bg} ${c.text} ${
                i === 0 ? c.glow : ''
              }`}
            >
              {item.label}
              {i === 0 && (
                <span className={`ml-1.5 text-[9px] ${c.dimText}`}>← next</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <span className="text-[11px] text-white/15 font-mono py-1.5">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}
