import { fillBoard, findPlayerAvailableMoves, findAvailableMoves, makeAmove } from './utils';

const board = fillBoard(8);

describe('test domain utils', () => {
  it('should fill board', () => {
    const size = 2;
    const result = fillBoard(size);
    expect(result.length).toBe(size);
  });

  it('should find player available moves', () => {
    const result = findPlayerAvailableMoves(board);
    const possiblePlayerMoves = 7;

    expect(result.length).toBe(possiblePlayerMoves);
  });

  it('should find available move', () => {
    const result = findAvailableMoves(board);
    const possibleMoves = 7;

    expect(result.length).toBe(possibleMoves);
  });

  it('should make a move', () => {
    const result = makeAmove({ board, currentX: 5, currentY: 0, targetX: 4, targetY: 1, bigLetter: 'B' });
    const currentCell = result[5][0];
    const nextCell = result[4][1];

    expect(currentCell.figure).toBe('');
    expect(nextCell.figure).toBe('b41');
  });
});
