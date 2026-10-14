import calculateHeuristics from './heuristics';
import Node from './Node';
import CellModel from '../entities/CellModel';
import { positionKey } from './game';
import { findMoves } from './utils';

export const WIN_SCORE = 100000;

type Bound = 'exact' | 'lower' | 'upper';
type TableEntry = { depth: number; value: number; bound: Bound };

export type TranspositionTable = Map<string, TableEntry>;

export type SearchContext = {
  table?: TranspositionTable;
  deadline?: number;
};

export class SearchTimeout extends Error {
  constructor() {
    super('Search time limit exceeded');
  }
}

const minimax = (
  board: CellModel[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  context: SearchContext = {},
): number => {
  if (context.deadline !== undefined && Date.now() >= context.deadline) throw new SearchTimeout();

  const key = context.table ? positionKey(board, maximizingPlayer ? 'computer' : 'player') : '';
  const cached = context.table?.get(key);

  if (cached && cached.depth === depth) {
    if (cached.bound === 'exact') return cached.value;
    if (cached.bound === 'lower') alpha = Math.max(alpha, cached.value);
    else beta = Math.min(beta, cached.value);

    if (alpha >= beta) return cached.value;
  }

  if (findMoves(board, maximizingPlayer ? 'computer' : 'player').length === 0) {
    return maximizingPlayer ? -(WIN_SCORE + depth) : WIN_SCORE + depth;
  }

  if (depth === 0) return calculateHeuristics(board);

  const originalAlpha = alpha;
  const originalBeta = beta;
  const children = new Node(board).getChildren(maximizingPlayer).sort((a, b) => b.captures - a.captures);
  let best = maximizingPlayer ? -Infinity : Infinity;

  for (const child of children) {
    const value = minimax(child.getBoard(), depth - 1, alpha, beta, !maximizingPlayer, context);

    if (maximizingPlayer) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, value);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, value);
    }

    if (beta <= alpha) break;
  }

  if (context.table) {
    let bound: Bound = 'exact';
    if (best <= originalAlpha) bound = 'upper';
    else if (best >= originalBeta) bound = 'lower';
    context.table.set(key, { depth, value: best, bound });
  }

  return best;
};

export default minimax;
