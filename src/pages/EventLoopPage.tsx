import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, GlassCard, Button, Badge, AnimatedBackground } from '../components/ui';
import { SectionBlock, CodeExample, InteractiveDemo, AnimatedDiagram } from '../components/educational';

/* ── Event Loop Cycle Visual ── */
const LOOP_STEPS = [
  { id: 'stack', label: 'Call Stack', color: 'text-cyan', bg: 'bg-cyan/10 border-cyan/20', desc: 'Execute all synchronous code until the stack is empty.' },
  { id: 'micro', label: 'Microtask Queue', color: 'text-lavender', bg: 'bg-lavender/10 border-lavender/20', desc: 'Drain ALL microtasks — Promises, queueMicrotask, MutationObserver.' },
  { id: 'render', label: 'Render', color: 'text-amber', bg: 'bg-amber/10 border-amber/20', desc: 'Browser may update the UI — requestAnimationFrame runs here.' },
  { id: 'macro', label: 'Macrotask Queue', color: 'text-coral', bg: 'bg-coral/10 border-coral/20', desc: 'Pick ONE macrotask — setTimeout, setInterval, I/O, UI events.' },
];

function LoopCycleDemo() {
  const [active, setActive] = useState(0);

  return (
    <InteractiveDemo
      title="The Event Loop Cycle"
      description="Step through each phase of the event loop. After each macrotask, microtasks are drained again."
    >
      <div className="flex flex-col gap-6">
        {/* Cycle ring */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LOOP_STEPS.map((step, i) => (
            <motion.button
              key={step.id}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative rounded-xl border p-3 text-left transition-all duration-200 ${
                i === active
                  ? step.bg + ' shadow-lg'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono font-bold ${i === active ? step.color : 'text-white/30'}`}>
                  {i + 1}
                </span>
                <span className={`text-xs font-semibold ${i === active ? 'text-white/90' : 'text-white/40'}`}>
                  {step.label}
                </span>
              </div>
              {i === active && (
                <motion.div
                  layoutId="loop-indicator"
                  className={`h-0.5 rounded-full mt-1 ${
                    step.color === 'text-cyan' ? 'bg-cyan' : step.color === 'text-lavender' ? 'bg-lavender' : step.color === 'text-amber' ? 'bg-amber' : 'bg-coral'
                  }`}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl border p-4 ${LOOP_STEPS[active].bg}`}
          >
            <p className={`text-sm font-medium ${LOOP_STEPS[active].color}`}>
              {LOOP_STEPS[active].desc}
            </p>
            {active === 1 && (
              <p className="text-xs text-white/30 mt-2">
                ⚠ Microtasks can enqueue more microtasks — the queue must be fully emptied before moving on.
              </p>
            )}
            {active === 3 && (
              <p className="text-xs text-white/30 mt-2">
                Only ONE macrotask is picked per cycle, then the loop goes back to drain microtasks again.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setActive((active + 1) % LOOP_STEPS.length)}
          className="self-center"
        >
          Next Step →
        </Button>
      </div>
    </InteractiveDemo>
  );
}

/* ── Microtask vs Macrotask Quiz ── */
function TaskQuiz() {
  const questions = [
    { api: 'Promise.then()', answer: 'micro' as const },
    { api: 'setTimeout(fn, 0)', answer: 'macro' as const },
    { api: 'queueMicrotask(fn)', answer: 'micro' as const },
    { api: 'setInterval(fn, 100)', answer: 'macro' as const },
    { api: 'MutationObserver', answer: 'micro' as const },
    { api: 'requestAnimationFrame', answer: 'macro' as const },
    { api: 'fetch().then()', answer: 'micro' as const },
    { api: 'addEventListener("click")', answer: 'macro' as const },
  ];

  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <InteractiveDemo
      title="Micro or Macro?"
      description="Click each API to reveal whether its callback goes to the microtask or macrotask queue."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((q, i) => (
          <motion.button
            key={q.api}
            onClick={() => toggle(i)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-left text-xs font-mono transition-all duration-200 ${
              revealed.has(i)
                ? q.answer === 'micro'
                  ? 'bg-lavender/10 border-lavender/20 text-lavender'
                  : 'bg-coral/10 border-coral/20 text-coral'
                : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04]'
            }`}
          >
            <span>{q.api}</span>
            {revealed.has(i) && (
              <Badge variant={q.answer === 'micro' ? 'lavender' : 'coral'}>
                {q.answer === 'micro' ? 'Microtask' : 'Macrotask'}
              </Badge>
            )}
          </motion.button>
        ))}
      </div>
    </InteractiveDemo>
  );
}

/* ── Main Page ── */
export default function EventLoopPage() {
  return (
    <div className="relative">
      <AnimatedBackground variant="grid" className="opacity-20 fixed inset-0" />

      <PageLayout maxWidth="xl">
        {/* Hero Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-mono text-lavender/60 uppercase tracking-widest mb-4">
              Chapter 02
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              The <span className="gradient-text-cool">Event Loop</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              The event loop is the beating heart of JavaScript's concurrency model.
              It bridges the single-threaded call stack with asynchronous callbacks,
              deciding what runs next.
            </p>
          </motion.div>
        </div>

        {/* ── Section: Why the Event Loop Exists ── */}
        <SectionBlock title="Why It Exists">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-sm text-white/50 leading-relaxed">
              <p>
                JavaScript is single-threaded, but the web is full of asynchronous
                operations — network requests, timers, user interactions. If JS blocked on
                every async operation, your UI would freeze.
              </p>
              <p>
                The event loop solves this. Async operations are <strong className="text-white/80">offloaded to Web APIs</strong> (provided by
                the browser or Node). When they complete, their callbacks are placed in
                queues. The event loop monitors the call stack and queues, picking
                callbacks to run when the stack is empty.
              </p>
              <p>
                This creates a powerful illusion of concurrency while maintaining the
                simplicity of single-threaded execution.
              </p>
            </div>
            <CodeExample
              title="async-flow.js"
              code={`console.log("1 — sync");

setTimeout(() => {
  console.log("2 — macrotask");
}, 0);

Promise.resolve().then(() => {
  console.log("3 — microtask");
});

console.log("4 — sync");

// Output: 1, 4, 3, 2
// Sync first, then micro, then macro`}
            />
          </div>
        </SectionBlock>

        {/* ── Section: The Loop Cycle ── */}
        <SectionBlock title="The Loop Cycle" accent="gradient-text-cool">
          <LoopCycleDemo />
        </SectionBlock>

        {/* ── Section: Microtasks vs Macrotasks ── */}
        <SectionBlock title="Microtasks vs Macrotasks" accent="gradient-text-warm">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard variant="default" padding="lg" glow="lavender">
                <div className="text-xs font-mono uppercase tracking-widest text-lavender mb-3">Microtasks</div>
                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  Higher priority. The entire microtask queue is drained after <em>every</em> task
                  and before any rendering or the next macrotask.
                </p>
                <div className="space-y-1.5">
                  {['Promise.then / catch / finally', 'queueMicrotask()', 'MutationObserver', 'process.nextTick (Node)'].map((item) => (
                    <div key={item} className="text-xs font-mono px-2.5 py-1.5 rounded-md bg-lavender/5 border border-lavender/10 text-lavender/70">
                      {item}
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard variant="default" padding="lg" glow="coral">
                <div className="text-xs font-mono uppercase tracking-widest text-coral mb-3">Macrotasks</div>
                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  Lower priority. Only ONE macrotask is picked per event loop iteration,
                  then microtasks are drained again.
                </p>
                <div className="space-y-1.5">
                  {['setTimeout / setInterval', 'setImmediate (Node)', 'I/O operations', 'UI rendering events', 'requestAnimationFrame'].map((item) => (
                    <div key={item} className="text-xs font-mono px-2.5 py-1.5 rounded-md bg-coral/5 border border-coral/10 text-coral/70">
                      {item}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Priority visualization */}
            <AnimatedDiagram>
              <GlassCard variant="subtle" padding="lg">
                <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-4">Execution Priority</div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {[
                    { label: 'Sync Code', color: 'bg-cyan/20 text-cyan border-cyan/30' },
                    { label: '→', color: 'text-white/20' },
                    { label: 'Microtasks', color: 'bg-lavender/20 text-lavender border-lavender/30' },
                    { label: '→', color: 'text-white/20' },
                    { label: 'Render', color: 'bg-amber/20 text-amber border-amber/30' },
                    { label: '→', color: 'text-white/20' },
                    { label: '1 Macrotask', color: 'bg-coral/20 text-coral border-coral/30' },
                    { label: '→', color: 'text-white/20' },
                    { label: 'Repeat', color: 'bg-mint/20 text-mint border-mint/30' },
                  ].map((item, i) =>
                    item.label === '→' ? (
                      <span key={i} className={`text-center text-lg ${item.color} hidden sm:block`}>→</span>
                    ) : (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className={`flex-1 text-center px-3 py-2 rounded-lg border text-xs font-mono font-semibold ${item.color}`}
                      >
                        {item.label}
                      </motion.div>
                    )
                  )}
                </div>
              </GlassCard>
            </AnimatedDiagram>
          </div>
        </SectionBlock>

        {/* ── Section: Quiz ── */}
        <SectionBlock title="Test Your Knowledge" accent="gradient-text">
          <TaskQuiz />
        </SectionBlock>

        {/* ── Section: Common Pitfalls ── */}
        <SectionBlock title="Common Pitfalls">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'setTimeout(fn, 0) ≠ Immediate',
                desc: 'The 0ms delay is a minimum, not a guarantee. The callback still goes to the macrotask queue and waits for the stack and microtasks to clear.',
                color: 'coral',
              },
              {
                title: 'Microtask Starvation',
                desc: 'If microtasks keep scheduling more microtasks, the event loop can never move to rendering or macrotasks — the UI freezes.',
                color: 'amber',
              },
              {
                title: 'Blocking the Loop',
                desc: 'Long-running synchronous code (heavy loops, JSON.parse on huge data) blocks everything — no callbacks, no rendering, no user interaction.',
                color: 'lavender',
              },
              {
                title: 'Promise vs setTimeout Order',
                desc: 'Promise.then() always fires before setTimeout(fn, 0) because microtasks are processed before the next macrotask.',
                color: 'cyan',
              },
            ].map((pitfall) => (
              <GlassCard key={pitfall.title} variant="default" padding="lg" glow={pitfall.color as 'coral' | 'amber' | 'lavender' | 'cyan'}>
                <div className={`text-xs font-semibold mb-2 ${
                  pitfall.color === 'coral' ? 'text-coral' : pitfall.color === 'amber' ? 'text-amber' : pitfall.color === 'lavender' ? 'text-lavender' : 'text-cyan'
                }`}>
                  {pitfall.title}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{pitfall.desc}</p>
              </GlassCard>
            ))}
          </div>
        </SectionBlock>

        {/* ── Next Chapter CTA ── */}
        <div className="text-center pt-8 border-t border-white/[0.04]">
          <p className="text-white/30 text-sm mb-4">Next chapter</p>
          <Link to="/node-vs-browser">
            <Button variant="outline" size="lg">
              Node vs Browser →
            </Button>
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}
