import CellModel from '../entities/CellModel';
import minimax from './minimax';
import Node from './Node';
import { Move } from './utils';

export const DEFAULT_DEPTH = 4;

export type BestMove = {
  moves: Move[];
  board: CellModel[][];
  captures: number;
  score: number;
};

/** Picks the computer's best turn by searching `depth` plies, or null when the computer has no turn to play */
export const findBestMove = (board: CellModel[][], depth = DEFAULT_DEPTH): BestMove | null => {
  let best: BestMove | null = null;
  let alpha = -Infinity;

  for (const child of new Node(board).getChildren(true)) {
    const score = minimax(child.getBoard(), depth - 1, alpha, Infinity, false);

    if (best === null || score > best.score) {
      best = { moves: child.moves, board: child.getBoard(), captures: child.captures, score };
    }
    alpha = Math.max(alpha, score);
  }

  return best;
};
