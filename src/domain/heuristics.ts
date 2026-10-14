import { Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';

const calculateHeuristics = (board: CellModel[][]) => {
  const size = board.length;
  let weight = 0;
  let computerCount = 0;
  let playerCount = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j].figure === Figure.ComputerKing || board[i][j].figure === Figure.ComputerMan) {
        computerCount++;

        if (board[i][j].figure === Figure.ComputerMan) {
          weight += 5;
        }
        if (board[i][j].figure === Figure.ComputerKing) {
          weight += 10;
        }
        if (i === 0 || j === 0 || i === size - 1 || j === size - 1) {
          weight += 7;
        }
        if (i + 1 >= size || j - 1 < 0 || i - 1 < 0 || j + 1 >= size) {
          continue;
        }
        if (
          (board[i + 1][j - 1].figure === Figure.PlayerMan || board[i + 1][j - 1].figure === Figure.PlayerKing) &&
          !board[i - 1][j + 1].figure
        ) {
          weight -= 3;
        }
        if (
          (board[i + 1][j + 1].figure === Figure.PlayerMan || board[i + 1][j + 1].figure === Figure.PlayerKing) &&
          !board[i - 1][j - 1].figure
        ) {
          weight -= 3;
        }
        if (board[i - 1][j - 1].figure === Figure.PlayerKing && !board[i + 1][j + 1].figure) {
          weight -= 3;
        }

        if (board[i - 1][j + 1].figure === Figure.PlayerKing && !board[i + 1][j - 1].figure) {
          weight -= 3;
        }
        if (i + 2 >= size || i - 2 < 0) {
          continue;
        }
        if (
          (board[i + 1][j - 1].figure === Figure.PlayerKing || board[i + 1][j - 1].figure === Figure.PlayerMan) &&
          !board[i + 2][j - 2]?.figure
        ) {
          weight += 6;
        }
        if (i + 2 >= size || j + 2 >= size) {
          continue;
        }
        if (
          (board[i + 1][j + 1].figure === Figure.PlayerKing || board[i + 1][j + 1].figure === Figure.PlayerMan) &&
          !board[i + 2][j + 2].figure
        ) {
          weight += 6;
        }
      } else if (board[i][j].figure === Figure.PlayerMan || board[i][j].figure === Figure.PlayerKing) {
        playerCount++;
      }
    }
  }

  return weight + (computerCount - playerCount) * 1000;
};

export default calculateHeuristics;
