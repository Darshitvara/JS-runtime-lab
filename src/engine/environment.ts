/* ──────────────────────────────────────────────
 *  Environment — Lexical scope chain
 * ────────────────────────────────────────────── */

interface VarEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  kind: 'let' | 'const' | 'var';
}

export class Environment {
  private vars = new Map<string, VarEntry>();
  private parent: Environment | null;
  /** true if this env is a function scope (vs block scope) */
  public isFunctionScope: boolean;

  constructor(parent: Environment | null = null, isFunctionScope = false) {
    this.parent = parent;
    this.isFunctionScope = isFunctionScope;
  }

  /* ── define ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  define(name: string, value: any, kind: 'let' | 'const' | 'var' = 'let'): void {
    if (kind === 'var') {
      // var hoists to nearest function scope (or global)
      const scope = this._functionScope();
      scope.vars.set(name, { value, kind });
    } else {
      this.vars.set(name, { value, kind });
    }
  }

  /* ── get ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(name: string): any {
    if (this.vars.has(name)) {
      return this.vars.get(name)!.value;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`ReferenceError: ${name} is not defined`);
  }

  /* ── set ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(name: string, value: any): void {
    if (this.vars.has(name)) {
      const entry = this.vars.get(name)!;
      if (entry.kind === 'const') {
        throw new Error(`TypeError: Assignment to constant variable '${name}'`);
      }
      entry.value = value;
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    throw new Error(`ReferenceError: ${name} is not defined`);
  }

  /* ── has ── */
  has(name: string): boolean {
    if (this.vars.has(name)) return true;
    return this.parent ? this.parent.has(name) : false;
  }

  /* ── create child scope ── */
  createChild(isFunctionScope = false): Environment {
    return new Environment(this, isFunctionScope);
  }

  /* ── find the nearest function scope ── */
  private _functionScope(): Environment {
    if (this.isFunctionScope || !this.parent) return this;
    return this.parent._functionScope();
  }
}
