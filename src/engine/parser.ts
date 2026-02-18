/* ──────────────────────────────────────────────
 *  AST Parser — thin wrapper around acorn
 * ────────────────────────────────────────────── */

import * as acorn from 'acorn';

export interface ParseSuccess {
  ast: acorn.Node;
  error: null;
}

export interface ParseFailure {
  ast: null;
  error: { message: string; line: number; column: number };
}

export type ParseResult = ParseSuccess | ParseFailure;

export function parseCode(code: string): ParseResult {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: 'script',
      locations: true,
    });
    return { ast, error: null };
  } catch (e: unknown) {
    const err = e as { message?: string; loc?: { line: number; column: number } };
    return {
      ast: null,
      error: {
        message: err.message ?? 'Parse error',
        line: err.loc?.line ?? 1,
        column: err.loc?.column ?? 0,
      },
    };
  }
}
