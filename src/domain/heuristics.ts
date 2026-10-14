import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';
import { directionsOf, inBounds, sideOf, Side } from './utils';

// material dominates positional terms; a king is worth clearly more than a man, but less than two men
const MAN_MATERIAL = 1000;
const KING_MATERIAL = 1600;
const EDGE_BONUS = 7;
const THREAT_PENALTY = 3;
const ATTACK_BONUS = 6;

const ALL_DIRECTIONS = directionsOf(Figure.PlayerKing);

const opponentOf = (side: Side): Side => (side === 'computer' ? 'player' : 'computer');

// the landing square of a jump has to be on the board as well as free
const isEmptyAt = (board: CellModel[][], x: number, y: number) => inBounds(board, x, y) && !board[x][y].figure;

/** How many opposing pieces could capture the piece on (i, j) */
const countThreats = (board: CellModel[][], i: number, j: number, side: Side) =>
  ALL_DIRECTIONS.filter(([dx, dy]) => {
    if (!inBounds(board, i + dx, j + dy)) return false;

    const attacker = board[i + dx][j + dy].figure;
    const jumpsTowardsUs = directionsOf(attacker).some(([ax, ay]) => ax === -dx && ay === -dy);

    return sideOf(attacker) === opponentOf(side) && jumpsTowardsUs && isEmptyAt(board, i - dx, j - dy);
  }).length;

/** How many opposing pieces the piece on (i, j) could capture */
const countAttacks = (board: CellModel[][], i: number, j: number, side: Side) =>
  directionsOf(board[i][j].figure).filter(
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

/** Static evaluation of the board: positive is good for the computer, negative for the player */
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
