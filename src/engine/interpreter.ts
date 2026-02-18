/* ──────────────────────────────────────────────
 *  Tree-Walking Interpreter
 *  Evaluates ESTree AST nodes, emitting ExecutionSteps through the engine.
 * ────────────────────────────────────────────── */

import { Environment } from './environment';
import {
  type EngineInterface,
  type AsyncContext,
  RuntimeFunction,
  NativeFunction,
  SimPromise,
  ReturnSignal,
  BreakSignal,
  ContinueSignal,
  SUSPENDED,
} from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ──

function isTruthy(v: any): boolean {
  return !!v;
}

function toNumber(v: any): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === null || v === undefined) return 0;
  return NaN;
}

function stringify(v: any): string {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (v instanceof RuntimeFunction) return `[Function: ${v.name || 'anonymous'}]`;
  if (v instanceof NativeFunction) return `[Function: ${v.name}]`;
  if (v instanceof SimPromise) return `Promise {<${v.state}>}`;
  if (Array.isArray(v)) return `[${v.map(stringify).join(', ')}]`;
  if (typeof v === 'object') {
    try {
      const entries = Object.entries(v).map(([k, val]) => `${k}: ${stringify(val)}`);
      return `{ ${entries.join(', ')} }`;
    } catch {
      return '[Object]';
    }
  }
  return String(v);
}

// ── Interpreter Class ──

export class Interpreter {
  constructor(private engine: EngineInterface) {}

  /** Evaluate a single AST node */
  evaluate(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    if (!node) return undefined;

    switch (node.type) {
      // ── Program ──
      case 'Program':
        return this.evalProgram(node, env, asyncCtx);

      // ── Statements ──
      case 'ExpressionStatement':
        return this.evaluate(node.expression, env, asyncCtx);
      case 'BlockStatement':
        return this.evalBlock(node.body, env.createChild(), asyncCtx);
      case 'VariableDeclaration':
        return this.evalVarDeclaration(node, env, asyncCtx);
      case 'FunctionDeclaration':
        return this.evalFunctionDeclaration(node, env);
      case 'ReturnStatement':
        return this.evalReturn(node, env, asyncCtx);
      case 'IfStatement':
        return this.evalIf(node, env, asyncCtx);
      case 'WhileStatement':
        return this.evalWhile(node, env, asyncCtx);
      case 'DoWhileStatement':
        return this.evalDoWhile(node, env, asyncCtx);
      case 'ForStatement':
        return this.evalFor(node, env, asyncCtx);
      case 'BreakStatement':
        return new BreakSignal(node.label?.name);
      case 'ContinueStatement':
        return new ContinueSignal(node.label?.name);
      case 'ThrowStatement':
        throw this.evaluate(node.argument, env, asyncCtx);
      case 'TryStatement':
        return this.evalTry(node, env, asyncCtx);
      case 'SwitchStatement':
        return this.evalSwitch(node, env, asyncCtx);
      case 'EmptyStatement':
        return undefined;
      case 'LabeledStatement':
        return this.evaluate(node.body, env, asyncCtx);

      // ── Expressions ──
      case 'Literal':
        return node.value;
      case 'Identifier':
        return this.evalIdentifier(node, env);
      case 'BinaryExpression':
        return this.evalBinary(node, env, asyncCtx);
      case 'LogicalExpression':
        return this.evalLogical(node, env, asyncCtx);
      case 'UnaryExpression':
        return this.evalUnary(node, env, asyncCtx);
      case 'UpdateExpression':
        return this.evalUpdate(node, env);
      case 'AssignmentExpression':
        return this.evalAssignment(node, env, asyncCtx);
      case 'ConditionalExpression':
        return this.evalConditional(node, env, asyncCtx);
      case 'CallExpression':
        return this.evalCall(node, env, asyncCtx);
      case 'NewExpression':
        return this.evalNew(node, env, asyncCtx);
      case 'MemberExpression':
        return this.evalMember(node, env, asyncCtx);
      case 'ObjectExpression':
        return this.evalObject(node, env, asyncCtx);
      case 'ArrayExpression':
        return this.evalArray(node, env, asyncCtx);
      case 'FunctionExpression':
        return this.evalFunctionExpr(node, env);
      case 'ArrowFunctionExpression':
        return this.evalArrowExpr(node, env);
      case 'AwaitExpression':
        return this.evalAwait(node, env, asyncCtx);
      case 'TemplateLiteral':
        return this.evalTemplateLiteral(node, env, asyncCtx);
      case 'SequenceExpression':
        return this.evalSequence(node, env, asyncCtx);
      case 'ThisExpression':
        return env.has('this') ? env.get('this') : undefined;
      case 'SpreadElement':
        return this.evaluate(node.argument, env, asyncCtx);
      case 'TaggedTemplateExpression':
        // basic fallback: just eval the template
        return this.evalTemplateLiteral(node.quasi, env, asyncCtx);

      default:
        // Unsupported node type — skip silently
        return undefined;
    }
  }

