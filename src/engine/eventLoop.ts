/* ──────────────────────────────────────────────
 *  Event Loop Simulator & Execution Engine
 *  Orchestrates parsing, interpretation, and the event loop algorithm.
 * ────────────────────────────────────────────── */

import {
  type ExecutionStep,
  type StackFrame,
  type QueuedTask,
  type WebAPIEntry,
  type ConsoleEntry,
  type RuntimeMode,
  type EngineInterface,
  type AsyncContext,
  RuntimeFunction,
  SimPromise,
  ReturnSignal,
  SUSPENDED,
  resetPromiseCounter,
} from './types';
import { parseCode, type ParseResult } from './parser';
import { Environment } from './environment';
import { Interpreter } from './interpreter';
import { createGlobalEnv } from './builtins';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── ID generators ──
let _stepId = 0;
let _taskId = 0;
let _timerId = 0;

// ── The Engine ──

export class ExecutionEngine implements EngineInterface {
  // Public state — consumed by the Zustand store
  steps: ExecutionStep[] = [];
  callStack: StackFrame[] = [];
  consoleOutput: ConsoleEntry[] = [];
  errors: string[] = [];

  // Internal state
  mode: RuntimeMode;
  currentTime = 0;

  private microtaskQueue: QueuedTask[] = [];
  private macrotaskQueue: QueuedTask[] = [];
  private webAPIs: WebAPIEntry[] = [];
  private interpreter: Interpreter;

  constructor(mode: RuntimeMode = 'browser') {
    this.mode = mode;
    this.interpreter = new Interpreter(this);
  }

  // ── Public API ──

  /**
   * Parse and execute the given JS code, simulating the full event loop.
   * Returns the array of ExecutionSteps for the visualizer.
   */
  run(code: string): ExecutionStep[] {
    this._reset();

    // 1. Parse
    const result: ParseResult = parseCode(code);
    if (result.error) {
      this.errors.push(result.error.message);
      this.emit({
        type: 'CONSOLE_ERROR',
        payload: { args: [result.error.message] },
        line: result.error.line,
        timestamp: 0,
      });
      return this.steps;
    }

    // 2. Create global environment
    const globalEnv = createGlobalEnv(this, this.mode);

    // 3. Execute global code
    this.pushStack('<global>', 1);
    try {
      this.interpreter.evalProgram(result.ast, globalEnv);
    } catch (err: any) {
      this._handleError(err);
    }
    this.popStack();

    // 4. Run the event loop
    this._processEventLoop();

    return this.steps;
  }

  // ── EngineInterface implementation ──

  emit(step: ExecutionStep): void {
    this.steps.push({ ...step, timestamp: step.timestamp ?? this.currentTime });

    // Also track console output
    if (step.type === 'CONSOLE_LOG' || step.type === 'CONSOLE_WARN' || step.type === 'CONSOLE_ERROR') {
      this.consoleOutput.push({
        type: step.type === 'CONSOLE_LOG' ? 'log' : step.type === 'CONSOLE_WARN' ? 'warn' : 'error',
        args: (step.payload.args ?? []) as unknown[],
        timestamp: this.currentTime,
      });
    }
  }

  pushStack(name: string, line = 0): void {
    const frame: StackFrame = {
      id: `frame-${++_stepId}`,
      name,
      line,
    };
    this.callStack.push(frame);
    this.emit({
      type: 'PUSH_STACK',
      payload: { name, line, id: frame.id },
      line,
      timestamp: this.currentTime,
    });
  }

  popStack(): void {
    const frame = this.callStack.pop();
    if (frame) {
      this.emit({
        type: 'POP_STACK',
        payload: { name: frame.name, id: frame.id },
        timestamp: this.currentTime,
      });
    }
  }

  scheduleMicrotask(label: string, callback: () => void, source: string): void {
    const task: QueuedTask = {
      id: `micro-${++_taskId}`,
      label,
      callback,
      source,
    };

    // process.nextTick gets priority (front of queue)
    if (source === 'process.nextTick') {
      this.microtaskQueue.unshift(task);
    } else {
      this.microtaskQueue.push(task);
    }
  }

