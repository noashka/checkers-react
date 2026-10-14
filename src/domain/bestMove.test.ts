import { findBestMove } from './bestMove';
import { boardFrom } from './testBoard';
import { fillBoard } from './utils';

describe('findBestMove', () => {
  it('should return null when the computer has no turn', () => {
    expect(findBestMove(boardFrom(['. . . .', '. . . .', '. p . .', '. . . c']))).toBeNull();
  });

  it('should take a capture that wins the game', () => {
    const best = findBestMove(boardFrom(['. . . .', '. c . .', '. . p .', '. . . .']));

    expect(best?.moves).toEqual([[1, 1, 3, 3]]);
    expect(best?.captures).toBe(1);
  });

  it('should play a legal turn from the initial position', () => {
    const board = fillBoard();
    const best = findBestMove(board, 3);

    expect(best).not.toBeNull();
    const [fromX, fromY] = best!.moves[0];
    expect(board[fromX][fromY].figure).toBe('computer-man');
    expect(best!.board).not.toBe(board);
  });

  it('should avoid a move that loses its only piece', () => {
    // stepping to (3, 2) lets the player capture it, stepping to the edge (3, 0) is safe
    const board = boardFrom(['. . . . . .', '. . . . . .', '. c . . . .', '. . . . . .', '. . . p . .', '. . . . . .']);

    expect(findBestMove(board, 3)?.moves).toEqual([[2, 1, 3, 0]]);
  });
});
