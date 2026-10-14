import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';
import { boardFrom } from './testBoard';
import {
  fillBoard,
  findPlayerAvailableMoves,
  findAvailableMoves,
  makeAmove,
  shouldJump,
  shouldPlayerJump,
} from './utils';

const board = fillBoard(8);

describe('test domain utils', () => {
  it('should fill board', () => {
    const size = 2;
    const result = fillBoard(size);
    expect(result.length).toBe(size);
  });

  it('should place pieces on a board of any even size', () => {
    const size = 6;
    const cells = fillBoard(size).flat();

    expect(cells.filter((cell) => cell.figure === Figure.ComputerMan)).toHaveLength(6);
    expect(cells.filter((cell) => cell.figure === Figure.PlayerMan)).toHaveLength(6);
  });

  it('should find moves on a smaller board without leaving it', () => {
    const small = fillBoard(6);

    expect(findAvailableMoves(small).length).toBeGreaterThan(0);
    expect(findPlayerAvailableMoves(small).length).toBeGreaterThan(0);
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
    const result = makeAmove({ board, currentX: 5, currentY: 0, targetX: 4, targetY: 1, king: Figure.PlayerKing });
    const currentCell = result[5][0];
    const nextCell = result[4][1];

    expect(currentCell.figure).toBe('');
    expect(nextCell.figure).toBe(Figure.PlayerMan);
  });

  it('should not mutate the source board', () => {
    const source = fillBoard(8);
    const snapshot = JSON.stringify(source);

    makeAmove({ board: source, currentX: 5, currentY: 0, targetX: 4, targetY: 1, king: Figure.PlayerKing });

    expect(JSON.stringify(source)).toBe(snapshot);
  });

  it('should remove the captured piece on a jump', () => {
    const source = fillBoard(8);
    source[4][1] = new CellModel(source[4][1].label, Figure.ComputerMan, 4, 1);
    const result = makeAmove({
      board: source,
      currentX: 5,
      currentY: 0,
      targetX: 3,
      targetY: 2,
      king: Figure.PlayerKing,
    });

    expect(result[4][1].figure).toBe('');
    expect(result[3][2].figure).toBe(Figure.PlayerMan);
  });

  describe('move generation', () => {
    it('should let men move forward only', () => {
      const board = boardFrom(['. . . .', '. p . .', '. . . .', '. . . .']);

      expect(findPlayerAvailableMoves(board)).toEqual([
        [1, 1, 0, 0],
        [1, 1, 0, 2],
      ]);
    });

    it('should let kings move in every direction', () => {
      const board = boardFrom(['. . . .', '. . P .', '. . . .', '. . . .']);

      expect(findPlayerAvailableMoves(board)).toHaveLength(4);
    });

    it('should make a capture the only valid move', () => {
      const board = boardFrom(['. . . .', '. . c .', '. p . .', 'p . . .']);

      expect(findPlayerAvailableMoves(board)).toEqual([[2, 1, 0, 3]]);
      expect(shouldPlayerJump(board, 2, 1)).toBe(true);
      expect(shouldPlayerJump(board, 3, 0)).toBe(false);
    });

    it('should not jump over own pieces or onto occupied squares', () => {
      const board = boardFrom(['. . . .', '. . p .', '. p . .', '. . c .']);

      expect(findPlayerAvailableMoves(board).every(([, , toX]) => toX === 1 || toX === 0)).toBe(true);
      expect(shouldPlayerJump(board, 2, 1)).toBe(false);
    });

    it('should find computer captures for men and kings', () => {
      const board = boardFrom(['. . . .', '. c . .', '. . p .', '. . . .']);

      expect(findAvailableMoves(board)).toEqual([[1, 1, 3, 3]]);
      expect(shouldJump(board, 1, 1)).toBe(true);
      expect(shouldJump(board, 2, 2)).toBe(false);

      const king = boardFrom(['. . . .', '. . p .', '. . . C', '. . . .']);
      expect(findAvailableMoves(king)).toEqual([[2, 3, 0, 1]]);
    });
  });
});
