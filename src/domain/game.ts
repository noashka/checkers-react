import CellModel from '../entities/CellModel';
import { Figure } from '../helpers/constants';
import { findMoves, isKing, Move, Side } from './utils';

export type GameStatus = 'playing' | 'playerWins' | 'computerWins' | 'draw';

export const NO_PROGRESS_LIMIT = 80;
export const REPETITIONS_FOR_DRAW = 3;

export type DrawState = {
  sinceProgress: number;
  positions: Record<string, number>;
};

const FIGURE_CODES: Record<Figure, string> = {
  [Figure.PlayerMan]: 'p',
  [Figure.PlayerKing]: 'P',
  [Figure.ComputerMan]: 'c',
  [Figure.ComputerKing]: 'C',
};

export const positionKey = (board: CellModel[][], sideToMove: Side) =>
  board.map((row) => row.map((cell) => (cell.figure ? FIGURE_CODES[cell.figure] : '.')).join('')).join('/') +
  `:${sideToMove}`;

export const createDrawState = (board: CellModel[][], sideToMove: Side): DrawState => ({
  sinceProgress: 0,
  positions: { [positionKey(board, sideToMove)]: 1 },
});

export const isProgress = (boardBefore: CellModel[][], [fromX, fromY]: Move, captured: boolean) =>
  captured || !isKing(boardBefore[fromX][fromY].figure);

export const advanceDrawState = (
  draw: DrawState,
  board: CellModel[][],
  sideToMove: Side,
  progress: boolean,
) => {
  const key = positionKey(board, sideToMove);

  return {
    sinceProgress: progress ? 0 : draw.sinceProgress + 1,
    positions: { ...(progress ? {} : draw.positions), [key]: (progress ? 0 : (draw.positions[key] ?? 0)) + 1 },
  };
};

export const getGameStatus = (board: CellModel[][], sideToMove: Side, draw?: DrawState): GameStatus => {
  // a side that cannot move, because it has no pieces left or is blocked, loses
  if (findMoves(board, sideToMove).length === 0) {
    return sideToMove === 'player' ? 'computerWins' : 'playerWins';
  }

  if (
    draw &&
    (draw.sinceProgress >= NO_PROGRESS_LIMIT || Object.values(draw.positions).some((n) => n >= REPETITIONS_FOR_DRAW))
  ) {
    return 'draw';
  }

  return 'playing';
};
