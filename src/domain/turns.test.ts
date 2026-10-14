import { Figure } from '../helpers/constants';
import { boardFrom } from './testBoard';
import Node from './Node';
import { findTurns } from './turns';

describe('findTurns', () => {
  it('should return one turn per step when nothing can be captured', () => {
    const board = boardFrom(['. . . .', '. . . .', '. p . .', '. . . .']);
    const turns = findTurns(board, 'player');

    expect(turns).toHaveLength(2);
    expect(turns.every((turn) => turn.moves.length === 1 && turn.captures === 0)).toBe(true);
  });

  it('should chain consecutive captures into a single turn', () => {
    const board = boardFrom(['. . . . . .', '. . . . . .', '. c . . . .', '. . . . . .', '. . . c . .', '. . . . p .']);
    const [turn, ...rest] = findTurns(board, 'player');

    expect(rest).toHaveLength(0);
    expect(turn.moves).toEqual([
      [5, 4, 3, 2],
      [3, 2, 1, 0],
    ]);
    expect(turn.captures).toBe(2);
    expect(turn.board[4][3].figure).toBe('');
    expect(turn.board[2][1].figure).toBe('');
    expect(turn.board[1][0].figure).toBe(Figure.PlayerMan);
  });

  it('should branch when a capture can continue in several directions', () => {
    const board = boardFrom([
      '. . . . . . . .',
      '. . . . . . . .',
      '. . . . . . . .',
      '. . . . c . c .',
      '. . . . . . . .',
      '. . . . c . . .',
      '. . . p . . . .',
      '. . . . . . . .',
    ]);
    const turns = findTurns(board, 'player');

    expect(turns.map((turn) => turn.moves)).toEqual([
      [
        [6, 3, 4, 5],
        [4, 5, 2, 3],
      ],
      [
        [6, 3, 4, 5],
        [4, 5, 2, 7],
      ],
    ]);
    expect(turns.every((turn) => turn.captures === 2)).toBe(true);
  });

  it('should stop a capture sequence at promotion', () => {
    const board = boardFrom(['. . . . . .', '. c . c . .', 'p . . . . .', '. . . . . .', '. . . . . .', '. . . . . .']);
    const [turn, ...rest] = findTurns(board, 'player');

    expect(rest).toHaveLength(0);
    expect(turn.moves).toEqual([[2, 0, 0, 2]]);
    expect(turn.captures).toBe(1);
    expect(turn.board[0][2].figure).toBe(Figure.PlayerKing);
  });

  it('should only generate the mandatory captures', () => {
    const board = boardFrom(['. . . .', '. c . .', 'p . . .', '. . . p']);

    expect(findTurns(board, 'player').map((turn) => turn.moves)).toEqual([[[2, 0, 0, 2]]]);
  });
});

describe('Node', () => {
  it('should expose turns of the requested side as children', () => {
    const board = boardFrom(['. . . .', '. c . .', '. . p .', '. . . .']);
    const node = new Node(board);

    expect(node.getBoard()).toBe(board);
    expect(node.getChildren(true).map((child) => child.moves)).toEqual([[[1, 1, 3, 3]]]);
    expect(node.getChildren(true)[0].captures).toBe(1);
    expect(node.getChildren(false).map((child) => child.moves)).toEqual([[[2, 2, 0, 0]]]);
  });
});
