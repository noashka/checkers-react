import calculateHeuristics from './heuristics';
import Node from '../entities/Node';
import CellModel from '../entities/CellModel';

const minimax = (
  board: CellModel[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
): number => {
  if (depth === 0) return calculateHeuristics(board);

  const copy = JSON.parse(JSON.stringify(board));
  const currentState = new Node(copy);
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    const children = currentState.getChildren(true);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childBoard = child.getBoard();
      const ev = minimax(childBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);

      if (beta <= alpha) {
        break;
      }
    }

    return maxEval;
  }

  let minEval = Infinity;
  const children = currentState.getChildren(false);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childBoard = child.getBoard();
    const ev = minimax(childBoard, depth - 1, alpha, beta, true);
    minEval = Math.min(minEval, ev);
    beta = Math.min(beta, ev);
    if (beta <= alpha) {
      break;
    }
  }

  return minEval;
};

export default minimax;
