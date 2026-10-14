import CellModel from '../entities/CellModel';
import { CAPTURE_DIRECTIONS, findJumpsFrom, inBounds, isKing, sideOf, Side } from './utils';

const MAN_MATERIAL = 1000;
const KING_MATERIAL = 1600;
const EDGE_BONUS = 7;
const THREAT_PENALTY = 3;
const ATTACK_BONUS = 6;

const opponentOf = (side: Side): Side => (side === 'computer' ? 'player' : 'computer');

const isEmptyAt = (board: CellModel[][], x: number, y: number) => inBounds(board, x, y) && !board[x][y].figure;

/** How many opposing pieces could capture the piece on (i, j) */
const countThreats = (board: CellModel[][], i: number, j: number, side: Side) =>
  CAPTURE_DIRECTIONS.filter(([dx, dy]) => {
    // the attacker needs a free square right behind us to land on
    if (!isEmptyAt(board, i - dx, j - dy)) return false;

    // the nearest piece on the diagonal is the only one that can attack from that side
    for (let distance = 1; inBounds(board, i + distance * dx, j + distance * dy); distance++) {
      const { figure } = board[i + distance * dx][j + distance * dy];
      if (!figure) continue;

      // men attack from next to us, kings from any distance
      return sideOf(figure) === opponentOf(side) && (distance === 1 || isKing(figure));
    }

    return false;
  }).length;

/** How many opposing pieces the piece on (i, j) could capture */
const countAttacks = (board: CellModel[][], i: number, j: number) =>
  new Set(findJumpsFrom(board, i, j).map(([, , x, y]) => `${Math.sign(x - i)},${Math.sign(y - j)}`)).size;

const evaluatePiece = (board: CellModel[][], i: number, j: number, side: Side) => {
  const last = board.length - 1;
  let value = isKing(board[i][j].figure) ? KING_MATERIAL : MAN_MATERIAL;

  if (i === 0 || j === 0 || i === last || j === last) value += EDGE_BONUS;

  return value - countThreats(board, i, j, side) * THREAT_PENALTY + countAttacks(board, i, j) * ATTACK_BONUS;
};

const calculateHeuristics = (board: CellModel[][]) => {
  let score = 0;

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      const side = sideOf(board[i][j].figure);
      if (!side) continue;

      const sign = side === 'computer' ? 1 : -1;
      score += sign * evaluatePiece(board, i, j, side);
    }
  }

  return score;
};

export default calculateHeuristics;
