import CellModel from '../entities/CellModel';
import minimax, { SearchTimeout, TranspositionTable } from './minimax';
import Node from './Node';
import { Move } from './utils';

export const DEFAULT_MAX_DEPTH = 8;
export const DEFAULT_TIME_LIMIT_MS = 500;

export type BestMove = {
  moves: Move[];
  board: CellModel[][];
  captures: number;
  score: number;
  depth: number;
};

export type SearchOptions = {
  maxDepth?: number;
  timeLimitMs?: number;
};

/**
 * Picks the computer's best turn, or null when the computer has no turn to play.
 * Searches 1, 2, ... maxDepth plies (iterative deepening) and keeps the result of the deepest iteration that
 * finished within the time limit. The previous iteration's ranking decides which turn is searched first.
 */
export const findBestMove = (
  board: CellModel[][],
  { maxDepth = DEFAULT_MAX_DEPTH, timeLimitMs = DEFAULT_TIME_LIMIT_MS }: SearchOptions = {},
): BestMove | null => {
  const deadline = Date.now() + timeLimitMs;
  const table: TranspositionTable = new Map();
  let candidates = new Node(board).getChildren(true).map((child) => ({ child, score: 0 }));
  let best: BestMove | null = null;

  if (candidates.length === 0) return null;

  for (let depth = 1; depth <= maxDepth; depth++) {
    // the first iteration always completes, so there is always a move to play
    const context = { table, deadline: depth === 1 ? undefined : deadline };
    const scored: typeof candidates = [];
    let alpha = -Infinity;

    try {
      for (const { child } of candidates) {
        const score = minimax(child.getBoard(), depth - 1, alpha, Infinity, false, context);
        scored.push({ child, score });
        alpha = Math.max(alpha, score);
      }
    } catch (error) {
      if (error instanceof SearchTimeout) break;
      throw error;
    }

    // stable sort keeps the earlier candidate on equal scores
    candidates = scored.sort((a, b) => b.score - a.score);
    const [{ child, score }] = candidates;
    best = { moves: child.moves, board: child.getBoard(), captures: child.captures, score, depth };
  }

  return best;
};
