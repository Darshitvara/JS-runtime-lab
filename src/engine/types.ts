/* ──────────────────────────────────────────────
 *  Engine Type Definitions
 *  All types used across the execution engine
 * ────────────────────────────────────────────── */

import type { Environment } from './environment.js';

// ── Runtime Mode ──
export type RuntimeMode = 'browser' | 'node';

// ── Execution Step Types ──
export type StepType =
  | 'PUSH_STACK'
  | 'POP_STACK'
  | 'SCHEDULE_MACROTASK'
  | 'SCHEDULE_MICROTASK'
  | 'REGISTER_WEB_API'
  | 'RESOLVE_WEB_API'
  | 'CONSOLE_LOG'
  | 'CONSOLE_WARN'
  | 'CONSOLE_ERROR'
  | 'EVENT_LOOP_CHECK'
  | 'EXECUTE_MICROTASK'
  | 'EXECUTE_MACROTASK'
  | 'DEQUEUE_MICROTASK'
  | 'DEQUEUE_MACROTASK'
  | 'HIGHLIGHT_LINE';

export interface ExecutionStep {
  type: StepType;
  payload: Record<string, unknown>;
  line?: number;
  column?: number;
  timestamp: number;
}

// ── Call Stack ──
export interface StackFrame {
  id: string;
  name: string;
  line: number;
}

// ── Queued Tasks ──
export interface QueuedTask {
  id: string;
  label: string;
  callback: () => void;
  source: string;
}

// ── Web API Entry (timers, etc.) ──
export interface WebAPIEntry {
  id: number;
  label: string;
  delay: number;
  startTime: number;
  callback: () => void;
  type: 'timeout' | 'interval';
  cleared: boolean;
}

// ── Console Entry ──
export interface ConsoleEntry {
  type: 'log' | 'warn' | 'error';
  args: unknown[];
  timestamp: number;
}

// ── Runtime Function (user-defined) ──
export class RuntimeFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prototype: any = null;

  constructor(
    public name: string,
    public params: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public body: any, // ESTree Node (BlockStatement or Expression)
    public closure: Environment,
    public isAsync: boolean = false,
    public isArrow: boolean = false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public node: any = null, // original AST node for line info
  ) {}
}

// ── Native Function (built-in) ──
export class NativeFunction {
  constructor(
    public name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public fn: (...args: any[]) => any,
  ) {}
}

// ── Simulated Promise ──
let _promiseIdCounter = 0;
export function resetPromiseCounter() {
  _promiseIdCounter = 0;
}

interface PromiseHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFulfilled?: (value: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRejected?: (reason: any) => any;
  childPromise: SimPromise;
}

export class SimPromise {
  id: string;
  state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any = undefined;
  handlers: PromiseHandler[] = [];

  constructor(
    private scheduleMicrotask: (label: string, callback: () => void, source: string) => void,
    private createChild: () => SimPromise,
  ) {
    this.id = `promise-${++_promiseIdCounter}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve(value: any) {
    if (this.state !== 'pending') return;

    // If resolving with a promise, chain
    if (value instanceof SimPromise) {
      if (value.state === 'fulfilled') {
        this.resolve(value.value);
      } else if (value.state === 'rejected') {
        this.reject(value.value);
      } else {
        value.then(
          (v: unknown) => this.resolve(v),
          (r: unknown) => this.reject(r),
        );
      }
      return;
    }

    this.state = 'fulfilled';
    this.value = value;
    this._flush();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject(reason: any) {
    if (this.state !== 'pending') return;
    this.state = 'rejected';
    this.value = reason;
    this._flush();
  }

  then(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFulfilled?: ((value: any) => any) | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRejected?: ((reason: any) => any) | null,
  ): SimPromise {
    const child = this.createChild();
    const handler: PromiseHandler = {
      onFulfilled: onFulfilled ?? undefined,
      onRejected: onRejected ?? undefined,
      childPromise: child,
    };
    this.handlers.push(handler);
    if (this.state !== 'pending') {
      this._flush();
    }
    return child;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(onRejected: (reason: any) => any): SimPromise {
    return this.then(null, onRejected);
  }

  finally(onFinally: () => void): SimPromise {
    return this.then(
      (value) => { onFinally(); return value; },
      (reason) => { onFinally(); throw reason; },
    );
  }

  private _flush() {
    while (this.handlers.length > 0) {
      const handler = this.handlers.shift()!;
      const isFulfilled = this.state === 'fulfilled';
      const callback = isFulfilled ? handler.onFulfilled : handler.onRejected;
      const val = this.value;

      this.scheduleMicrotask(
        isFulfilled ? 'Promise.then' : 'Promise.catch',
        () => {
          try {
            if (callback) {
              const result = callback(val);
              if (result instanceof SimPromise) {
                result.then(
                  (v: unknown) => handler.childPromise.resolve(v),
                  (r: unknown) => handler.childPromise.reject(r),
                );
              } else {
                handler.childPromise.resolve(result);
              }
            } else {
              if (isFulfilled) {
                handler.childPromise.resolve(val);
              } else {
                handler.childPromise.reject(val);
              }
            }
          } catch (err) {
            handler.childPromise.reject(err);
          }
        },
        'Promise',
      );
    }
  }
}

// ── Control Flow Signals ──
export class ReturnSignal {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public value: any) {}
}

export class BreakSignal {
  constructor(public label?: string) {}
}

export class ContinueSignal {
  constructor(public label?: string) {}
}

/** Sentinel returned when an async function suspends at `await` */
export const SUSPENDED = Symbol('SUSPENDED');

/** Context for tracking async function execution */
export interface AsyncContext {
  asyncPromise: SimPromise;
}

// ── Engine Interface ──
// Used by interpreter & builtins to interact with the engine without circular deps
export interface EngineInterface {
  mode: RuntimeMode;
  currentTime: number;
  emit(step: ExecutionStep): void;
  pushStack(name: string, line?: number): void;
  popStack(): void;
  scheduleMicrotask(label: string, callback: () => void, source: string): void;
  scheduleMacrotask(label: string, callback: () => void, source: string): void;
  scheduleCheck(label: string, callback: () => void, source: string): void;
  registerTimer(
    label: string,
    delay: number,
    callback: () => void,
    type: 'timeout' | 'interval',
  ): number;
  clearTimer(id: number): void;
  createPromise(): SimPromise;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callUserFunction(fn: RuntimeFunction, args: any[], thisVal?: any): any;
}
