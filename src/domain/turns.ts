import CellModel from '../entities/CellModel';
import { applyMove, findContinuation, findMoves, Move, Side } from './utils';

export type Turn = {
  moves: Move[];
  board: CellModel[][];
  captures: number;
};

const expand = (board: CellModel[][], move: Move, previous: Move[], captures: number): Turn[] => {
  const result = applyMove(board, move);
  const moves = [...previous, move];
  const total = result.captured ? captures + 1 : captures;
  const continuation = findContinuation(result, move);

  if (continuation.length === 0) return [{ moves, board: result.board, captures: total }];

  return continuation.flatMap((next) => expand(result.board, next, moves, total));
};

export const findTurns = (board: CellModel[][], side: Side): Turn[] =>
  findMoves(board, side).flatMap((move) => expand(board, move, [], 0));
