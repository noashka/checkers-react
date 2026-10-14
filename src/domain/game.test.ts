import { boardFrom } from './testBoard';
import {
  advanceDrawState,
  createDrawState,
  getGameStatus,
  isProgress,
  NO_PROGRESS_LIMIT,
  positionKey,
  REPETITIONS_FOR_DRAW,
} from './game';
import { fillBoard } from './utils';

describe('getGameStatus', () => {
  it('should keep playing from the initial position', () => {
    expect(getGameStatus(fillBoard(), 'player')).toBe('playing');
    expect(getGameStatus(fillBoard(), 'computer')).toBe('playing');
  });

  it('should be won by the opponent of a side with no pieces', () => {
    const noComputer = boardFrom(['. . . .', '. . . .', '. p . .', '. . . .']);
    const noPlayer = boardFrom(['. . . .', '. c . .', '. . . .', '. . . .']);

    expect(getGameStatus(noComputer, 'computer')).toBe('playerWins');
    expect(getGameStatus(noPlayer, 'player')).toBe('computerWins');
  });

  it('should be lost by a side that is blocked', () => {
    const blocked = boardFrom(['p . . .', '. c . .', '. . c .', '. . . .']);

    expect(getGameStatus(blocked, 'player')).toBe('computerWins');
  });
});

describe('draw detection', () => {
  const kings = boardFrom(['. . . .', '. P . .', '. . . .', '. . . C']);

  it('should count turns without progress and reset on progress', () => {
    let draw = createDrawState(kings, 'player');
    draw = advanceDrawState(draw, kings, 'computer', false);
    expect(draw.sinceProgress).toBe(1);

    draw = advanceDrawState(draw, kings, 'player', true);
    expect(draw.sinceProgress).toBe(0);
    expect(Object.keys(draw.positions)).toHaveLength(1);
  });

  it('should draw after too many turns without a capture or man move', () => {
    const almost = { sinceProgress: NO_PROGRESS_LIMIT - 1, positions: {} };

    expect(getGameStatus(kings, 'player', almost)).toBe('playing');
    expect(getGameStatus(kings, 'player', advanceDrawState(almost, kings, 'computer', false))).toBe('draw');
  });

  it('should draw on threefold repetition', () => {
    let draw = createDrawState(kings, 'player');
    for (let i = 1; i < REPETITIONS_FOR_DRAW; i++) {
      expect(getGameStatus(kings, 'player', draw)).toBe('playing');
      draw = advanceDrawState(draw, kings, 'player', false);
    }

    expect(getGameStatus(kings, 'player', draw)).toBe('draw');
  });

  it('should treat captures and man moves as progress, king moves as not', () => {
    const board = boardFrom(['. . . .', '. P . .', '. . . .', 'p . . .']);

    expect(isProgress(board, [1, 1, 0, 0], false)).toBe(false);
    expect(isProgress(board, [1, 1, 0, 0], true)).toBe(true);
    expect(isProgress(board, [3, 0, 2, 1], false)).toBe(true);
  });

  it('should tell positions apart by side to move', () => {
    expect(positionKey(kings, 'player')).not.toBe(positionKey(kings, 'computer'));
  });
});
