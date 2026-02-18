import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, GlassCard, Button, AnimatedBackground } from '../components/ui';
import { SectionBlock, CodeExample, InteractiveDemo, AnimatedDiagram } from '../components/educational';

/* ── Interactive Call Stack Demo ── */
function CallStackDemo() {
  const [stack, setStack] = useState<string[]>([]);
  const frames = ['main()', 'greet("world")', 'console.log()'];

  const pushNext = () => {
    if (stack.length < frames.length) {
      setStack([...stack, frames[stack.length]]);
    }
  };

  const pop = () => {
    if (stack.length > 0) {
      setStack(stack.slice(0, -1));
    }
  };

  const reset = () => setStack([]);

  return (
    <InteractiveDemo
      title="Call Stack — Push & Pop"
      description="Click to push frames onto the stack, then pop them off. Notice LIFO order."
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Stack visualization */}
        <div className="flex-1 min-h-[180px] bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 flex flex-col-reverse gap-1.5">
          <AnimatePresence>
            {stack.map((frame, i) => (
              <motion.div
                key={`${frame}-${i}`}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`px-3 py-2 rounded-lg font-mono text-xs border ${
                  i === stack.length - 1
                    ? 'bg-cyan/15 border-cyan/30 text-cyan glow-cyan'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/60'
                }`}
              >
                {frame}
                {i === stack.length - 1 && (
                  <span className="ml-2 text-[10px] text-cyan/50">← top</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {stack.length === 0 && (
            <div className="flex items-center justify-center h-full text-xs text-white/20">
              Stack is empty
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={pushNext} disabled={stack.length >= frames.length}>
            Push
          </Button>
          <Button size="sm" variant="secondary" onClick={pop} disabled={stack.length === 0}>
            Pop
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>
    </InteractiveDemo>
  );
}

/* ── Main Page ── */
export default function AboutRuntimePage() {
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              The JavaScript <span className="gradient-text-cool">Runtime</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              JavaScript is single-threaded — it can only do one thing at a time.
              Understanding how the runtime organizes execution is the foundation for
              mastering async behavior.
            </p>
          </motion.div>
        </div>

        {/* ── Section: Single-Threaded Model ── */}
        <SectionBlock title="Single-Threaded by Design">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-sm text-white/50 leading-relaxed">
              <p>
                Unlike languages such as Java or C++ that can spawn multiple threads,
                JavaScript runs all your code on a <strong className="text-white/80">single thread</strong> of execution.
                This means there's only <em>one</em> call stack, and only <em>one</em> thing
                happens at any given moment.
              </p>
              <p>
                This design simplifies things enormously — no race conditions, no deadlocks,
                no mutex locks. But it also means if any operation blocks
                (like a heavy computation), <strong className="text-white/80">everything else freezes</strong> until it completes.
              </p>
              <p>
                That's why JavaScript relies on <strong className="text-white/80">asynchronous callbacks</strong>,
                the event loop, and Web APIs to handle I/O, timers, and network requests
                without blocking the main thread.
              </p>
            </div>
            <GlassCard variant="subtle" padding="lg">
              <CodeExample
                title="blocking.js"
                code={`// This blocks the thread for ~3 seconds
function heavyWork() {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // spinning... UI is frozen!
  }
  console.log("Done");
}

heavyWork();
console.log("This waits 3s");`}
              />
            </GlassCard>
          </div>
        </SectionBlock>

        {/* ── Section: Runtime Architecture ── */}
        <SectionBlock title="Runtime Architecture" accent="gradient-text">
          <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-3xl">
            The JS runtime consists of several key components working together.
            The engine (V8, SpiderMonkey, etc.) provides the heap and call stack,
            while the browser or Node.js environment provides Web APIs and the event loop.
          </p>

          <AnimatedDiagram>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Memory Heap',
                  desc: 'Where objects, functions, and variables are stored. Memory is allocated dynamically and garbage collected automatically.',
                  color: 'lavender',
                  items: ['Objects', 'Functions', 'Closures'],
                },
                {
                  title: 'Call Stack',
                  desc: 'A LIFO data structure that tracks which function is currently executing and what to return to when it completes.',
                  color: 'cyan',
                  items: ['Execution Contexts', 'Stack Frames', 'Return Addresses'],
                },
                {
                  title: 'Web APIs',
                  desc: 'Provided by the host environment (browser/Node). Handle async operations outside the main thread.',
                  color: 'amber',
                  items: ['setTimeout', 'fetch', 'DOM Events'],
                },
              ].map((component, i) => (
                <motion.div
                  key={component.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <GlassCard variant="default" padding="lg" className="h-full">
                    <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${
                      component.color === 'lavender' ? 'text-lavender' : component.color === 'cyan' ? 'text-cyan' : 'text-amber'
                    }`}>
                      {component.title}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed mb-4">{component.desc}</p>
                    <div className="space-y-1.5">
                      {component.items.map((item) => (
                        <div
                          key={item}
                          className={`text-xs font-mono px-2.5 py-1.5 rounded-md ${
                            component.color === 'lavender' ? 'bg-lavender/5 border border-lavender/10 text-lavender/70'
                            : component.color === 'cyan' ? 'bg-cyan/5 border border-cyan/10 text-cyan/70'
                            : 'bg-amber/5 border border-amber/10 text-amber/70'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </AnimatedDiagram>
        </SectionBlock>

        {/* ── Section: The Call Stack ── */}
        <SectionBlock title="The Call Stack" accent="gradient-text-cool">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 text-sm text-white/50 leading-relaxed">
                <p>
                  The call stack is a <strong className="text-white/80">LIFO (Last In, First Out)</strong> data
                  structure. When a function is called, a new <em>stack frame</em> is pushed
                  containing the function's arguments, local variables, and return address.
                </p>
                <p>
                  When the function returns, its frame is <strong className="text-white/80">popped off</strong> and
                  execution resumes in the calling function. If the stack gets too deep
                  (e.g., infinite recursion), you get a <code className="text-coral font-mono text-xs">RangeError: Maximum call stack size exceeded</code>.
                </p>
                <p>
                  Each time the stack empties, the event loop gets a chance to process
                  pending callbacks from the task queues — this is the fundamental
                  rhythm of JavaScript execution.
                </p>
              </div>
              <CodeExample
                title="stack-trace.js"
                code={`function third() {
  console.log("third");
  // Stack: [main, first, second, third]
}

function second() {
  third();
  // Stack: [main, first, second]
}

function first() {
  second();
  // Stack: [main, first]
}

first();
// Stack: [main]
// After all return → Stack: []`}
              />
            </div>

            {/* Interactive demo */}
            <CallStackDemo />
          </div>
        </SectionBlock>

        {/* ── Section: Execution Context ── */}
        <SectionBlock title="Execution Contexts" accent="gradient-text-warm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-sm text-white/50 leading-relaxed">
              <p>
                Every time JavaScript runs code, it creates an <strong className="text-white/80">execution context</strong> —
                a wrapper around the currently executing code. There are three types:
              </p>
              <ul className="space-y-3">
                {[
                  { label: 'Global Execution Context', desc: 'Created once when the script starts. Sets up the global object (window/global) and this binding.', color: 'text-cyan' },
                  { label: 'Function Execution Context', desc: 'Created every time a function is invoked. Has its own scope, arguments object, and this.', color: 'text-lavender' },
                  { label: 'Eval Execution Context', desc: 'Created when code runs inside eval(). Rarely used and generally discouraged.', color: 'text-amber' },
                ].map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <span className={`${item.color} text-lg leading-none mt-0.5`}>•</span>
                    <div>
                      <strong className="text-white/80 text-xs">{item.label}</strong>
                      <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p>
                Each context goes through two phases: the <strong className="text-white/80">Creation Phase</strong> (hoisting
                variables and functions) and the <strong className="text-white/80">Execution Phase</strong> (running code line by line).
              </p>
            </div>
            <GlassCard variant="subtle" padding="lg">
              <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-4">Context Lifecycle</div>
              <div className="space-y-3">
                {[
                  { phase: '1. Creation', detail: 'Scope chain created, variables hoisted (var → undefined, let/const → TDZ), this determined', color: 'bg-cyan/10 border-cyan/20 text-cyan' },
                  { phase: '2. Execution', detail: 'Code runs line by line, variables assigned, functions called, stack frames managed', color: 'bg-lavender/10 border-lavender/20 text-lavender' },
                  { phase: '3. Teardown', detail: 'Frame popped from stack, local variables eligible for GC, control returned to caller', color: 'bg-coral/10 border-coral/20 text-coral' },
                ].map((step) => (
                  <motion.div
                    key={step.phase}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-lg border px-4 py-3 ${step.color}`}
                  >
                    <div className="font-semibold text-xs mb-1">{step.phase}</div>
                    <div className="text-[11px] opacity-70">{step.detail}</div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </SectionBlock>

        {/* ── Next Chapter CTA ── */}
        <div className="text-center pt-8 border-t border-white/[0.04]">

          <Link to="/event-loop">
            <Button variant="outline" size="lg">
              Event Loop Deep Dive →
            </Button>
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}