  scheduleMacrotask(label: string, callback: () => void, source: string): void {
    const task: QueuedTask = {
      id: `macro-${++_taskId}`,
      label,
      callback,
      source,
    };
    this.macrotaskQueue.push(task);

    this.emit({
      type: 'SCHEDULE_MACROTASK',
      payload: { id: task.id, label, source },
      timestamp: this.currentTime,
    });
  }

  registerTimer(
    label: string,
    delay: number,
    callback: () => void,
    type: 'timeout' | 'interval',
  ): number {
    const id = ++_timerId;
    this.webAPIs.push({
      id,
      label,
      delay,
      startTime: this.currentTime,
      callback,
      type,
      cleared: false,
    });
    return id;
  }

  clearTimer(id: number): void {
    const entry = this.webAPIs.find((w) => w.id === id);
    if (entry) {
      entry.cleared = true;
    }
  }

  createPromise(): SimPromise {
    return new SimPromise(
      (label, cb, source) => this.scheduleMicrotask(label, cb, source),
      () => this.createPromise(),
    );
  }

  callUserFunction(fn: RuntimeFunction, args: any[], thisVal?: any): any {
    const funcEnv = fn.closure.createChild(true);

    // Bind `this` for method calls (arrow functions inherit `this` from closure)
    if (thisVal !== undefined && !fn.isArrow) {
      funcEnv.define('this', thisVal, 'const');
    }

    // Bind parameters
    for (let i = 0; i < fn.params.length; i++) {
      funcEnv.define(fn.params[i], args[i] !== undefined ? args[i] : undefined, 'let');
    }

    // Bind arguments object
    funcEnv.define('arguments', args, 'const');

    const fnName = fn.name || '<anonymous>';
    const line = fn.node?.loc?.start?.line ?? fn.body?.loc?.start?.line ?? 0;

    if (fn.isAsync) {
      return this._callAsyncFunction(fn, funcEnv, fnName, line);
    }

    // Synchronous call
    this.pushStack(fnName, line);
    this.emit({
      type: 'HIGHLIGHT_LINE',
      payload: {},
      line,
      timestamp: this.currentTime,
    });

    let result: any;
    try {
      if (fn.body.type === 'BlockStatement') {
        result = this.interpreter.evalBlock(fn.body.body, funcEnv);
      } else {
        // Arrow with expression body
        result = this.interpreter.evaluate(fn.body, funcEnv);
        result = new ReturnSignal(result);
      }
    } catch (err) {
      this.popStack();
      throw err;
    }

    this.popStack();

    if (result instanceof ReturnSignal) return result.value;
    return result;
  }

  // ── Private methods ──

  private _callAsyncFunction(
    fn: RuntimeFunction,
    funcEnv: Environment,
    fnName: string,
    line: number,
  ): SimPromise {
    const asyncPromise = this.createPromise();
    const asyncCtx: AsyncContext = { asyncPromise };

    this.pushStack(fnName, line);
    this.emit({
      type: 'HIGHLIGHT_LINE',
      payload: {},
      line,
      timestamp: this.currentTime,
    });

    let result: any;
    try {
      if (fn.body.type === 'BlockStatement') {
        result = this.interpreter.evalBlock(fn.body.body, funcEnv, asyncCtx);
      } else {
        result = this.interpreter.evaluate(fn.body, funcEnv, asyncCtx);
        if (result !== SUSPENDED) {
          result = new ReturnSignal(result);
        }
      }
    } catch (err) {
      this.popStack();
      asyncPromise.reject(err);
      return asyncPromise;
    }

    this.popStack();

    if (result === SUSPENDED) {
      // Function is suspended — asyncPromise will be resolved by the continuation
    } else if (result instanceof ReturnSignal) {
      asyncPromise.resolve(result.value);
    } else {
      asyncPromise.resolve(result);
    }

    return asyncPromise;
  }

