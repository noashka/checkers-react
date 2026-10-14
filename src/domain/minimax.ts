import calculateHeuristics from './heuristics';
import Node from './Node';
import CellModel from '../entities/CellModel';
import { findMoves } from './utils';

/** Bigger than any heuristic score; the remaining depth is added so that quicker wins score higher */
export const WIN_SCORE = 100000;

/** Scores the board for the computer: the computer is the maximizing player, the player is the minimizing one */
const minimax = (
  board: CellModel[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
): number => {
  // a side that cannot move has lost, sooner losses (larger remaining depth) are worse
  if (findMoves(board, maximizingPlayer ? 'computer' : 'player').length === 0) {
    return maximizingPlayer ? -(WIN_SCORE + depth) : WIN_SCORE + depth;
  }

  if (depth === 0) return calculateHeuristics(board);

  const children = new Node(board).getChildren(maximizingPlayer);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const child of children) {
      const ev = minimax(child.getBoard(), depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);

      if (beta <= alpha) break;
    }

    return maxEval;
  }

  let minEval = Infinity;
  for (const child of children) {
    const ev = minimax(child.getBoard(), depth - 1, alpha, beta, true);
    minEval = Math.min(minEval, ev);
    beta = Math.min(beta, ev);

    if (beta <= alpha) break;
  }

  return minEval;
};

export default minimax;
