import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';
import { boardFrom } from './testBoard';
import {
  fillBoard,
  findPlayerAvailableMoves,
  findAvailableMoves,
  applyMove,
  findJumpsFrom,
  findContinuation,
  Move,
} from './utils';

const board = fillBoard(8);

const EMPTY = '. . . . . .';

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
    const result = applyMove(board, [5, 0, 4, 1]).board;
    const currentCell = result[5][0];
    const nextCell = result[4][1];

    expect(currentCell.figure).toBe('');
    expect(nextCell.figure).toBe(Figure.PlayerMan);
  });

  it('should not mutate the source board', () => {
    const source = fillBoard(8);
    const snapshot = JSON.stringify(source);

    applyMove(source, [5, 0, 4, 1]);

    expect(JSON.stringify(source)).toBe(snapshot);
  });

  it('should remove the captured piece on a jump', () => {
    const source = fillBoard(8);
    source[4][1] = new CellModel(source[4][1].label, Figure.ComputerMan, 4, 1);
    const result = applyMove(source, [5, 0, 3, 2]).board;

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

      expect(findPlayerAvailableMoves(board)).toHaveLength(5);
    });

    it('should make a capture the only valid move', () => {
      const board = boardFrom(['. . . .', '. . c .', '. p . .', 'p . . .']);

      expect(findPlayerAvailableMoves(board)).toEqual([[2, 1, 0, 3]]);
      expect(findJumpsFrom(board, 2, 1)).toHaveLength(1);
      expect(findJumpsFrom(board, 3, 0)).toHaveLength(0);
    });

    it('should not jump over own pieces or onto occupied squares', () => {
      const board = boardFrom(['. . . .', '. . p .', '. p . .', '. . c .']);

      expect(findPlayerAvailableMoves(board).every(([, , toX]) => toX === 1 || toX === 0)).toBe(true);
      expect(findJumpsFrom(board, 2, 1)).toHaveLength(0);
    });

    it('should let men capture backwards', () => {
      const player = boardFrom([EMPTY, EMPTY, '. . p . . .', '. . . c . .', EMPTY, EMPTY]);
      const computer = boardFrom([EMPTY, EMPTY, '. . p . . .', '. . . c . .', EMPTY, EMPTY]);

      expect(findPlayerAvailableMoves(player)).toEqual([[2, 2, 4, 4]]);
      // the computer man jumps towards row 0, which is backwards for it
      expect(findAvailableMoves(computer)).toEqual([[3, 3, 1, 1]]);
    });

    it('should not let men step backwards when nothing can be captured', () => {
      const board = boardFrom([EMPTY, EMPTY, '. . p . . .', EMPTY, EMPTY, EMPTY]);

      expect(findPlayerAvailableMoves(board).every(([fromX, , toX]) => toX < fromX)).toBe(true);
    });

    it('should find computer captures for men and kings', () => {
      const board = boardFrom(['. . . .', '. c . .', '. . p .', '. . . .']);

      expect(findAvailableMoves(board)).toEqual([[1, 1, 3, 3]]);
      expect(findJumpsFrom(board, 1, 1)).toHaveLength(1);
      expect(findJumpsFrom(board, 2, 2)).toHaveLength(1);

      const king = boardFrom(['. . . .', '. . p .', '. . . C', '. . . .']);
      expect(findAvailableMoves(king)).toEqual([[2, 3, 0, 1]]);
    });
  });

  describe('flying kings', () => {
    const E = '. . . . . . . .';

    it('should move any distance along an open diagonal and stop at the first piece', () => {
      const board = boardFrom([E, E, E, '. . . P . . . .', E, '. . . . . p . .', E, E]);
      const targets = findPlayerAvailableMoves(board)
        .filter(([fromX]) => fromX === 3)
        .map(([, , x, y]) => `${x},${y}`);

      // down-right is blocked by the own man at (5, 5), so (4, 4) is the last square on that diagonal
      expect(targets).toContain('4,4');
      expect(targets).not.toContain('5,5');
      expect(targets).toContain('0,0');
      expect(targets).toContain('6,0');
      expect(targets).toContain('0,6');
    });

    it('should capture from a distance and land on any free square behind the victim', () => {
      const board = boardFrom([E, E, E, '. . . . . . . P', E, '. . . . . c . .', E, E]);

      expect(findPlayerAvailableMoves(board)).toEqual([
        [3, 7, 6, 4],
        [3, 7, 7, 3],
      ]);
    });

    it('should capture a piece several squares away', () => {
      const board = boardFrom(['P . . . . . . .', E, E, E, '. . . . c . . .', E, E, E]);

      expect(findPlayerAvailableMoves(board)).toEqual([
        [0, 0, 5, 5],
        [0, 0, 6, 6],
        [0, 0, 7, 7],
      ]);

      const result = applyMove(board, [0, 0, 6, 6]);
      expect(result.captured).toBe(true);
      expect(result.board[4][4].figure).toBe('');
      expect(result.board[6][6].figure).toBe(Figure.PlayerKing);
      expect(result.board[0][0].figure).toBe('');
    });

    it('should not jump two pieces in a row, own pieces, or onto an occupied square', () => {
      const twoInARow = boardFrom(['P . . . . . . .', '. c . . . . . .', '. . c . . . . .', E, E, E, E, E]);
      const ownPiece = boardFrom(['P . . . . . . .', '. p . . . . . .', E, E, E, E, E, E]);
      const blockedLanding = boardFrom(['P . . . . . . .', '. c . . . . . .', '. . p . . . . .', E, E, E, E, E]);

      expect(findJumpsFrom(twoInARow, 0, 0)).toEqual([]);
      expect(findJumpsFrom(ownPiece, 0, 0)).toEqual([]);
      expect(findJumpsFrom(blockedLanding, 0, 0)).toEqual([]);
      expect(() => applyMove(twoInARow, [0, 0, 3, 3])).toThrow('Illegal move');
    });

    it('should let a king continue a capture with another long jump', () => {
      const board = boardFrom(['P . . . . . . .', E, '. . c . . . . .', E, E, '. c . . . . . .', E, E]);
      const move: Move = [0, 0, 3, 3];

      expect(findContinuation(applyMove(board, move), move)).toEqual([[3, 3, 6, 0]]);
    });
  });

  describe('capture sequences', () => {
    const board = boardFrom(['. . . . . .', '. . c . . .', '. . . . . .', '. . c . . .', '. . . p . p', '. . . . . .']);

    it('should list the jumps a piece can continue with', () => {
      expect(findJumpsFrom(board, 4, 3)).toEqual([[4, 3, 2, 1]]);
      expect(findJumpsFrom(board, 4, 5)).toEqual([]);
    });

    it('should restrict a chain to the piece that just jumped', () => {
      expect(findPlayerAvailableMoves(board)).toEqual([[4, 3, 2, 1]]);
      expect(findPlayerAvailableMoves(board, { x: 4, y: 3 })).toEqual([[4, 3, 2, 1]]);
      expect(findPlayerAvailableMoves(board, { x: 4, y: 5 })).toEqual([]);
    });

    it('should not offer plain steps in the middle of a chain', () => {
      const open = boardFrom(['. . . .', '. . . .', '. p . .', '. . . .']);

      expect(findPlayerAvailableMoves(open)).toHaveLength(2);
      expect(findPlayerAvailableMoves(open, { x: 2, y: 1 })).toEqual([]);
    });
  });

  describe('capture continuation', () => {
    it('should end the turn when a man is promoted by a capture', () => {
      const board = boardFrom([
        '. . . . . .',
        '. c . c . .',
        'p . . . . .',
        '. . . . . .',
        '. . . . . .',
        '. . . . . .',
      ]);
      const move: Move = [2, 0, 0, 2];
      const result = applyMove(board, move);

      expect(result.promoted).toBe(true);
      // as a king the piece could jump again, but promotion ends the turn
      expect(findJumpsFrom(result.board, 0, 2)).toEqual([
        [0, 2, 2, 4],
        [0, 2, 3, 5],
      ]);
      expect(findContinuation(result, move)).toEqual([]);
    });

    it('should continue the turn when an unpromoted piece can jump again', () => {
      const board = boardFrom([
        '. . . . . .',
        '. . . . . .',
        '. c . . . .',
        '. . . . . .',
        '. . . c . .',
        '. . . . p .',
      ]);
      const move: Move = [5, 4, 3, 2];

      expect(findContinuation(applyMove(board, move), move)).toEqual([[3, 2, 1, 0]]);
    });

    it('should not continue after a plain step', () => {
      const move: Move = [2, 1, 1, 0];
      const result = applyMove(boardFrom(['. . . .', '. . . .', '. p . .', '. . . .']), move);

      expect(findContinuation(result, move)).toEqual([]);
    });
  });

  describe('applyMove', () => {
    it('should promote a man that reaches the far row', () => {
      const board = boardFrom(['. . . .', 'p . . .', '. . . c', '. . . .']);

      const player = applyMove(board, [1, 0, 0, 1]);
      expect(player.promoted).toBe(true);
      expect(player.board[0][1].figure).toBe(Figure.PlayerKing);

      const computer = applyMove(board, [2, 3, 3, 2]);
      expect(computer.promoted).toBe(true);
      expect(computer.board[3][2].figure).toBe(Figure.ComputerKing);
    });

    it('should not report a king move as promotion', () => {
      const board = boardFrom(['. . . .', 'P . . .', '. . . .', '. . . .']);
      const result = applyMove(board, [1, 0, 0, 1]);

      expect(result.promoted).toBe(false);
      expect(result.board[0][1].figure).toBe(Figure.PlayerKing);
    });

    it('should report captures', () => {
      const board = boardFrom(['. . . .', '. c . .', 'p . . .', '. . . .']);

      expect(applyMove(board, [2, 0, 0, 2]).captured).toBe(true);
      expect(applyMove(boardFrom(['. . . .', '. . . .', 'p . . .', '. . . .']), [2, 0, 1, 1]).captured).toBe(false);
    });

    describe('validation', () => {
      const board = boardFrom(['. . . .', '. c . .', '. . p .', 'p . . .']);

      it.each([
        ['an empty source square', [0, 0, 1, 1]],
        ['an occupied target', [2, 2, 1, 1]],
        ['a backward move by a man', [2, 2, 3, 1]],
        ['a move longer than a step', [3, 0, 1, 2]],
        ['a non-diagonal move', [3, 0, 2, 0]],
        ['a target outside the board', [3, 0, 4, 1]],
        ['a source outside the board', [-1, 0, 0, 1]],
      ] as [string, Move][])('should reject %s', (_name, move) => {
        expect(() => applyMove(board, move)).toThrow('Illegal move');
      });

      it('should reject a jump over an empty square or an own piece', () => {
        expect(() => applyMove(boardFrom(['. . . .', '. . . .', '. . p .', '. . . .']), [2, 2, 0, 0])).toThrow();
        expect(() => applyMove(boardFrom(['. . . .', '. p . .', '. . p .', '. . . .']), [2, 2, 0, 0])).toThrow();
      });
    });
  });
});