  private _processEventLoop(): void {
    const MAX_ITERATIONS = 500; // safety limit
    let iterations = 0;

    while (this._hasPendingWork() && iterations < MAX_ITERATIONS) {
      iterations++;

      // ── Drain microtask queue ──
      let microGuard = 0;
      while (this.microtaskQueue.length > 0 && microGuard < 200) {
        microGuard++;
        const task = this.microtaskQueue.shift()!;

        this.emit({
          type: 'EVENT_LOOP_CHECK',
          payload: { phase: 'microtask' },
          timestamp: this.currentTime,
        });

        this.emit({
          type: 'DEQUEUE_MICROTASK',
          payload: { id: task.id, label: task.label },
          timestamp: this.currentTime,
        });

        this.emit({
          type: 'EXECUTE_MICROTASK',
          payload: { id: task.id, label: task.label },
          timestamp: this.currentTime,
        });

        this.pushStack(task.label, 0);
        try {
          task.callback();
        } catch (err: any) {
          this._handleError(err);
        }
        this.popStack();
      }

      // ── Advance timers (move expired timers to macrotask queue) ──
      this._advanceTimers();

      // ── Pick ONE macrotask ──
      if (this.macrotaskQueue.length > 0) {
        const task = this.macrotaskQueue.shift()!;

        this.emit({
          type: 'EVENT_LOOP_CHECK',
          payload: { phase: 'macrotask' },
          timestamp: this.currentTime,
        });

        this.emit({
          type: 'DEQUEUE_MACROTASK',
          payload: { id: task.id, label: task.label },
          timestamp: this.currentTime,
        });

        this.emit({
          type: 'EXECUTE_MACROTASK',
          payload: { id: task.id, label: task.label },
          timestamp: this.currentTime,
        });

        this.pushStack(task.label, 0);
        try {
          task.callback();
        } catch (err: any) {
          this._handleError(err);
        }
        this.popStack();

        // After macrotask, loop back to drain microtasks
        continue;
      }

      // If only web APIs remain, advance time to next timer
      if (this.webAPIs.some((w) => !w.cleared)) {
        this._advanceTimers();
      }
    }
  }

  private _advanceTimers(): void {
    // Find the earliest uncleared timer
    const pending = this.webAPIs.filter((w) => !w.cleared);
    if (pending.length === 0) return;

    // Find minimum expiry time
    let minExpiry = Infinity;
    for (const timer of pending) {
      const expiry = timer.startTime + timer.delay;
      if (expiry < minExpiry) minExpiry = expiry;
    }

    // Advance time if needed
    if (minExpiry > this.currentTime) {
      this.currentTime = minExpiry;
    }

    // Move expired timers to macrotask queue
    for (const timer of pending) {
      const expiry = timer.startTime + timer.delay;
      if (expiry <= this.currentTime) {
        this.emit({
          type: 'RESOLVE_WEB_API',
          payload: { id: timer.id, label: timer.label },
          timestamp: this.currentTime,
        });

        // Schedule callback as macrotask
        this.macrotaskQueue.push({
          id: `macro-${++_taskId}`,
          label: timer.label,
          callback: timer.callback,
          source: timer.type,
        });

        this.emit({
          type: 'SCHEDULE_MACROTASK',
          payload: { id: `macro-${_taskId}`, label: timer.label },
          timestamp: this.currentTime,
        });

        if (timer.type === 'interval') {
          // Reschedule interval
          timer.startTime = this.currentTime;
        } else {
          timer.cleared = true;
        }
      }
    }
  }

  private _hasPendingWork(): boolean {
    return (
      this.microtaskQueue.length > 0 ||
      this.macrotaskQueue.length > 0 ||
      this.webAPIs.some((w) => !w.cleared)
    );
  }

  private _handleError(err: any): void {
    const msg = err instanceof Error ? err.message : String(err);
    this.errors.push(msg);
    this.emit({
      type: 'CONSOLE_ERROR',
      payload: { args: [msg] },
      timestamp: this.currentTime,
    });
  }

  private _reset(): void {
    _stepId = 0;
    _taskId = 0;
    _timerId = 0;
    resetPromiseCounter();

    this.steps = [];
    this.callStack = [];
    this.microtaskQueue = [];
    this.macrotaskQueue = [];
    this.webAPIs = [];
    this.consoleOutput = [];
    this.errors = [];
    this.currentTime = 0;
  }
}
