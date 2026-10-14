import minimax, { SearchTimeout, WIN_SCORE, TranspositionTable } from './minimax';
import Node from './Node';
import { positionKey } from './game';
import { findTurns } from './turns';
import { boardFrom } from './testBoard';
import { fillBoard, findMoves } from './utils';
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

  describe('search optimisations', () => {
    type Board = ReturnType<typeof boardFrom>;

    // plain minimax without pruning, ordering or caching
    const reference = (board: Board, depth: number, maximizing: boolean): number => {
      if (findMoves(board, maximizing ? 'computer' : 'player').length === 0) {
        return maximizing ? -(WIN_SCORE + depth) : WIN_SCORE + depth;
      }
      if (depth === 0) return calculateHeuristics(board);

      const values = new Node(board)
        .getChildren(maximizing)
        .map((child) => reference(child.board, depth - 1, !maximizing));

      return maximizing ? Math.max(...values) : Math.min(...values);
    };

    // deterministic random playouts from the initial position give varied, reachable positions
    const playouts = (): { board: Board; maximizing: boolean }[] => {
      let seed = 7;
      const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) >> 4;
      const positions: { board: Board; maximizing: boolean }[] = [];
      let board = fillBoard();
      let maximizing = false;

      for (let ply = 0; ply < 40; ply++) {
        const turns = findTurns(board, maximizing ? 'computer' : 'player');
        if (turns.length === 0) break;

        board = turns[next() % turns.length].board;
        maximizing = !maximizing;
        if (ply % 4 === 3) positions.push({ board, maximizing });
      }

      return positions;
    };

    it('should give the same value as plain minimax with ordering, pruning and a transposition table', () => {
      const positions = playouts();
      expect(positions.length).toBeGreaterThan(5);

      for (const { board, maximizing } of positions) {
        const expected = reference(board, 3, maximizing);
        const table: TranspositionTable = new Map();

        expect(search(board, 3, maximizing)).toBe(expected);
        expect(minimax(board, 3, -Infinity, Infinity, maximizing, { table })).toBe(expected);
        // a second search is answered from the filled table
        expect(minimax(board, 3, -Infinity, Infinity, maximizing, { table })).toBe(expected);
        expect(table.size).toBeGreaterThan(0);
      }
    });

    it('should cut off on cached bounds that already decide the window', () => {
      const board = fillBoard();
      const key = positionKey(board, 'computer');
      const lower: TranspositionTable = new Map([[key, { depth: 3, value: 500, bound: 'lower' }]]);
      const upper: TranspositionTable = new Map([[key, { depth: 3, value: 50, bound: 'upper' }]]);

      expect(minimax(board, 3, -Infinity, 100, true, { table: lower })).toBe(500);
      expect(minimax(board, 3, 100, Infinity, true, { table: upper })).toBe(50);
    });

    it('should abandon the search once the deadline has passed', () => {
      expect(() => minimax(fillBoard(), 3, -Infinity, Infinity, true, { deadline: Date.now() - 1 })).toThrow(
        SearchTimeout,
      );
    });
  });
});
