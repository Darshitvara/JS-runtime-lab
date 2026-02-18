import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, GlassCard, Button, Badge, AnimatedBackground } from '../components/ui';
import { SectionBlock, CodeExample, InteractiveDemo, AnimatedDiagram } from '../components/educational';

/* ── Comparison data ── */
const COMPARISONS = [
  {
    feature: 'Global Object',
    browser: { value: 'window', detail: 'Also: self, frames, globalThis' },
    node: { value: 'global', detail: 'Also: globalThis (v12+)' },
  },
  {
    feature: 'Module System',
    browser: { value: 'ES Modules', detail: '<script type="module">, import/export' },
    node: { value: 'CommonJS + ESM', detail: 'require/module.exports, .mjs for ESM' },
  },
  {
    feature: 'DOM Access',
    browser: { value: '✓ Yes', detail: 'document, querySelector, events' },
    node: { value: '✗ No', detail: 'No DOM. Use jsdom or happy-dom for testing' },
  },
  {
    feature: 'File System',
    browser: { value: '✗ Limited', detail: 'File API, Origin Private FS (partial)' },
    node: { value: '✓ Full', detail: 'fs module — read, write, watch, stream' },
  },
  {
    feature: 'Timers',
    browser: { value: 'setTimeout, rAF', detail: 'requestAnimationFrame for rendering' },
    node: { value: 'setTimeout, setImmediate', detail: 'setImmediate fires after I/O in current loop' },
  },
  {
    feature: 'Microtask Extra',
    browser: { value: 'queueMicrotask', detail: 'Standard microtask API' },
    node: { value: 'process.nextTick', detail: 'Fires before other microtasks (Node-specific)' },
  },
  {
    feature: 'Event Loop',
    browser: { value: 'HTML spec loop', detail: 'Task → Microtask → Render → Repeat' },
    node: { value: 'libuv 6-phase loop', detail: 'Timers → Pending → Poll → Check → Close' },
  },
];

/* ── Node Event Loop Phases ── */
const NODE_PHASES = [
  { name: 'Timers', detail: 'Execute setTimeout and setInterval callbacks whose threshold has elapsed.', color: 'cyan' },
  { name: 'Pending Callbacks', detail: 'Execute I/O callbacks deferred to the next iteration (e.g., TCP errors).', color: 'lavender' },
  { name: 'Idle / Prepare', detail: 'Internal housekeeping — rarely relevant to user code.', color: 'amber' },
  { name: 'Poll', detail: 'Retrieve new I/O events. Execute I/O-related callbacks. Node may block here waiting for events.', color: 'mint' },
  { name: 'Check', detail: 'setImmediate() callbacks fire here — right after the poll phase.', color: 'coral' },
  { name: 'Close Callbacks', detail: 'Handle close events: socket.on("close"), server.close().', color: 'lavender' },
];