  // ── Program ──
  evalProgram(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    // First pass: hoist function declarations
    for (const stmt of node.body) {
      if (stmt.type === 'FunctionDeclaration') {
        this.evalFunctionDeclaration(stmt, env);
      }
    }
    return this.evalBlock(node.body, env, asyncCtx, true);
  }

  // ── Block ──
  evalBlock(
    statements: any[],
    env: Environment,
    asyncCtx?: AsyncContext,
    skipFnDecl = false,
  ): any {
    let result: any;
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // Skip already-hoisted function declarations
      if (skipFnDecl && stmt.type === 'FunctionDeclaration') continue;

      // Line highlight
      if (stmt.loc) {
        this.engine.emit({
          type: 'HIGHLIGHT_LINE',
          payload: {},
          line: stmt.loc.start.line,
          timestamp: this.engine.currentTime,
        });
      }

      // Handle await in variable declarations: const x = await expr;
      if (
        asyncCtx &&
        stmt.type === 'VariableDeclaration' &&
        this._declHasAwait(stmt)
      ) {
        const signal = this._evalVarDeclWithAwait(
          stmt, env, asyncCtx, statements, i,
        );
        if (signal === SUSPENDED) return SUSPENDED;
        result = signal;
        continue;
      }

      // Handle await in expression statements: await expr;
      if (
        asyncCtx &&
        stmt.type === 'ExpressionStatement' &&
        stmt.expression.type === 'AwaitExpression'
      ) {
        const signal = this._evalExprStmtAwait(
          stmt, env, asyncCtx, statements, i,
        );
        if (signal === SUSPENDED) return SUSPENDED;
        result = signal;
        continue;
      }

      // Handle return await: return await expr;
      if (
        asyncCtx &&
        stmt.type === 'ReturnStatement' &&
        stmt.argument?.type === 'AwaitExpression'
      ) {
        const signal = this._evalReturnAwait(stmt, env, asyncCtx);
        if (signal === SUSPENDED) return SUSPENDED;
        return signal; // ReturnSignal with resolved value
      }

      result = this.evaluate(stmt, env, asyncCtx);
      if (
        result instanceof ReturnSignal ||
        result instanceof BreakSignal ||
        result instanceof ContinueSignal ||
        result === SUSPENDED
      ) {
        return result;
      }
    }
    return result;
  }

  // ── Variable Declaration ──
  evalVarDeclaration(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const kind = node.kind as 'let' | 'const' | 'var';
    for (const decl of node.declarations) {
      const name = decl.id.name;
      const value = decl.init ? this.evaluate(decl.init, env, asyncCtx) : undefined;
      env.define(name, value, kind);
    }
    return undefined;
  }

  // ── Function Declaration ──
  evalFunctionDeclaration(node: any, env: Environment): void {
    const params = node.params.map((p: any) => p.name ?? p.left?.name ?? '?');
    const fn = new RuntimeFunction(
      node.id?.name ?? '<anonymous>',
      params,
      node.body,
      env,
      node.async ?? false,
      false,
      node,
    );
    env.define(node.id.name, fn, 'var');
  }

  // ── Return ──
  evalReturn(node: any, env: Environment, asyncCtx?: AsyncContext): ReturnSignal {
    const value = node.argument ? this.evaluate(node.argument, env, asyncCtx) : undefined;
    return new ReturnSignal(value);
  }

  // ── If / Else ──
  evalIf(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const test = this.evaluate(node.test, env, asyncCtx);
    if (isTruthy(test)) {
      return this.evaluate(node.consequent, env, asyncCtx);
    } else if (node.alternate) {
      return this.evaluate(node.alternate, env, asyncCtx);
    }
    return undefined;
  }

  // ── While ──
  evalWhile(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    let guard = 0;
    while (isTruthy(this.evaluate(node.test, env, asyncCtx))) {
      if (++guard > 10000) throw new Error('Infinite loop detected');
      const result = this.evaluate(node.body, env, asyncCtx);
      if (result instanceof BreakSignal) break;
      if (result instanceof ContinueSignal) continue;
      if (result instanceof ReturnSignal || result === SUSPENDED) return result;
    }
    return undefined;
  }

  // ── Do-While ──
  evalDoWhile(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    let guard = 0;
    do {
      if (++guard > 10000) throw new Error('Infinite loop detected');
      const result = this.evaluate(node.body, env, asyncCtx);
      if (result instanceof BreakSignal) break;
      if (result instanceof ContinueSignal) continue;
      if (result instanceof ReturnSignal || result === SUSPENDED) return result;
    } while (isTruthy(this.evaluate(node.test, env, asyncCtx)));
    return undefined;
  }

  // ── For ──
  evalFor(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const loopEnv = env.createChild();
    if (node.init) {
      this.evaluate(node.init, loopEnv, asyncCtx);
    }
    let guard = 0;
    while (true) {
      if (node.test && !isTruthy(this.evaluate(node.test, loopEnv, asyncCtx))) break;
      if (++guard > 10000) throw new Error('Infinite loop detected');
      const result = this.evaluate(node.body, loopEnv, asyncCtx);
      if (result instanceof BreakSignal) break;
      if (result instanceof ContinueSignal) { /* fall through to update */ }
      else if (result instanceof ReturnSignal || result === SUSPENDED) return result;
      if (node.update) this.evaluate(node.update, loopEnv, asyncCtx);
    }
    return undefined;
  }

  // ── Try / Catch / Finally ──
  evalTry(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    try {
      return this.evalBlock(node.block.body, env.createChild(), asyncCtx);
    } catch (err) {
      if (node.handler) {
        const catchEnv = env.createChild();
        if (node.handler.param) {
          catchEnv.define(node.handler.param.name, err, 'let');
        }
        return this.evalBlock(node.handler.body.body, catchEnv, asyncCtx);
      }
    } finally {
      if (node.finalizer) {
        this.evalBlock(node.finalizer.body, env.createChild(), asyncCtx);
      }
    }
    return undefined;
  }

  // ── Switch ──
  evalSwitch(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const disc = this.evaluate(node.discriminant, env, asyncCtx);
    let matched = false;
    for (const c of node.cases) {
      if (!matched && c.test !== null) {
        const caseVal = this.evaluate(c.test, env, asyncCtx);
        if (disc !== caseVal) continue;
      }
      matched = true;
      for (const stmt of c.consequent) {
        const r = this.evaluate(stmt, env, asyncCtx);
        if (r instanceof BreakSignal) return undefined;
        if (r instanceof ReturnSignal || r === SUSPENDED) return r;
      }
    }
    // default case (test === null) handled by falling through
    return undefined;
  }

  // ── Identifier ──
  evalIdentifier(node: any, env: Environment): any {
    const name = node.name;
    switch (name) {
      case 'undefined': return undefined;
      case 'NaN': return NaN;
      case 'Infinity': return Infinity;
      default: return env.get(name);
    }
  }

  // ── Binary Operators ──
  evalBinary(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const left = this.evaluate(node.left, env, asyncCtx);
    const right = this.evaluate(node.right, env, asyncCtx);
    switch (node.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string')
          return String(stringify(left)) + String(stringify(right));
        return toNumber(left) + toNumber(right);
      case '-': return toNumber(left) - toNumber(right);
      case '*': return toNumber(left) * toNumber(right);
      case '/': return toNumber(left) / toNumber(right);
      case '%': return toNumber(left) % toNumber(right);
      case '**': return toNumber(left) ** toNumber(right);
      case '==': return left == right;
      case '!=': return left != right;
      case '===': return left === right;
      case '!==': return left !== right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '|': return toNumber(left) | toNumber(right);
      case '&': return toNumber(left) & toNumber(right);
      case '^': return toNumber(left) ^ toNumber(right);
      case '<<': return toNumber(left) << toNumber(right);
      case '>>': return toNumber(left) >> toNumber(right);
      case '>>>': return toNumber(left) >>> toNumber(right);
      case 'instanceof': return false; // simplified
      case 'in': return typeof right === 'object' && right !== null && left in right;
      default: return undefined;
    }
  }

  // ── Logical Operators ──
  evalLogical(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const left = this.evaluate(node.left, env, asyncCtx);
    switch (node.operator) {
      case '&&': return isTruthy(left) ? this.evaluate(node.right, env, asyncCtx) : left;
      case '||': return isTruthy(left) ? left : this.evaluate(node.right, env, asyncCtx);
      case '??': return left != null ? left : this.evaluate(node.right, env, asyncCtx);
      default: return undefined;
    }
  }

  // ── Unary Operators ──
  evalUnary(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    if (node.operator === 'typeof') {
      if (node.argument.type === 'Identifier') {
        try {
          const val = env.get(node.argument.name);
          if (val instanceof RuntimeFunction || val instanceof NativeFunction) return 'function';
          return typeof val;
        } catch {
          return 'undefined';
        }
      }
      const val = this.evaluate(node.argument, env, asyncCtx);
      if (val instanceof RuntimeFunction || val instanceof NativeFunction) return 'function';
      return typeof val;
    }
    const arg = this.evaluate(node.argument, env, asyncCtx);
    switch (node.operator) {
      case '-': return -toNumber(arg);
      case '+': return +toNumber(arg);
      case '!': return !isTruthy(arg);
      case '~': return ~toNumber(arg);
      case 'void': return undefined;
      case 'delete': return true;
      default: return undefined;
    }
  }

  // ── Update (++, --) ──
  evalUpdate(node: any, env: Environment): any {
    if (node.argument.type === 'Identifier') {
      const old = toNumber(env.get(node.argument.name));
      const newVal = node.operator === '++' ? old + 1 : old - 1;
      env.set(node.argument.name, newVal);
      return node.prefix ? newVal : old;
    }
    return undefined;
  }

  // ── Assignment ──
  evalAssignment(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const value = this.evaluate(node.right, env, asyncCtx);

    if (node.left.type === 'Identifier') {
      const name = node.left.name;
      let finalVal = value;
      if (node.operator !== '=') {
        const oldVal = env.get(name);
        finalVal = this._compoundOp(node.operator, oldVal, value);
      }
      env.set(name, finalVal);
      return finalVal;
    }

    // Member assignment: obj.prop = val
    if (node.left.type === 'MemberExpression') {
      const obj = this.evaluate(node.left.object, env, asyncCtx);
      const prop = node.left.computed
        ? this.evaluate(node.left.property, env, asyncCtx)
        : node.left.property.name;
      if (obj != null) {
        let finalVal = value;
        if (node.operator !== '=') {
          finalVal = this._compoundOp(node.operator, obj[prop], value);
        }
        obj[prop] = finalVal;
        return finalVal;
      }
    }

    return value;
  }

  // ── Conditional (ternary) ──
  evalConditional(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    return isTruthy(this.evaluate(node.test, env, asyncCtx))
      ? this.evaluate(node.consequent, env, asyncCtx)
      : this.evaluate(node.alternate, env, asyncCtx);
  }

  // ── Call Expression ──
  evalCall(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    // Evaluate callee
    let thisVal: any = undefined;
    let callee: any;

    if (node.callee.type === 'MemberExpression') {
      thisVal = this.evaluate(node.callee.object, env, asyncCtx);
      const prop = node.callee.computed
        ? this.evaluate(node.callee.property, env, asyncCtx)
        : node.callee.property.name;

      // Handle method calls on native objects
      if (thisVal instanceof SimPromise) {
        return this._callPromiseMethod(thisVal, prop, node.arguments, env, asyncCtx);
      }

      callee = thisVal?.[prop];

      // Native array/string/object methods
      if (typeof callee === 'function' && !(callee instanceof RuntimeFunction) && !(callee instanceof NativeFunction)) {
        const args = node.arguments.map((a: any) => this.evaluate(a, env, asyncCtx));
        return callee.apply(thisVal, args);
      }

      // RuntimeFunction method stored on object
      if (callee instanceof RuntimeFunction || callee instanceof NativeFunction) {
        // fall through to normal call handling below
      } else if (callee === undefined || callee === null) {
        // method not found — try native
        if (thisVal != null && typeof thisVal[prop] === 'function') {
          const args = node.arguments.map((a: any) => this.evaluate(a, env, asyncCtx));
          return thisVal[prop](...args);
        }
        throw new Error(`TypeError: ${prop} is not a function`);
      }
    } else {
      callee = this.evaluate(node.callee, env, asyncCtx);
    }

    // Evaluate arguments
    const args = node.arguments.map((a: any) => {
      if (a.type === 'SpreadElement') {
        const arr = this.evaluate(a.argument, env, asyncCtx);
        return Array.isArray(arr) ? arr : [arr];
      }
      return this.evaluate(a, env, asyncCtx);
    });
    // Flatten spread args
    const flatArgs: any[] = [];
    for (const arg of args) {
      if (Array.isArray(arg) && node.arguments.some((a: any) => a.type === 'SpreadElement')) {
        flatArgs.push(...arg);
      } else {
        flatArgs.push(arg);
      }
    }

    // Call
    if (callee instanceof NativeFunction) {
      const fnName = callee.name;
      const line = node.loc?.start?.line;
      this.engine.pushStack(fnName, line);
      this.engine.emit({
        type: 'HIGHLIGHT_LINE',
        payload: {},
        line,
        timestamp: this.engine.currentTime,
      });
      const result = callee.fn(...flatArgs);
      this.engine.popStack();
      return result;
    }

    if (callee instanceof RuntimeFunction) {
      return this.engine.callUserFunction(callee, flatArgs, thisVal);
    }

    // Fallback: if callee is a plain JS function (from a built-in object)
    if (typeof callee === 'function') {
      return callee.apply(thisVal, flatArgs);
    }

    const calleeName = node.callee.name ?? node.callee.property?.name ?? '?';
    throw new Error(`TypeError: ${calleeName} is not a function`);
  }

  // ── New Expression ──
  evalNew(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const callee = this.evaluate(node.callee, env, asyncCtx);
    const args = node.arguments.map((a: any) => this.evaluate(a, env, asyncCtx));

    // new Promise(...)
    if (callee instanceof NativeFunction && callee.name === 'Promise') {
      return callee.fn(...args);
    }

    // new RuntimeFunction(...) — basic constructor support
    if (callee instanceof RuntimeFunction) {
      const obj: any = {};
      const constructorEnv = callee.closure.createChild(true);
      constructorEnv.define('this', obj, 'const');
      for (let i = 0; i < callee.params.length; i++) {
        constructorEnv.define(callee.params[i], args[i], 'let');
      }
      this.engine.pushStack(`new ${callee.name}`, node.loc?.start?.line);
      this.evalBlock(callee.body.body ?? [callee.body], constructorEnv, asyncCtx);
      this.engine.popStack();
      return obj;
    }

    return undefined;
  }

  // ── Member Expression ──
  evalMember(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const obj = this.evaluate(node.object, env, asyncCtx);
    const prop = node.computed
      ? this.evaluate(node.property, env, asyncCtx)
      : node.property.name;

    if (obj === null || obj === undefined) {
      throw new Error(`TypeError: Cannot read properties of ${obj} (reading '${prop}')`);
    }

    // Handle string/array .length
    if (prop === 'length' && (typeof obj === 'string' || Array.isArray(obj))) {
      return obj.length;
    }

    // SimPromise methods are handled in evalCall
    return obj[prop];
  }

  // ── Object Expression ──
  evalObject(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    const obj: any = {};
    for (const prop of node.properties) {
      if (prop.type === 'SpreadElement') {
        const spread = this.evaluate(prop.argument, env, asyncCtx);
        Object.assign(obj, spread);
        continue;
      }
      const key = prop.computed
        ? this.evaluate(prop.key, env, asyncCtx)
        : prop.key.name ?? prop.key.value;
      const val = prop.value
        ? this.evaluate(prop.value, env, asyncCtx)
        : env.get(key);
      obj[key] = val;
    }
    return obj;
  }

  // ── Array Expression ──
  evalArray(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    return node.elements.map((el: any) => {
      if (!el) return undefined; // holes: [1,,3]
      if (el.type === 'SpreadElement') {
        return this.evaluate(el.argument, env, asyncCtx);
      }
      return this.evaluate(el, env, asyncCtx);
    });
  }

  // ── Function Expression ──
  evalFunctionExpr(node: any, env: Environment): RuntimeFunction {
    const params = node.params.map((p: any) => p.name ?? p.left?.name ?? '?');
    return new RuntimeFunction(
      node.id?.name ?? '<anonymous>',
      params,
      node.body,
      env,
      node.async ?? false,
      false,
      node,
    );
  }

  // ── Arrow Function Expression ──
  evalArrowExpr(node: any, env: Environment): RuntimeFunction {
    const params = node.params.map((p: any) => p.name ?? p.left?.name ?? '?');
    return new RuntimeFunction(
      '<arrow>',
      params,
      node.body,
      env,
      node.async ?? false,
      true,
      node,
    );
  }

  // ── Await Expression (inline — for simple cases) ──
  evalAwait(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    if (!asyncCtx) {
      throw new Error('SyntaxError: await is only valid in async functions');
    }
    const value = this.evaluate(node.argument, env, asyncCtx);
    // If already resolved or not a promise, return directly
    if (!(value instanceof SimPromise)) return value;
    if (value.state === 'fulfilled') return value.value;
    if (value.state === 'rejected') throw value.value;

    // Pending promise — this case is handled by the block-level await handlers
    // If we get here, it means await was used in an unsupported position
    // Return the promise value as-is (simplified)
    return value.value;
  }

  // ── Template Literal ──
  evalTemplateLiteral(node: any, env: Environment, asyncCtx?: AsyncContext): string {
    let result = '';
    for (let i = 0; i < node.quasis.length; i++) {
      result += node.quasis[i].value.cooked ?? node.quasis[i].value.raw;
      if (i < node.expressions.length) {
        result += stringify(this.evaluate(node.expressions[i], env, asyncCtx));
      }
    }
    return result;
  }

  // ── Sequence Expression ──
  evalSequence(node: any, env: Environment, asyncCtx?: AsyncContext): any {
    let result: any;
    for (const expr of node.expressions) {
      result = this.evaluate(expr, env, asyncCtx);
    }
    return result;
  }

  // ── Promise method calls ──
  private _callPromiseMethod(
    promise: SimPromise,
    method: string,
    argNodes: any[],
    env: Environment,
    asyncCtx?: AsyncContext,
  ): any {
    const args = argNodes.map((a: any) => this.evaluate(a, env, asyncCtx));

    switch (method) {
      case 'then': {
        const onFulfilled = args[0];
        const onRejected = args[1];
        const wrapFn = (fn: any) => {
          if (!fn) return undefined;
          if (fn instanceof RuntimeFunction) {
            return (val: any) => this.engine.callUserFunction(fn, [val]);
          }
          if (fn instanceof NativeFunction) return fn.fn;
          if (typeof fn === 'function') return fn;
          return undefined;
        };

        this.engine.emit({
          type: 'SCHEDULE_MICROTASK',
          payload: { label: '.then()' },
          timestamp: this.engine.currentTime,
        });

        return promise.then(wrapFn(onFulfilled), wrapFn(onRejected));
      }
      case 'catch': {
        const onRejected = args[0];
        const wrapFn = (fn: any) => {
          if (!fn) return undefined;
          if (fn instanceof RuntimeFunction) {
            return (val: any) => this.engine.callUserFunction(fn, [val]);
          }
          if (typeof fn === 'function') return fn;
          return undefined;
        };
        return promise.catch(wrapFn(onRejected)!);
      }
      case 'finally': {
        const onFinally = args[0];
        if (onFinally instanceof RuntimeFunction) {
          return promise.finally(() => this.engine.callUserFunction(onFinally, []));
        }
        return promise.finally(() => {});
      }
    }

    return undefined;
  }

  // ── Await helpers (block-level) ──

  /** Check if a VariableDeclaration contains an await init */
  private _declHasAwait(node: any): boolean {
    return node.declarations.some(
      (d: any) => d.init?.type === 'AwaitExpression',
    );
  }

  /** Evaluate `const x = await expr;` with suspension support */
  private _evalVarDeclWithAwait(
    node: any,
    env: Environment,
    asyncCtx: AsyncContext,
    containerStmts: any[],
    stmtIndex: number,
  ): any {
    const kind = node.kind as 'let' | 'const' | 'var';
    for (const decl of node.declarations) {
      if (decl.init?.type === 'AwaitExpression') {
        const value = this.evaluate(decl.init.argument, env, asyncCtx);
        const promise = this._toSimPromise(value);

        if (promise.state === 'fulfilled') {
          env.define(decl.id.name, promise.value, kind);
          continue;
        }
        if (promise.state === 'rejected') {
          throw promise.value;
        }

        // Pending — suspend
        const varName = decl.id.name;
        const remaining = containerStmts.slice(stmtIndex + 1);

        this.engine.emit({
          type: 'SCHEDULE_MICROTASK',
          payload: { label: `await → ${varName}` },
          timestamp: this.engine.currentTime,
        });

        promise.then(
          (resolvedValue: any) => {
            env.define(varName, resolvedValue, kind);
            const result = this.evalBlock(remaining, env, asyncCtx);
            if (result instanceof ReturnSignal) {
              asyncCtx.asyncPromise.resolve(result.value);
            } else if (result !== SUSPENDED) {
              asyncCtx.asyncPromise.resolve(result);
            }
          },
          (reason: any) => {
            asyncCtx.asyncPromise.reject(reason);
          },
        );

        return SUSPENDED;
      } else {
        const value = decl.init ? this.evaluate(decl.init, env, asyncCtx) : undefined;
        env.define(decl.id.name, value, kind);
      }
    }
    return undefined;
  }

  /** Evaluate `await expr;` as an expression statement */
  private _evalExprStmtAwait(
    node: any,
    env: Environment,
    asyncCtx: AsyncContext,
    containerStmts: any[],
    stmtIndex: number,
  ): any {
    const awaitNode = node.expression;
    const value = this.evaluate(awaitNode.argument, env, asyncCtx);
    const promise = this._toSimPromise(value);

    if (promise.state === 'fulfilled') return promise.value;
    if (promise.state === 'rejected') throw promise.value;

    // Pending — suspend
    const remaining = containerStmts.slice(stmtIndex + 1);

    this.engine.emit({
      type: 'SCHEDULE_MICROTASK',
      payload: { label: 'await' },
      timestamp: this.engine.currentTime,
    });

    promise.then(
      () => {
        const result = this.evalBlock(remaining, env, asyncCtx);
        if (result instanceof ReturnSignal) {
          asyncCtx.asyncPromise.resolve(result.value);
        } else if (result !== SUSPENDED) {
          asyncCtx.asyncPromise.resolve(result);
        }
      },
      (reason: any) => {
        asyncCtx.asyncPromise.reject(reason);
      },
    );

    return SUSPENDED;
  }

  /** Evaluate `return await expr;` */
  private _evalReturnAwait(
    node: any,
    env: Environment,
    asyncCtx: AsyncContext,
  ): any {
    const awaitNode = node.argument;
    const value = this.evaluate(awaitNode.argument, env, asyncCtx);
    const promise = this._toSimPromise(value);

    if (promise.state === 'fulfilled') return new ReturnSignal(promise.value);
    if (promise.state === 'rejected') throw promise.value;

    // Pending — suspend
    this.engine.emit({
      type: 'SCHEDULE_MICROTASK',
      payload: { label: 'return await' },
      timestamp: this.engine.currentTime,
    });

    promise.then(
      (resolvedValue: any) => {
        asyncCtx.asyncPromise.resolve(resolvedValue);
      },
      (reason: any) => {
        asyncCtx.asyncPromise.reject(reason);
      },
    );

    return SUSPENDED;
  }

  /** Ensure a value is a SimPromise */
  private _toSimPromise(value: any): SimPromise {
    if (value instanceof SimPromise) return value;
    const p = this.engine.createPromise();
    p.resolve(value);
    return p;
  }

  /** Compound assignment operator helper */
  private _compoundOp(op: string, left: any, right: any): any {
    switch (op) {
      case '+=':
        if (typeof left === 'string' || typeof right === 'string')
          return String(left) + String(right);
        return toNumber(left) + toNumber(right);
      case '-=': return toNumber(left) - toNumber(right);
      case '*=': return toNumber(left) * toNumber(right);
      case '/=': return toNumber(left) / toNumber(right);
      case '%=': return toNumber(left) % toNumber(right);
      case '**=': return toNumber(left) ** toNumber(right);
      case '&&=': return isTruthy(left) ? right : left;
      case '||=': return isTruthy(left) ? left : right;
      case '??=': return left != null ? left : right;
      default: return right;
    }
  }
}

export { stringify };
