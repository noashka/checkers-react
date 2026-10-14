import { findBestMove } from './bestMove';
import { fillBoard } from './utils';

vi.mock('./minimax', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./minimax')>()),
  default: () => {
    throw new Error('boom');
  },
}));

describe('findBestMove errors', () => {
  it('should rethrow failures that are not a search timeout', () => {
    expect(() => findBestMove(fillBoard(), { maxDepth: 2, timeLimitMs: Infinity })).toThrow('boom');
  });
});
