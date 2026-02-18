# Javascript Event Loop Visualizer

An interactive platform where developers write JavaScript and **watch it execute in real time** — call stack, event loop, microtask/macrotask queues, and Web APIs all visualized step by step.

Powered by a custom 1,100+ line tree-walking interpreter with full async/await and Promise support. Features dual runtime modes — browser event loop vs Node.js 6-phase model — so users can see exactly why `Promise.then` runs before `setTimeout`, or how `process.nextTick` differs from `setImmediate`.

## Vision

Most developers learn the event loop through blog posts and diagrams — static content that describes behavior but never shows it. This project exists to **close the gap between theory and intuition**. Instead of reading about how microtasks drain before the next macrotask, you see it happen with your own code, one step at a time.

The goal is to make JavaScript's concurrency model **tangible**:

- **Write real code** in a full-featured editor, not toy snippets
- **See the invisible** — the call stack, task queues, and Web API layer that browsers and Node.js manage behind the scenes
- **Compare runtimes side by side** — toggle between browser and Node.js modes to understand why the same code produces different execution orders
- **Build mental models** — step through execution at your own pace, pause at any point, and replay until it clicks

This isn't just a visualizer — it's a **learning environment** built around the idea that understanding comes from observation, not memorization.

## Why This Matters

JavaScript's single-threaded, event-driven architecture is the source of its most confusing behaviors. Race conditions, callback ordering, Promise resolution timing, the difference between `setTimeout(fn, 0)` and `queueMicrotask(fn)` — these aren't edge cases, they're daily realities. Yet most educational resources explain them with static flowcharts.

This project takes a different approach: **a JavaScript runtime that runs inside JavaScript**, fully transparent, where every internal operation — stack push, microtask enqueue, timer advancement — is captured as a replayable step. The result is an interactive simulation that makes the abstract concrete.

## Features

- **Custom JS Interpreter** — Tree-walking evaluator supporting async/await, Promises, classes, closures, arrow functions, destructuring, for-of/in, and more
- **Dual Runtime Modes** — Toggle between browser event loop and Node.js 6-phase model (timers → pending → poll → check → close)
- **Real-Time Visualization** — Watch the call stack, microtask queue, macrotask queue, and Web APIs update as your code runs
- **Integrated Monaco Editor** — Full-featured code editor with syntax highlighting and error markers
- **Step-Through Playback** — Play, pause, step, and reset controls with adjustable speed
- **6 Educational Pages** — Guided learning path covering the JS runtime, event loop, Node vs Browser, and interactive challenges

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Animations | Framer Motion |
| Code Editor | Monaco Editor |
| Parser | Acorn |
| Routing | React Router v6 |

## Project Structure

```
src/
├── engine/                # Custom JavaScript execution engine
│   ├── types.ts           # Type definitions (SimPromise, RuntimeFunction, etc.)
│   ├── parser.ts          # Acorn-based JS parser
│   ├── environment.ts     # Lexical scope & variable management
│   ├── interpreter.ts     # Tree-walking AST evaluator (1,131 lines)
│   ├── eventLoop.ts       # Dual-mode event loop simulator (604 lines)
│   └── builtins.ts        # Runtime globals (console, setTimeout, Promise, etc.)
├── store/
│   └── visualizerStore.ts # Zustand state management & step replay
├── components/
│   ├── visualizer/        # CallStack, TaskQueue, CodeEditor, Controls, etc.
│   ├── layout/            # Navbar, Footer, Layout
│   ├── ui/                # Button, GlassCard, AnimatedBackground, etc.
│   ├── landing/           # HeroAnimation
│   └── educational/       # Educational section components
├── pages/                 # 6 route pages
│   ├── HomePage.tsx
│   ├── AboutRuntimePage.tsx
│   ├── EventLoopPage.tsx
│   ├── NodeVsBrowserPage.tsx
│   ├── ExamplesPage.tsx
│   └── VisualizerPage.tsx # Lazy-loaded with code splitting
└── index.css              # "Midnight Ember" theme with glassmorphism
```

## Architecture

The execution engine works in three stages:

1. **Parse** — Acorn converts user code into an ESTree AST
2. **Interpret** — Tree-walking evaluator executes nodes, emitting `ExecutionStep` events for each operation (stack push/pop, queue schedule/dequeue, console output)
3. **Replay** — Zustand store replays steps one at a time, reconstructing visual state for each frame

The event loop simulator supports two modes:
- **Browser** — Simple model: drain microtasks → advance timers → pick 1 macrotask → repeat
- **Node.js** — 6-phase model: timers → pending → poll → check → close, with `process.nextTick` and microtask draining between each phase

## Build Stats

| Metric | Value |
|--------|-------|
| Source files | 39 |
| Modules transformed | 441 |
| Total gzipped | ~182 KB |
| Build time | ~1.5s |

## License

MIT
