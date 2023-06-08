import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';

const calculateHeuristics = (board: CellModel[][]) => {
  let weight = 0;
  let playerPieces = 0;
  let computerPieces = 0;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j].figure === Figure.Computer || board[i][j].figure === Figure.computer) {
        playerPieces++;

        if (board[i][j].figure === Figure.computer) {
          weight += 5;
        }
        if (board[i][j].figure === Figure.Computer) {
          weight += 10;
        }
        if (i === 0 || j === 0 || i === 7 || j === 7) {
          weight += 7;
        }
        if (i + 1 > 7 || j - 1 < 0 || i - 1 < 0 || j + 1 > 7) {
          continue;
        }
        if (
          (board[i + 1][j - 1].figure === Figure.player || board[i + 1][j - 1].figure === Figure.Player) &&
          !board[i - 1][j + 1].figure
        ) {
          weight -= 3;
        }
        if (
          (board[i + 1][j + 1].figure === Figure.player || board[i + 1][j + 1].figure === Figure.Player) &&
          !board[i - 1][j - 1].figure
        ) {
          weight -= 3;
        }
        if (board[i - 1][j - 1].figure === Figure.Player && !board[i + 1][j + 1].figure) {
          weight -= 3;
        }

        if (board[i - 1][j + 1].figure === Figure.Player && !board[i + 1][j - 1].figure) {
          weight -= 3;
        }
        if (i + 2 > 7 || i - 2 < 0) {
          continue;
        }
        if (
          (board[i + 1][j - 1].figure === Figure.Player || board[i + 1][j - 1].figure === Figure.player) &&
          !board[i + 2][j - 2]?.figure
        ) {
          weight += 6;
        }
        if (i + 2 > 7 || j + 2 > 7) {
          continue;
        }
        if (
          (board[i + 1][j + 1].figure === Figure.Player || board[i + 1][j + 1].figure === Figure.player) &&
          !board[i + 2][j + 2].figure
        ) {
          weight += 6;
        }
      } else if (board[i][j].figure === Figure.player || board[i][j].figure === Figure.Player) {
        computerPieces++;
      }
    }
  }

  return weight + (playerPieces - computerPieces) * 1000;
};

export default calculateHeuristics;
