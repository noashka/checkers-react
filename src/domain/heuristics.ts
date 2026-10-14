import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';
import { CAPTURE_DIRECTIONS, inBounds, sideOf, Side } from './utils';

const MAN_MATERIAL = 1000;
const KING_MATERIAL = 1600;
const EDGE_BONUS = 7;
const THREAT_PENALTY = 3;
const ATTACK_BONUS = 6;

const opponentOf = (side: Side): Side => (side === 'computer' ? 'player' : 'computer');

const isEmptyAt = (board: CellModel[][], x: number, y: number) => inBounds(board, x, y) && !board[x][y].figure;

const countThreats = (board: CellModel[][], i: number, j: number, side: Side) =>
  CAPTURE_DIRECTIONS.filter(([dx, dy]) => {
    if (!inBounds(board, i + dx, j + dy)) return false;

    return sideOf(board[i + dx][j + dy].figure) === opponentOf(side) && isEmptyAt(board, i - dx, j - dy);
  }).length;

const countAttacks = (board: CellModel[][], i: number, j: number, side: Side) =>
  CAPTURE_DIRECTIONS.filter(
    ([dx, dy]) =>
      inBounds(board, i + dx, j + dy) &&
      sideOf(board[i + dx][j + dy].figure) === opponentOf(side) &&
      isEmptyAt(board, i + 2 * dx, j + 2 * dy),
  ).length;

const evaluatePiece = (board: CellModel[][], i: number, j: number, side: Side) => {
  const last = board.length - 1;
  const isKing = board[i][j].figure === Figure.ComputerKing || board[i][j].figure === Figure.PlayerKing;
  let value = isKing ? KING_MATERIAL : MAN_MATERIAL;

  if (i === 0 || j === 0 || i === last || j === last) value += EDGE_BONUS;

  return value - countThreats(board, i, j, side) * THREAT_PENALTY + countAttacks(board, i, j, side) * ATTACK_BONUS;
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
