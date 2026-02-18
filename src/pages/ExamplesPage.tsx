import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, GlassCard, Button, Badge, AnimatedBackground } from '../components/ui';
import { SectionBlock, CodeExample } from '../components/educational';

/* ── Example data ── */
interface Example {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;
  output: string[];
  explanation: string[];
}

const EXAMPLES: Example[] = [
  {
    id: 'basic-order',
    title: 'Sync vs Async Basics',
    difficulty: 'easy',
    code: `console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");`,
    output: ['A', 'D', 'C', 'B'],
    explanation: [
      '"A" — synchronous, runs immediately.',
      '"D" — synchronous, runs next.',
      '"C" — Promise.then() is a microtask, fires before macrotasks.',
      '"B" — setTimeout() is a macrotask, fires last.',
    ],
  },
  {
    id: 'nested-promises',
    title: 'Nested Promise Chains',
    difficulty: 'medium',
    code: `console.log("1");

Promise.resolve()
  .then(() => {
    console.log("2");
    return Promise.resolve();
  })
  .then(() => console.log("3"));

Promise.resolve().then(() => console.log("4"));

console.log("5");`,
    output: ['1', '5', '2', '4', '3'],
    explanation: [
      '"1" — synchronous.',
      '"5" — synchronous.',
      '"2" — first .then() from chain A runs.',
      '"4" — first .then() from chain B runs (queued at the same time as "2").',
      '"3" — second .then() from chain A runs. The inner Promise.resolve() adds an extra microtask tick.',
    ],
  },
  {
    id: 'settimeout-vs-promise',
    title: 'Mixed Timers & Promises',
    difficulty: 'medium',
    code: `setTimeout(() => console.log("T1"), 0);

Promise.resolve().then(() => {
  console.log("P1");
  setTimeout(() => console.log("T2"), 0);
});

setTimeout(() => {
  console.log("T3");
  Promise.resolve().then(() => console.log("P2"));
}, 0);

console.log("SYNC");`,
    output: ['SYNC', 'P1', 'T1', 'T3', 'P2', 'T2'],
    explanation: [
      '"SYNC" — synchronous, runs first.',
      '"P1" — microtask, clears before any macrotask.',
      '"T1" — first setTimeout callback (macrotask).',
      '"T3" — second setTimeout callback (macrotask). After it runs...',
      '"P2" — microtask scheduled inside T3, drains before next macrotask.',
      '"T2" — setTimeout scheduled inside P1, fires last.',
    ],
  },
  {
    id: 'async-await',
    title: 'async/await Desugaring',
    difficulty: 'medium',
    code: `async function foo() {
  console.log("foo start");
  await bar();
  console.log("foo end");
}

async function bar() {
  console.log("bar");
}

console.log("script start");
foo();
console.log("script end");`,
    output: ['script start', 'foo start', 'bar', 'script end', 'foo end'],
    explanation: [
      '"script start" — synchronous.',
      '"foo start" — synchronous, inside foo() before the await.',
      '"bar" — synchronous, bar() runs immediately when called.',
      '"script end" — synchronous. await yields control back to the caller.',
      '"foo end" — resumes after await as a microtask (like .then()).',
    ],
  },
  {
    id: 'microtask-flood',
    title: 'Microtask Queue Flooding',
    difficulty: 'hard',
    code: `console.log("start");

setTimeout(() => console.log("timeout"), 0);

let i = 0;
function flood() {
  if (i < 3) {
    i++;
    console.log("micro " + i);
    queueMicrotask(flood);
  }
}
queueMicrotask(flood);

console.log("end");`,
    output: ['start', 'end', 'micro 1', 'micro 2', 'micro 3', 'timeout'],
    explanation: [
      '"start" — synchronous.',
      '"end" — synchronous.',
      '"micro 1" — first queueMicrotask fires after sync code.',
      '"micro 2" — flood() queues itself again as a microtask.',
      '"micro 3" — and again. Microtasks keep draining.',
      '"timeout" — only fires after ALL microtasks are fully drained.',
    ],
  },
  {
    id: 'promise-constructor',
    title: 'Promise Constructor Trap',
    difficulty: 'hard',
    code: `console.log("A");

new Promise((resolve) => {
  console.log("B");
  resolve();
  console.log("C");
}).then(() => console.log("D"));

console.log("E");`,
    output: ['A', 'B', 'C', 'E', 'D'],
    explanation: [
      '"A" — synchronous.',
      '"B" — the Promise constructor executor runs SYNCHRONOUSLY.',
      '"C" — resolve() doesn\'t stop execution. Code after resolve() still runs.',
      '"E" — back in the outer synchronous flow.',
      '"D" — .then() fires as a microtask after all sync code completes.',
    ],
  },
];

