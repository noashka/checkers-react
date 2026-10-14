# Checkers

A checkers game against the computer, built with React and TypeScript. You play the light pieces at the bottom
and move first.

## Rules

Draughts on an 8x8 board, 12 pieces per side, with Russian-style capture rules (flying kings, backward captures):

- Men move one square diagonally forward onto an empty square. A man that reaches the far row becomes a king.
- Kings are "flying": they move any number of free squares along a diagonal, in any direction.
- A capture jumps over an opposing piece and lands behind it, in any of the four diagonal directions, so men may
  capture backwards even though they cannot step backwards. A man jumps a piece right next to it; a king may jump a
  piece at any distance along an open diagonal and land on any free square behind it, as long as there is exactly
  one piece on the way.
- **A capture is mandatory.** If any piece can capture, only captures are valid moves.
- **Capture sequences.** After a capture the same piece must keep jumping while it can. A man promoted by a capture
  ends its turn there, even if the new king could continue. A king may pick any landing square behind the captured
  piece and continue from it.
- **Winning.** A side that has no pieces or no legal move loses.
- **Draws.** The game is drawn after 80 plies (40 moves each) without a capture or man move, or when the same
  position occurs three times.

## Controls

- Drag a piece with the mouse and drop it on the target square. Dragging highlights the squares it may move to.
- An illegal drop is ignored. During a capture sequence only the jumping piece can be moved.
- The computer answers automatically; its last turn is shown below the title.
- **Restart** starts a new game. Game over and draws are announced with an alert and the game restarts.

## The computer player

The computer searches with minimax and alpha-beta pruning:

- Moves are generated as whole turns, so a capture sequence is one move in the search.
- The static evaluation is symmetric (mirroring the board and swapping sides negates the score). It counts material
  (a king is worth 1600, a man 1000), a bonus for pieces on the edge, a penalty for pieces that can be captured and
  a bonus for pieces that can capture.
- Won and lost positions score above any evaluation, preferring quicker wins and slower losses.
- Captures are searched first and positions are cached in a transposition table.
- Iterative deepening searches 1, 2, ... 8 plies and keeps the deepest result that finished within 500 ms.

## Getting started

```
npm install
npm start
```

Open `http://localhost:1337`.

| Script                  | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `npm start`             | Vite dev server on port 1337                       |
| `npm run build`         | Typecheck and production build into `dist`         |
| `npm run preview`       | Serve the production build                         |
| `npm test`              | Run unit tests once (Vitest)                       |
| `npm run test:watch`    | Run unit tests in watch mode                       |
| `npm run test:coverage` | Run tests; fails below 100% coverage of the domain |
| `npm run typecheck`     | TypeScript 7 typecheck                             |
| `npm run lint`          | Lint with oxlint                                   |

## Project structure

```
src/
  App.tsx            game flow: player turn, computer turn, game over
  Board/, Square/    drag-and-drop board rendering (DOM and CSS only)
  hooks/             game state reducer, drag ghost
  entities/          CellModel
  helpers/           constants (figures, board size), delay
  domain/            game logic, independent of React
    utils.ts           board setup, move generation, applyMove, capture continuation
    turns.ts           complete turns including capture sequences
    game.ts            game status, draw detection
    heuristics.ts      static evaluation
    minimax.ts         alpha-beta search, transposition table
    bestMove.ts        iterative deepening and root move selection
    Node.ts            search tree node
```

Domain functions are pure: `applyMove` returns a new board (and throws on an illegal move) instead of mutating the
old one.

## Tests

Unit tests live next to the domain code (`*.test.ts`) and use `boardFrom` (`src/domain/testBoard.ts`) to draw
positions as text, with `c`/`C` for computer man/king, `p`/`P` for player man/king and `.` for empty. The search is
checked against a plain minimax implementation, and the evaluation against its symmetry on random positions.

## Roadmap

- [x] Drag-and-drop play with highlighted moves
- [x] Mandatory captures and capture sequences
- [x] Kings
- [x] Computer opponent (minimax)
- [x] Game over and draw detection
- [x] Unit tests for the game logic
- [ ] Restoring the game state after a page reload
- [ ] Reverting the last move
- [ ] Better game stats UI (game time, number of moves, victory banners)