/* ── Interactive Comparison Table ── */
function ComparisonExplorer() {
  const [selected, setSelected] = useState(0);

  return (
    <InteractiveDemo
      title="Feature Comparison"
      description="Click a row to see details about how the feature differs."
    >
      <div className="space-y-1.5">
        {COMPARISONS.map((item, i) => (
          <motion.button
            key={item.feature}
            onClick={() => setSelected(i)}
            whileTap={{ scale: 0.99 }}
            className={`w-full grid grid-cols-3 gap-2 text-left px-3 py-2.5 rounded-lg border text-xs transition-all duration-200 ${
              i === selected
                ? 'bg-cyan/5 border-cyan/20'
                : 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'
            }`}
          >
            <span className={`font-semibold ${i === selected ? 'text-white/90' : 'text-white/50'}`}>
              {item.feature}
            </span>
            <span className={`font-mono ${i === selected ? 'text-cyan' : 'text-white/30'}`}>
              {item.browser.value}
            </span>
            <span className={`font-mono ${i === selected ? 'text-mint' : 'text-white/30'}`}>
              {item.node.value}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
        >
          <div className="rounded-lg border border-cyan/15 bg-cyan/5 p-3">
            <Badge variant="cyan" className="mb-2">Browser</Badge>
            <p className="text-xs text-white/50">{COMPARISONS[selected].browser.detail}</p>
          </div>
          <div className="rounded-lg border border-mint/15 bg-mint/5 p-3">
            <Badge variant="mint" className="mb-2">Node.js</Badge>
            <p className="text-xs text-white/50">{COMPARISONS[selected].node.detail}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </InteractiveDemo>
  );
}

/* ── Node Phase Walker ── */
function NodePhaseWalker() {
  const [active, setActive] = useState(0);

  return (
    <InteractiveDemo
      title="Node.js Event Loop Phases"
      description="libuv drives Node's event loop through 6 distinct phases each iteration."
    >
      <div className="flex flex-col gap-4">
        {/* Phase ring */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {NODE_PHASES.map((phase, i) => (
            <motion.button
              key={phase.name}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-lg border p-2.5 text-center transition-all ${
                i === active
                  ? `border-${phase.color}/30 bg-${phase.color}/10`
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
              style={i === active ? {
                borderColor: `var(--color-${phase.color})30`,
                backgroundColor: `color-mix(in srgb, var(--color-${phase.color}) 10%, transparent)`,
              } : undefined}
            >
              <div className={`text-[10px] font-mono font-bold ${i === active ? '' : 'text-white/25'}`}
                style={i === active ? { color: `var(--color-${phase.color})` } : undefined}
              >
                Phase {i + 1}
              </div>
              <div className={`text-xs font-semibold mt-0.5 ${i === active ? 'text-white/90' : 'text-white/40'}`}>
                {phase.name}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
          >
            <div className="text-sm font-semibold text-white/80 mb-1">{NODE_PHASES[active].name}</div>
            <p className="text-xs text-white/40 leading-relaxed">{NODE_PHASES[active].detail}</p>
          </motion.div>
        </AnimatePresence>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setActive((active + 1) % NODE_PHASES.length)}
          className="self-center"
        >
          Next Phase →
        </Button>
      </div>
    </InteractiveDemo>
  );
}

/* ── Main Page ── */
export default function NodeVsBrowserPage() {
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
            <span className="inline-block text-xs font-mono text-mint/60 uppercase tracking-widest mb-4">
              Chapter 03
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              <span className="gradient-text-cool">Node</span> vs <span className="gradient-text-warm">Browser</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Both runtimes execute JavaScript, but they differ in APIs, module systems,
              and crucially — how their event loops work under the hood.
            </p>
          </motion.div>
        </div>

        {/* ── Section: Same Engine, Different Environment ── */}
        <SectionBlock title="Same Engine, Different World">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-sm text-white/50 leading-relaxed">
              <p>
                Both Chrome and Node.js use the <strong className="text-white/80">V8 engine</strong> to compile
                and execute JavaScript. V8 provides the parser, compiler, garbage collector,
                and the call stack. Everything else is provided by the <em>host environment</em>.
              </p>
              <p>
                The browser gives you <strong className="text-white/80">DOM APIs, Web APIs</strong> (fetch, setTimeout),
                and manages rendering. Node.js gives you <strong className="text-white/80">file system, networking, process</strong> APIs,
                and uses <strong className="text-white/80">libuv</strong> for its event loop.
              </p>
              <p>
                This means the same JavaScript syntax and semantics work in both, but the
                available APIs and the order of async operations can differ significantly.
              </p>
            </div>
            <AnimatedDiagram>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GlassCard variant="default" padding="md" glow="cyan">
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan mb-3">Browser</div>
                  <div className="space-y-1.5">
                    {['V8 / SpiderMonkey', 'window object', 'DOM & CSSOM', 'fetch / XMLHttpRequest', 'Web Workers', 'localStorage'].map((item) => (
                      <div key={item} className="text-xs font-mono px-2 py-1.5 rounded bg-cyan/5 border border-cyan/10 text-cyan/60">
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard variant="default" padding="md" glow="mint">
                  <div className="text-xs font-mono uppercase tracking-widest text-mint mb-3">Node.js</div>
                  <div className="space-y-1.5">
                    {['V8 engine', 'global object', 'fs / path / os', 'http / https', 'Worker Threads', 'Buffer / Stream'].map((item) => (
                      <div key={item} className="text-xs font-mono px-2 py-1.5 rounded bg-mint/5 border border-mint/10 text-mint/60">
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </AnimatedDiagram>
          </div>
        </SectionBlock>

        {/* ── Section: Feature Comparison ── */}
        <SectionBlock title="Side-by-Side Comparison" accent="gradient-text-cool">
          <ComparisonExplorer />
        </SectionBlock>

        {/* ── Section: Node Event Loop ── */}
        <SectionBlock title="Node.js Event Loop Phases" accent="gradient-text-warm">
          <div className="space-y-6">
            <div className="text-sm text-white/50 leading-relaxed max-w-3xl">
              <p>
                Unlike the browser's simpler "task → microtask → render" cycle, Node.js
                uses <strong className="text-white/80">libuv</strong> which divides each event loop iteration
                into <strong className="text-white/80">six distinct phases</strong>. Between each phase, microtasks
                (Promise callbacks) and <code className="text-mint font-mono text-xs">process.nextTick()</code> callbacks
                are drained.
              </p>
            </div>
            <NodePhaseWalker />
          </div>
        </SectionBlock>

        {/* ── Section: process.nextTick vs queueMicrotask ── */}
        <SectionBlock title="nextTick vs queueMicrotask" accent="gradient-text">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-sm text-white/50 leading-relaxed">
              <p>
                In Node.js, <code className="text-mint font-mono text-xs">process.nextTick()</code> runs
                before any other microtask — even before <code className="text-lavender font-mono text-xs">Promise.then()</code>.
                This is Node-specific and doesn't exist in browsers.
              </p>
              <p>
                <code className="text-lavender font-mono text-xs">queueMicrotask()</code> is the standard
                cross-platform way to schedule microtasks. It has the same priority as
                Promise callbacks.
              </p>
              <p>
                Prefer <code className="text-lavender font-mono text-xs">queueMicrotask()</code> for
                portability. Use <code className="text-mint font-mono text-xs">process.nextTick()</code> only
                when you explicitly need to run before Promises in Node.
              </p>
            </div>
            <CodeExample
              title="nexttick-vs-microtask.js"
              code={`// Node.js only
process.nextTick(() => {
  console.log("1 — nextTick");
});

Promise.resolve().then(() => {
  console.log("2 — Promise.then");
});

queueMicrotask(() => {
  console.log("3 — queueMicrotask");
});

// Output: 1, 2, 3
// nextTick fires before all other
// microtasks in Node.js`}
            />
          </div>
        </SectionBlock>

        {/* ── Section: Key Takeaways ── */}
        <SectionBlock title="Key Takeaways">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'V8 is shared — the engine is the same. Only the host APIs differ.',
              'Browser has DOM, Web APIs, rendering pipeline. Node has fs, http, streams.',
              'Browser event loop: Task → Microtask → Render. Node: 6-phase libuv loop.',
              'process.nextTick is Node-only and fires before Promise microtasks.',
              'setImmediate (Node) ≈ setTimeout(fn, 0) but fires in the Check phase.',
              'Write portable async code with Promises and queueMicrotask.',
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 items-start text-xs text-white/50 bg-white/[0.02] border border-white/[0.05] rounded-lg p-3"
              >
                <span className="text-cyan font-mono font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span>{point}</span>
              </motion.div>
            ))}
          </div>
        </SectionBlock>

        {/* ── Next Chapter CTA ── */}
        <div className="text-center pt-8 border-t border-white/[0.04]">
          <p className="text-white/30 text-sm mb-4">Next chapter</p>
          <Link to="/examples">
            <Button variant="outline" size="lg">
              Execution Examples →
            </Button>
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}
