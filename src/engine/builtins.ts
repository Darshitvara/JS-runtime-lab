/* ──────────────────────────────────────────────
 *  Built-in APIs
 *  Populates the global environment with runtime globals.
 * ────────────────────────────────────────────── */

import { Environment } from './environment';
import {
  type EngineInterface,
  type RuntimeMode,
  NativeFunction,
  RuntimeFunction,
  SimPromise,
} from './types';
import { stringify } from './interpreter';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function createGlobalEnv(
  engine: EngineInterface,
  mode: RuntimeMode,
): Environment {
  const env = new Environment(null, true); // global is a function scope

  // ── console ──
  const consoleMethods: Record<string, any> = {};
  for (const method of ['log', 'warn', 'error'] as const) {
    consoleMethods[method] = new NativeFunction(`console.${method}`, (...args: any[]) => {
      const stepType = method === 'log' ? 'CONSOLE_LOG' : method === 'warn' ? 'CONSOLE_WARN' : 'CONSOLE_ERROR';
      engine.emit({
        type: stepType,
        payload: {
          args: args.map((a) => stringify(a)),
          raw: args,
        },
        timestamp: engine.currentTime,
      });
    });
  }
  // Add console.log as a special callable object
  const consoleObj = {
    log: consoleMethods.log,
    warn: consoleMethods.warn,
    error: consoleMethods.error,
  };
  env.define('console', consoleObj, 'const');

  // ── setTimeout ──
  env.define(
    'setTimeout',
    new NativeFunction('setTimeout', (callback: any, delay = 0) => {
      const ms = Math.max(0, Number(delay) || 0);
      const label = `setTimeout(${ms}ms)`;

      // Wrap callback
      const wrappedCb = () => {
        if (callback instanceof RuntimeFunction) {
          engine.callUserFunction(callback, []);
        } else if (callback instanceof NativeFunction) {
          callback.fn();
        } else if (typeof callback === 'function') {
          callback();
        }
      };

      const id = engine.registerTimer(label, ms, wrappedCb, 'timeout');

      engine.emit({
        type: 'REGISTER_WEB_API',
        payload: { id, label, delay: ms },
        timestamp: engine.currentTime,
      });

      return id;
    }),
    'const',
  );

  // ── setInterval ──
  env.define(
    'setInterval',
    new NativeFunction('setInterval', (callback: any, delay = 0) => {
      const ms = Math.max(0, Number(delay) || 0);
      const label = `setInterval(${ms}ms)`;

      const wrappedCb = () => {
        if (callback instanceof RuntimeFunction) {
          engine.callUserFunction(callback, []);
        } else if (callback instanceof NativeFunction) {
          callback.fn();
        } else if (typeof callback === 'function') {
          callback();
        }
      };

      const id = engine.registerTimer(label, ms, wrappedCb, 'interval');

      engine.emit({
        type: 'REGISTER_WEB_API',
        payload: { id, label, delay: ms },
        timestamp: engine.currentTime,
      });

      return id;
    }),
    'const',
  );

  // ── clearTimeout / clearInterval ──
  env.define(
    'clearTimeout',
    new NativeFunction('clearTimeout', (id: number) => {
      engine.clearTimer(id);
    }),
    'const',
  );

  env.define(
    'clearInterval',
    new NativeFunction('clearInterval', (id: number) => {
      engine.clearTimer(id);
    }),
    'const',
  );

  // ── Promise ──
  env.define(
    'Promise',
    new NativeFunction('Promise', (executor: any) => {
      const promise = engine.createPromise();

      const resolveFn = new NativeFunction('resolve', (value: any) => {
        promise.resolve(value);
      });
      const rejectFn = new NativeFunction('reject', (reason: any) => {
        promise.reject(reason);
      });

      // Executor runs synchronously
      if (executor instanceof RuntimeFunction) {
        engine.callUserFunction(executor, [resolveFn, rejectFn]);
      } else if (executor instanceof NativeFunction) {
        executor.fn(resolveFn, rejectFn);
      } else if (typeof executor === 'function') {
        executor(resolveFn, rejectFn);
      }

      return promise;
    }),
    'const',
  );

  // ── Promise.resolve ──
  const PromiseObj = env.get('Promise');
  PromiseObj.resolve = new NativeFunction('Promise.resolve', (value: any) => {
    if (value instanceof SimPromise) return value;
    const p = engine.createPromise();
    p.resolve(value);
    return p;
  });

  // ── Promise.reject ──
  PromiseObj.reject = new NativeFunction('Promise.reject', (reason: any) => {
    const p = engine.createPromise();
    p.reject(reason);
    return p;
  });

  // ── Promise.all ──
  PromiseObj.all = new NativeFunction('Promise.all', (promises: any[]) => {
    const result = engine.createPromise();
    if (!Array.isArray(promises) || promises.length === 0) {
      result.resolve([]);
      return result;
    }
    const results: any[] = new Array(promises.length);
    let remaining = promises.length;

    promises.forEach((p, i) => {
      const sp = p instanceof SimPromise ? p : (() => { const q = engine.createPromise(); q.resolve(p); return q; })();
      sp.then(
        (val: any) => {
          results[i] = val;
          remaining--;
          if (remaining === 0) result.resolve(results);
        },
        (err: any) => result.reject(err),
      );
    });

    return result;
  });

  // ── Promise.race ──
  PromiseObj.race = new NativeFunction('Promise.race', (promises: any[]) => {
    const result = engine.createPromise();
    if (!Array.isArray(promises)) {
      result.resolve(undefined);
      return result;
    }
    for (const p of promises) {
      const sp = p instanceof SimPromise ? p : (() => { const q = engine.createPromise(); q.resolve(p); return q; })();
      sp.then(
        (val: any) => result.resolve(val),
        (err: any) => result.reject(err),
      );
    }
    return result;
  });

  // ── queueMicrotask ──
  env.define(
    'queueMicrotask',
    new NativeFunction('queueMicrotask', (callback: any) => {
      const wrappedCb = () => {
        if (callback instanceof RuntimeFunction) {
          engine.callUserFunction(callback, []);
        } else if (callback instanceof NativeFunction) {
          callback.fn();
        } else if (typeof callback === 'function') {
          callback();
        }
      };

      engine.scheduleMicrotask('queueMicrotask', wrappedCb, 'queueMicrotask');

      engine.emit({
        type: 'SCHEDULE_MICROTASK',
        payload: { label: 'queueMicrotask' },
        timestamp: engine.currentTime,
      });
    }),
    'const',
  );

  // ── Browser-specific APIs ──
  if (mode === 'browser') {
    env.define(
      'requestAnimationFrame',
      new NativeFunction('requestAnimationFrame', (callback: any) => {
        const wrappedCb = () => {
          if (callback instanceof RuntimeFunction) {
            engine.callUserFunction(callback, [engine.currentTime]);
          } else if (typeof callback === 'function') {
            callback(engine.currentTime);
          }
        };

        engine.scheduleMacrotask('requestAnimationFrame', wrappedCb, 'rAF');

        engine.emit({
          type: 'SCHEDULE_MACROTASK',
          payload: { label: 'requestAnimationFrame' },
          timestamp: engine.currentTime,
        });
      }),
      'const',
    );
  }

  // ── Node-specific APIs ──
  if (mode === 'node') {
    const processObj: Record<string, any> = {
      nextTick: new NativeFunction('process.nextTick', (callback: any) => {
        const wrappedCb = () => {
          if (callback instanceof RuntimeFunction) {
            engine.callUserFunction(callback, []);
          } else if (typeof callback === 'function') {
            callback();
          }
        };

        // process.nextTick has higher priority — insert at FRONT of microtask queue
        engine.scheduleMicrotask('process.nextTick', wrappedCb, 'process.nextTick');

        engine.emit({
          type: 'SCHEDULE_MICROTASK',
          payload: { label: 'process.nextTick' },
          timestamp: engine.currentTime,
        });
      }),
    };
    env.define('process', processObj, 'const');

    env.define(
      'setImmediate',
      new NativeFunction('setImmediate', (callback: any) => {
        const wrappedCb = () => {
          if (callback instanceof RuntimeFunction) {
            engine.callUserFunction(callback, []);
          } else if (typeof callback === 'function') {
            callback();
          }
        };

        engine.scheduleCheck('setImmediate', wrappedCb, 'setImmediate');
      }),
      'const',
    );
  }

  // ── Basic globals ──
  env.define('undefined', undefined, 'const');
  env.define('null', null, 'const');
  env.define('NaN', NaN, 'const');
  env.define('Infinity', Infinity, 'const');
  env.define('true', true, 'const');
  env.define('false', false, 'const');

  // ── JSON (basic) ──
  env.define('JSON', {
    stringify: new NativeFunction('JSON.stringify', (val: any) => {
      try { return JSON.stringify(val); } catch { return 'undefined'; }
    }),
    parse: new NativeFunction('JSON.parse', (str: string) => {
      try { return JSON.parse(str); } catch { throw new Error('SyntaxError: Unexpected token'); }
    }),
  }, 'const');

  // ── Math (partial) ──
  env.define('Math', {
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    max: Math.max,
    min: Math.min,
    abs: Math.abs,
    random: Math.random,
    PI: Math.PI,
    pow: Math.pow,
    sqrt: Math.sqrt,
    log: Math.log,
  }, 'const');

  // ── Date ──
  const DateConstructor = new NativeFunction('Date', (...args: any[]) => {
    if (args.length === 0) return new Date();
    return new Date(...(args as [any]));
  });
  (DateConstructor as any).now = new NativeFunction('Date.now', () => engine.currentTime);
  env.define('Date', DateConstructor, 'const');

  // ── Array ──
  env.define('Array', {
    isArray: new NativeFunction('Array.isArray', (val: any) => Array.isArray(val)),
    from: new NativeFunction('Array.from', (arrayLike: any, mapFn?: any) => {
      if (mapFn instanceof RuntimeFunction) {
        const arr = Array.from(arrayLike);
        return arr.map((item: any, index: number) => engine.callUserFunction(mapFn, [item, index]));
      }
      if (mapFn instanceof NativeFunction) {
        return Array.from(arrayLike, (...a: any[]) => mapFn.fn(...a));
      }
      if (typeof mapFn === 'function') {
        return Array.from(arrayLike, mapFn as any);
      }
      return Array.from(arrayLike);
    }),
    of: new NativeFunction('Array.of', (...args: any[]) => Array.of(...args)),
  }, 'const');

  // ── parseInt / parseFloat ──
  env.define('parseInt', new NativeFunction('parseInt', parseInt), 'const');
  env.define('parseFloat', new NativeFunction('parseFloat', parseFloat), 'const');
  env.define('isNaN', new NativeFunction('isNaN', isNaN), 'const');
  env.define('isFinite', new NativeFunction('isFinite', isFinite), 'const');
  env.define('String', new NativeFunction('String', (v: any) => String(v)), 'const');
  env.define('Number', new NativeFunction('Number', (v: any) => Number(v)), 'const');
  env.define('Boolean', new NativeFunction('Boolean', (v: any) => Boolean(v)), 'const');

  return env;
}
