import minimax, { WIN_SCORE } from './minimax';
import { boardFrom } from './testBoard';
import { fillBoard } from './utils';
import calculateHeuristics from './heuristics';

const search = (board: ReturnType<typeof boardFrom>, depth: number, maximizing: boolean) =>
  minimax(board, depth, -Infinity, Infinity, maximizing);

describe('minimax', () => {
  it('should return the heuristic value at depth 0', () => {
    const board = fillBoard();

    expect(search(board, 0, true)).toBe(calculateHeuristics(board));
  });

  it('should score a position where the computer cannot move as a loss', () => {
    const board = boardFrom(['. . . .', '. . . .', '. p . .', '. . . c']);

    expect(search(board, 3, true)).toBe(-(WIN_SCORE + 3));
  });

  it('should score a position where the player cannot move as a win', () => {
    const board = boardFrom(['p . . .', '. . . .', '. . . .', '. . . c']);

    expect(search(board, 3, false)).toBe(WIN_SCORE + 3);
  });

  it('should find a winning capture and prefer it over a slower line', () => {
    // the computer captures the last player piece immediately
    const board = boardFrom(['. . . .', '. c . .', '. . p .', '. . . .']);

    expect(search(board, 3, true)).toBe(WIN_SCORE + 2);
  });
});
