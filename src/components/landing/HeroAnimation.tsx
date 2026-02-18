import { motion } from 'framer-motion';

const floatVariant = (delay: number, duration: number = 6) => ({
  animate: {
    y: [0, -8, 0],
    transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
  },
});

const pulseVariant = (delay: number) => ({
  animate: {
    opacity: [0.4, 1, 0.4],
    scale: [0.97, 1.03, 0.97],
    transition: { duration: 3, delay, repeat: Infinity, ease: 'easeInOut' },
  },
});

/** Animated visual of Call Stack, Event Loop, Task Queues floating in space */
export default function HeroAnimation() {
  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto aspect-square sm:aspect-auto sm:h-80 lg:h-[340px] select-none" aria-hidden="true">
      {/* Glow backdrop */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-cyan/5 via-transparent to-transparent" />

      {/* ── Call Stack ── */}
      <motion.div
        {...floatVariant(0)}
        className="absolute top-[5%] left-[5%] sm:left-[8%]"
      >
        <div className="glass-card rounded-xl p-2.5 sm:p-3 w-32 sm:w-36 lg:w-40 glow-cyan">
          <div className="text-[10px] font-mono text-cyan/70 uppercase tracking-widest mb-2">Call Stack</div>
          <div className="space-y-1.5">
            {['main()', 'getData()', 'fetch()'].map((fn, i) => (
              <motion.div
                key={fn}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.2, duration: 0.4 }}
                className="bg-cyan/10 border border-cyan/20 rounded-md px-2.5 py-1 text-xs font-mono text-cyan"
              >
                {fn}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Event Loop Indicator ── */}
      <motion.div
        {...floatVariant(0.5, 8)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative w-24 h-24">
          {/* Rotating ring */}
          <motion.svg
            viewBox="0 0 100 100"
            className="w-24 h-24"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#loopGrad)"
              strokeWidth="2"
              strokeDasharray="60 200"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#b48eff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ff3d71" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </motion.svg>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              {...pulseVariant(0)}
              className="text-[9px] font-mono text-white/60 uppercase tracking-wider"
            >
              Loop
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* ── Microtask Queue ── */}
      <motion.div
        {...floatVariant(1)}
        className="absolute top-[5%] right-[3%] sm:right-[6%]"
      >
        <div className="glass-card rounded-xl p-2.5 sm:p-3 w-32 sm:w-36 lg:w-40 glow-lavender">
          <div className="text-[10px] font-mono text-lavender/70 uppercase tracking-widest mb-2">Microtasks</div>
          <div className="space-y-1.5">
            {['.then(cb)', 'queueMicro'].map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.25, duration: 0.4 }}
                className="bg-lavender/10 border border-lavender/20 rounded-md px-2.5 py-1 text-xs font-mono text-lavender"
              >
                {t}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Web APIs ── */}
      <motion.div
        {...floatVariant(1.5, 7)}
        className="absolute bottom-[10%] left-[3%] sm:left-[5%]"
      >
        <div className="glass-card rounded-xl p-2.5 sm:p-3 w-32 sm:w-36 lg:w-40 glow-amber">
          <div className="text-[10px] font-mono text-amber/70 uppercase tracking-widest mb-2">Web APIs</div>
          <div className="space-y-1.5">
            {['setTimeout 2s', 'fetch(url)'].map((api, i) => (
              <motion.div
                key={api}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.2, duration: 0.4 }}
                className="bg-amber/10 border border-amber/20 rounded-md px-2.5 py-1 text-xs font-mono text-amber flex items-center justify-between"
              >
                <span>{api}</span>
                {i === 0 && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[9px] text-amber/50"
                  >
                    ●
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Macrotask Queue ── */}
      <motion.div
        {...floatVariant(2, 7)}
        className="absolute bottom-[5%] right-[3%] sm:right-[5%]"
      >
        <div className="glass-card rounded-xl p-2.5 sm:p-3 w-32 sm:w-36 lg:w-40 glow-coral">
          <div className="text-[10px] font-mono text-coral/70 uppercase tracking-widest mb-2">Macrotasks</div>
          <div className="space-y-1.5">
            {['timer cb'].map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + i * 0.2, duration: 0.4 }}
                className="bg-coral/10 border border-coral/20 rounded-md px-2.5 py-1 text-xs font-mono text-coral"
              >
                {t}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Connecting dotted lines (decorative) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block" viewBox="0 0 500 340">
        <motion.line
          x1="170" y1="80" x2="220" y2="150"
          stroke="rgba(0,240,255,0.15)" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        />
        <motion.line
          x1="280" y1="150" x2="330" y2="80"
          stroke="rgba(180,142,255,0.15)" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 2.7, duration: 1 }}
        />
        <motion.line
          x1="220" y1="190" x2="170" y2="250"
          stroke="rgba(255,170,0,0.15)" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 2.9, duration: 1 }}
        />
        <motion.line
          x1="280" y1="190" x2="330" y2="250"
          stroke="rgba(255,61,113,0.15)" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 3.1, duration: 1 }}
        />
      </svg>
    </div>
  );
}
