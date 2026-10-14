import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';
import { directionsOf, inBounds, sideOf, Side } from './utils';

const MATERIAL_WEIGHT = 1000;
const MAN_WEIGHT = 5;
const KING_WEIGHT = 10;
const EDGE_BONUS = 7;
const THREAT_PENALTY = 3;
const ATTACK_BONUS = 6;

const isSideAt = (board: CellModel[][], x: number, y: number, side: Side) =>
  inBounds(board, x, y) && sideOf(board[x][y].figure) === side;

const isPlayerKingAt = (board: CellModel[][], x: number, y: number) =>
  inBounds(board, x, y) && board[x][y].figure === Figure.PlayerKing;

// the landing square of a jump has to be on the board as well as free
const isEmptyAt = (board: CellModel[][], x: number, y: number) => inBounds(board, x, y) && !board[x][y].figure;

/** How many opposing pieces could capture the computer piece on (i, j) */
const countThreats = (board: CellModel[][], i: number, j: number) => {
  let threats = 0;

  if (isSideAt(board, i + 1, j - 1, 'player') && isEmptyAt(board, i - 1, j + 1)) threats++;
  if (isSideAt(board, i + 1, j + 1, 'player') && isEmptyAt(board, i - 1, j - 1)) threats++;
  if (isPlayerKingAt(board, i - 1, j - 1) && isEmptyAt(board, i + 1, j + 1)) threats++;
  if (isPlayerKingAt(board, i - 1, j + 1) && isEmptyAt(board, i + 1, j - 1)) threats++;

  return threats;
};

/** How many opposing pieces the computer piece on (i, j) could capture */
const countAttacks = (board: CellModel[][], i: number, j: number) =>
  directionsOf(board[i][j].figure).filter(
    ([dx, dy]) => isSideAt(board, i + dx, j + dy, 'player') && isEmptyAt(board, i + 2 * dx, j + 2 * dy),
  ).length;

const calculateHeuristics = (board: CellModel[][]) => {
  const size = board.length;
  let weight = 0;
  let computerCount = 0;
  let playerCount = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const { figure } = board[i][j];
      const side = sideOf(figure);

      if (side === 'computer') {
        computerCount++;
        weight += figure === Figure.ComputerMan ? MAN_WEIGHT : KING_WEIGHT;

        if (i === 0 || j === 0 || i === size - 1 || j === size - 1) weight += EDGE_BONUS;

        weight -= countThreats(board, i, j) * THREAT_PENALTY;
        weight += countAttacks(board, i, j) * ATTACK_BONUS;
      } else if (side === 'player') {
        playerCount++;
      }
    }
  }

  return weight + (computerCount - playerCount) * MATERIAL_WEIGHT;
};

export default calculateHeuristics;
