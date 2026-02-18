/* ──────────────────────────────────────────────
 *  Prebuilt Code Examples
 *  Curated snippets for the visualizer dropdown.
 * ────────────────────────────────────────────── */

export interface CodeExample {
  id: string;
  title: string;
  category: 'basics' | 'timers' | 'promises' | 'async-await' | 'mixed' | 'node';
  code: string;
  description: string;
}

export const EXAMPLES: CodeExample[] = [
  // ── Basics ──
  {
    id: 'sync-basics',
    title: 'Synchronous Execution',
    category: 'basics',
    description: 'Simple synchronous code to see the call stack in action.',
    code: `function greet(name) {
  console.log("Hello, " + name);
}

function main() {
  console.log("Start");
  greet("World");
  console.log("End");
}

main();`,
  },

  // ── Timers ──
  {
    id: 'settimeout-zero',
    title: 'setTimeout(fn, 0)',
    category: 'timers',
    description: 'Even with 0ms delay, setTimeout callbacks wait for the call stack to clear.',
    code: `console.log("A");

setTimeout(function timer() {
  console.log("B");
}, 0);

console.log("C");`,
  },
  {
    id: 'multiple-timers',
    title: 'Multiple Timers',
    category: 'timers',
    description: 'Multiple setTimeout calls with different delays.',
    code: `console.log("Start");

setTimeout(function fast() {
  console.log("Fast (100ms)");
}, 100);

setTimeout(function slow() {
  console.log("Slow (500ms)");
}, 500);

setTimeout(function instant() {
  console.log("Instant (0ms)");
}, 0);

console.log("End");`,
  },

  // ── Promises ──
  {
    id: 'promise-basic',
    title: 'Promise Basics',
    category: 'promises',
    description: 'Promise.then() creates microtasks that run before macrotasks.',
    code: `console.log("1");

setTimeout(function timeout() {
  console.log("2 - macrotask");
}, 0);

Promise.resolve().then(function micro() {
  console.log("3 - microtask");
});

console.log("4");`,
  },
  {
    id: 'promise-chain',
    title: 'Promise Chain',
    category: 'promises',
    description: 'Chained .then() calls — each schedules a new microtask.',
    code: `console.log("Start");

Promise.resolve("A")
  .then(function step1(val) {
    console.log("then 1: " + val);
    return "B";
  })
  .then(function step2(val) {
    console.log("then 2: " + val);
    return "C";
  })
  .then(function step3(val) {
    console.log("then 3: " + val);
  });

console.log("End");`,
  },
  {
    id: 'promise-constructor',
    title: 'Promise Constructor',
    category: 'promises',
    description: 'The Promise constructor executor runs synchronously.',
    code: `console.log("A");

new Promise(function executor(resolve) {
  console.log("B");
  resolve("done");
  console.log("C");
}).then(function onResolve(val) {
  console.log("D: " + val);
});

console.log("E");`,
  },

  // ── Async/Await ──
  {
    id: 'async-basic',
    title: 'async/await Basics',
    category: 'async-await',
    description: 'async/await desugars to Promises — await pauses the function.',
    code: `async function fetchData() {
  console.log("Fetching...");
  const result = await Promise.resolve("data");
  console.log("Got: " + result);
}

console.log("Start");
fetchData();
console.log("End");`,
  },
  {
    id: 'async-order',
    title: 'async/await Ordering',
    category: 'async-await',
    description: 'Code after await runs as a microtask when the promise resolves.',
    code: `async function foo() {
  console.log("foo start");
  await Promise.resolve();
  console.log("foo end");
}

async function bar() {
  console.log("bar start");
  await Promise.resolve();
  console.log("bar end");
}

console.log("script start");
foo();
bar();
console.log("script end");`,
  },

  // ── Mixed ──
  {
    id: 'micro-vs-macro',
    title: 'Microtask vs Macrotask Race',
    category: 'mixed',
    description: 'Microtasks always run before the next macrotask.',
    code: `setTimeout(function timeout1() {
  console.log("timeout 1");
}, 0);

Promise.resolve().then(function micro1() {
  console.log("microtask 1");
});

setTimeout(function timeout2() {
  console.log("timeout 2");
}, 0);

Promise.resolve().then(function micro2() {
  console.log("microtask 2");
});

console.log("sync");`,
  },
  {
    id: 'nested-async',
    title: 'Nested Callbacks',
    category: 'mixed',
    description: 'Callbacks inside callbacks — microtasks scheduled from macrotasks.',
    code: `console.log("Start");

setTimeout(function outer() {
  console.log("Timeout");
  Promise.resolve().then(function inner() {
    console.log("Microtask inside timeout");
  });
}, 0);

Promise.resolve().then(function first() {
  console.log("Microtask 1");
  setTimeout(function delayed() {
    console.log("Timeout inside microtask");
  }, 0);
});

console.log("End");`,
  },
  {
    id: 'microtask-flood',
    title: 'Microtask Flooding',
    category: 'mixed',
    description: 'Microtasks can schedule more microtasks — they all run before macrotasks.',
    code: `console.log("start");

setTimeout(function timeout() {
  console.log("timeout");
}, 0);

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
  },
];

/** Get examples filtered by mode */
export function getExamples(mode: 'browser' | 'node' = 'browser'): CodeExample[] {
  if (mode === 'node') return EXAMPLES;
  return EXAMPLES.filter((e) => e.category !== 'node');
}

/** Get a single example by ID */
export function getExampleById(id: string): CodeExample | undefined {
  return EXAMPLES.find((e) => e.id === id);
}
