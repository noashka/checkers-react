import calculateHeuristics from './heuristics';
import { boardFrom } from './testBoard';

const EMPTY_ROW = '. . . . . .';

describe('calculateHeuristics', () => {
  it('should score an attack from a piece on the edge', () => {
    const board = boardFrom([EMPTY_ROW, EMPTY_ROW, 'c . . . . .', '. p . . . .', EMPTY_ROW, EMPTY_ROW]);

    // man 5 + edge 7 + attack 6, material is even
    expect(calculateHeuristics(board)).toBe(18);
  });

  it('should score an attack from the second row', () => {
    const board = boardFrom([EMPTY_ROW, '. . c . . .', '. . . p . .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW]);

    // man 5 + attack 6 - threat 3 (the attacked man can capture back towards the empty (0, 1))
    expect(calculateHeuristics(board)).toBe(8);
  });

  it('should not count a jump that would land outside the board as an attack', () => {
    const board = boardFrom([EMPTY_ROW, EMPTY_ROW, '. c . . . .', 'p . . . . .', EMPTY_ROW, EMPTY_ROW]);

    // man 5 - threat 3, no attack: the landing square (4, -1) does not exist
    expect(calculateHeuristics(board)).toBe(2);
  });

  it('should let a king attack backwards but not a man', () => {
    const rows = [EMPTY_ROW, '. . . p . .', '. . C . . .', EMPTY_ROW, EMPTY_ROW, EMPTY_ROW];
    const king = boardFrom(rows);
    const man = boardFrom(rows.map((row) => row.replace('C', 'c')));

    // king 10 + attack 6, the man behind it cannot capture a king
    expect(calculateHeuristics(king)).toBe(16);
    // man 5, it cannot capture backwards
    expect(calculateHeuristics(man)).toBe(5);
  });
});