const DIFFICULTY_COLORS = {
  easy: { badge: 'mint' as const, text: 'text-mint' },
  medium: { badge: 'amber' as const, text: 'text-amber' },
  hard: { badge: 'coral' as const, text: 'text-coral' },
};

/* ── Example Card ── */
function ExampleCard({ example }: { example: Example }) {
  const [showOutput, setShowOutput] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = DIFFICULTY_COLORS[example.difficulty];

  return (
    <GlassCard variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80">{example.title}</h3>
        <Badge variant={colors.badge}>{example.difficulty}</Badge>
      </div>

      <CodeExample title="script.js" code={example.code} />

      <div className="mt-4 space-y-3">
        {/* Predict CTA */}
        {!showOutput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-xs text-white/30 mb-2">What will the console output be?</p>
            <Button size="sm" variant="outline" onClick={() => setShowOutput(true)}>
              Reveal Output
            </Button>
          </motion.div>
        )}

        {/* Output */}
        <AnimatePresence>
          {showOutput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bg-white/[0.02] rounded-lg border border-white/[0.06] p-3">
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Console Output</div>
                <div className="space-y-1">
                  {example.output.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 font-mono text-xs"
                    >
                      <span className="text-white/15 text-[10px] w-4">{i + 1}</span>
                      <span className="text-cyan">{line}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {!showExplanation && (
                <div className="text-center mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setShowExplanation(true)}>
                    Show Explanation
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bg-cyan/[0.03] rounded-lg border border-cyan/10 p-3">
                <div className="text-[10px] font-mono text-cyan/40 uppercase tracking-widest mb-2">Step-by-Step</div>
                <div className="space-y-2">
                  {example.explanation.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-2 text-xs"
                    >
                      <span className="text-cyan/40 font-mono shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-white/50 leading-relaxed">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

/* ── Main Page ── */
export default function ExamplesPage() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const filtered = filter === 'all' ? EXAMPLES : EXAMPLES.filter((e) => e.difficulty === filter);

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
            <span className="inline-block text-xs font-mono text-coral/60 uppercase tracking-widest mb-4">
              Chapter 04
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Predict the <span className="gradient-text-warm">Output</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Test your understanding with real-world async puzzles. For each
              snippet, predict the console output before revealing the answer.
            </p>
          </motion.div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={filter === level ? 'primary' : 'ghost'}
              onClick={() => setFilter(level)}
            >
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              {level !== 'all' && (
                <span className="ml-1 text-[10px] opacity-50">
                  ({EXAMPLES.filter((e) => e.difficulty === level).length})
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Examples grid */}
        <div className="space-y-6">
          {filtered.map((example, i) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08 }}
            >
              <ExampleCard example={example} />
            </motion.div>
          ))}
        </div>

        {/* ── CTA to Visualizer ── */}
        <SectionBlock title="Ready to See It in Action?">
          <div className="text-center">
            <p className="text-sm text-white/40 mb-6 max-w-lg mx-auto">
              Now that you understand how the event loop processes async code,
              try writing your own snippets and watch them execute step by step
              in the interactive visualizer.
            </p>
            <Link to="/visualizer">
              <Button variant="primary" size="lg">
                Open Visualizer →
              </Button>
            </Link>
          </div>
        </SectionBlock>
      </PageLayout>
    </div>
  );
}
