import calculateHeuristics from './heuristics';
import { boardFrom } from './testBoard';

const EMPTY_ROW = '. . . . . .';

describe('calculateHeuristics', () => {
  it('should score an attack from a piece on the edge', () => {
    const board = boardFrom([EMPTY_ROW, EMPTY_ROW, 'c . . . . .', '. p . . . .', EMPTY_ROW, EMPTY_ROW]);

    // computer: man 5 + edge 7 + attack 6; player: man 5 - threat 3
    expect(calculateHeuristics(board)).toBe(16);
  });

  it('should score an attack from the second row', () => {
    const board = boardFrom([EMPTY_ROW, '. . c . . .', '. . . p . .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW]);

    // both men attack each other and are attacked: 5 + 6 - 3 each
    expect(calculateHeuristics(board)).toBe(0);
  });

  it('should not count a jump that would land outside the board as an attack', () => {
    const board = boardFrom([EMPTY_ROW, EMPTY_ROW, '. c . . . .', 'p . . . . .', EMPTY_ROW, EMPTY_ROW]);

    // computer man 5 - threat 3, no attack: the landing square (4, -1) does not exist
    // player man 5 + edge 7 + attack 6
    expect(calculateHeuristics(board)).toBe(-16);
  });

  it('should count backward captures for men as well as kings', () => {
    const rows = [EMPTY_ROW, '. . . p . .', '. . C . . .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW];
    const king = boardFrom(rows);
    const man = boardFrom(rows.map((row) => row.replace('C', 'c')));

    // both pieces can capture each other: attack 6 - threat 3 on each side, the king adds 600 material
    expect(calculateHeuristics(king)).toBe(600);
    expect(calculateHeuristics(man)).toBe(0);
  });

  it('should be symmetric: mirroring the board and swapping sides negates the score', () => {
    const swap = (char: string) => ({ c: 'p', C: 'P', p: 'c', P: 'C' })[char] ?? char;
    const mirror = (rows: string[]) => [...rows].reverse().map((row) => row.split(' ').map(swap).join(' '));
    const chars = ['.', '.', '.', 'c', 'C', 'p', 'P'];
    // deterministic pseudo-random numbers keep the test reproducible
    let seed = 42;
    const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) >> 4;

    for (let n = 0; n < 200; n++) {
      const rows = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => chars[next() % chars.length]).join(' '),
      );

      expect(calculateHeuristics(boardFrom(mirror(rows))) + calculateHeuristics(boardFrom(rows))).toBe(0);
    }
  });

  it('should value material', () => {
    const computerOnly = boardFrom([EMPTY_ROW, '. c . . . .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW, EMPTY_ROW]);
    const even = boardFrom([EMPTY_ROW, '. c . . . .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW, '. . . . p .']);
    const playerOnly = boardFrom([EMPTY_ROW, EMPTY_ROW, EMPTY_ROW, EMPTY_ROW, EMPTY_ROW, '. . . . p .']);

    expect(calculateHeuristics(computerOnly)).toBeGreaterThan(calculateHeuristics(even));
    expect(calculateHeuristics(even)).toBeGreaterThan(calculateHeuristics(playerOnly));
  });

  it('should value a king more than a man but less than two men', () => {
    const score = (piece: string) =>
      calculateHeuristics(boardFrom([EMPTY_ROW, EMPTY_ROW, `. . ${piece} . . .`, EMPTY_ROW, EMPTY_ROW, EMPTY_ROW]));
    const twoMen = calculateHeuristics(
      boardFrom([EMPTY_ROW, EMPTY_ROW, '. . c . c .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW]),
    );

    expect(score('C')).toBeGreaterThan(score('c') + 500);
    expect(score('C')).toBeLessThan(twoMen);
    expect(score('P')).toBe(-score('C'));
  });
});
