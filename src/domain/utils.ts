import { Label, Figure } from '../helpers/constants';
import CellModel from '../entities/CellModel';

export const fillBoard = (size = 8): CellModel[][] => {
  const board = Array.from({ length: size }, () => []);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const label = (i + j) % 2 !== 0 ? Label.Dark : Label.Light;
      board[i][j] = new CellModel(label, '', i, j);

      if (i < 3 && (i + j) % 2 === 1) {
        board[i][j] = new CellModel(label, Figure.computer, i, j);
      }

      if (i > 4 && (i + j) % 2 === 1) {
        board[i][j] = new CellModel(label, Figure.player, i, j);
      }
    }
  }

  return board;
};

const checkPlayerMoves = (
  board: CellModel[][],
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
) => {
  if (targetX > 7 || targetX < 0) return false;

  if (targetY > 7 || targetY < 0) return false;

  if (!board[currentX][currentY].figure) return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure === Figure.computer || board[currentX][currentY].figure === Figure.Computer)
    return false;

  if (!board[targetX][targetY].figure) return true;
};

const checkPlayerJumps = (
  board: CellModel[][],
  currentX: number,
  currentY: number,
  crossX: number,
  crossY: number,
  targetX: number,
  targetY: number,
) => {
  if (targetX > 7 || targetX < 0) return false;

  if (targetY > 7 || targetY < 0) return false;

  if (board[crossX][crossY].figure === '') return false;

  if (board[crossX][crossY].figure === Figure.Player || board[crossX][crossY].figure === Figure.player) return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure === '') return false;

  if (board[currentX][currentY].figure === Figure.computer || board[currentX][currentY].figure === Figure.Computer)
    return false;

  return true;
};

export const findPlayerAvailableMoves = (board: CellModel[][]) => {
  let availableMoves = [];
  let availableJumps = [];

  for (let m = 0; m < 8; m++) {
    for (let n = 0; n < 8; n++) {
      if (board[m][n].figure === Figure.player) {
        if (checkPlayerMoves(board, m, n, m - 1, n - 1)) availableMoves.push([m, n, m - 1, n - 1]);
        if (checkPlayerMoves(board, m, n, m - 1, n + 1)) availableMoves.push([m, n, m - 1, n + 1]);
        if (checkPlayerJumps(board, m, n, m - 1, n - 1, m - 2, n - 2)) availableJumps.push([m, n, m - 2, n - 2]);
        if (checkPlayerJumps(board, m, n, m - 1, n + 1, m - 2, n + 2)) availableJumps.push([m, n, m - 2, n + 2]);
      } else if (board[m][n].figure === Figure.Player) {
        if (checkPlayerMoves(board, m, n, m - 1, n - 1)) availableMoves.push([m, n, m - 1, n - 1]);
        if (checkPlayerMoves(board, m, n, m - 1, n + 1)) availableMoves.push([m, n, m - 1, n + 1]);
        if (checkPlayerJumps(board, m, n, m - 1, n - 1, m - 2, n - 2)) availableJumps.push([m, n, m - 2, n - 2]);
        if (checkPlayerJumps(board, m, n, m - 1, n + 1, m - 2, n + 2)) availableJumps.push([m, n, m - 2, n + 2]);
        if (checkPlayerMoves(board, m, n, m + 1, n - 1)) availableMoves.push([m, n, m + 1, n - 1]);
        if (checkPlayerJumps(board, m, n, m + 1, n - 1, m + 2, n - 2)) availableJumps.push([m, n, m + 2, n - 2]);
        if (checkPlayerMoves(board, m, n, m + 1, n + 1)) availableMoves.push([m, n, m + 1, n + 1]);
        if (checkPlayerJumps(board, m, n, m + 1, n + 1, m + 2, n + 2)) availableJumps.push([m, n, m + 2, n + 2]);
      }
    }
  }

  return availableJumps.length === 0 ? availableMoves : availableJumps;
};

const checkJumps = (
  board: CellModel[][],
  currentX: number,
  currentY: number,
  crossX: number,
  crossY: number,
  targetX: number,
  targetY: number,
) => {
  if (targetX > 7 || targetX < 0) {
    return false;
  }
  if (targetY > 7 || targetY < 0) {
    return false;
  }
  if (!board[crossX][crossY].figure) {
    return false;
  }
  if (board[crossX][crossY].figure === Figure.Computer || board[crossX][crossY].figure === Figure.computer) {
    return false;
  }
  if (board[targetX][targetY].figure) {
    return false;
  }
  if (!board[currentX][currentY].figure) {
    return false;
  }
  if (board[currentX][currentY].figure === Figure.player || board[currentX][currentY].figure === Figure.Player) {
    return false;
  }

  return true;
};

export const shouldJump = (board: CellModel[][], x: number, y: number) => {
  if (board[x][y].figure === Figure.computer) {
    if (checkJumps(board, x, y, x + 1, y - 1, x + 2, y - 2)) return true; // ↙️
    if (checkJumps(board, x, y, x + 1, y + 1, x + 2, y + 2)) return true; // ↘️
  } else if (board[x][y].figure === Figure.Computer) {
    if (checkJumps(board, x, y, x + 1, y - 1, x + 2, y - 2)) return true; // ↙️
    if (checkJumps(board, x, y, x + 1, y + 1, x + 2, y + 2)) return true; // ↘️
    if (checkJumps(board, x, y, x - 1, y - 1, x - 2, y - 2)) return true; // ↖️
    if (checkJumps(board, x, y, x - 1, y + 1, x - 2, y + 2)) return true; // ↗️
  }

  return false;
};

export const shouldPlayerJump = (board: CellModel[][], x: number, y: number) => {
  if (board[x][y].figure === Figure.player) {
    if (checkPlayerJumps(board, x, y, x - 1, y + 1, x - 2, y + 2)) return true; // ↗️
    if (checkPlayerJumps(board, x, y, x - 1, y - 1, x - 2, y - 2)) return true; // ↖️
  } else if (board[x][y].figure === Figure.Player) {
    if (checkPlayerJumps(board, x, y, x - 1, y + 1, x - 2, y + 2)) return true; // ↗️
    if (checkPlayerJumps(board, x, y, x - 1, y - 1, x - 2, y - 2)) return true; // ↖️
    if (checkPlayerJumps(board, x, y, x + 1, y - 1, x + 2, y - 2)) return true; // ↙️
    if (checkPlayerJumps(board, x, y, x + 1, y + 1, x + 2, y + 2)) return true; // ↘️
  }

  return false;
};

const checkMoves = (board: CellModel[][], currentX: number, currentY: number, targetX: number, targetY: number) => {
  if (targetX > 7 || targetX < 0) return false;

  if (targetY > 7 || targetY < 0) return false;

  if (!board[currentX][currentY].figure) return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure === Figure.Player) return false;

  if (!board[targetX][targetY].figure) return true;
};

export const findAvailableMoves = (board: CellModel[][]) => {
  let availableMoves = [];
  let availableJumps = [];

  for (let m = 0; m < 8; m++) {
    for (let n = 0; n < 8; n++) {
      if (board[m][n].figure === Figure.computer) {
        if (checkMoves(board, m, n, m + 1, n + 1)) {
          availableMoves.push([m, n, m + 1, n + 1]);
        }
        if (checkMoves(board, m, n, m + 1, n - 1)) {
          availableMoves.push([m, n, m + 1, n - 1]);
        }
        if (checkJumps(board, m, n, m + 1, n - 1, m + 2, n - 2)) {
          availableJumps.push([m, n, m + 2, n - 2]);
        }
        if (checkJumps(board, m, n, m + 1, n + 1, m + 2, n + 2)) {
          availableJumps.push([m, n, m + 2, n + 2]);
        }
      } else if (board[m][n].figure === Figure.Computer) {
        if (checkMoves(board, m, n, m + 1, n + 1)) availableMoves.push([m, n, m + 1, n + 1]);
        if (checkMoves(board, m, n, m + 1, n - 1)) availableMoves.push([m, n, m + 1, n - 1]);
        if (checkMoves(board, m, n, m - 1, n - 1)) availableMoves.push([m, n, m - 1, n - 1]);
        if (checkMoves(board, m, n, m - 1, n + 1)) availableMoves.push([m, n, m - 1, n + 1]);
        if (checkJumps(board, m, n, m + 1, n - 1, m + 2, n - 2)) availableJumps.push([m, n, m + 2, n - 2]);
        if (checkJumps(board, m, n, m - 1, n - 1, m - 2, n - 2)) availableJumps.push([m, n, m - 2, n - 2]);
        if (checkJumps(board, m, n, m - 1, n + 1, m - 2, n + 2)) availableJumps.push([m, n, m - 2, n + 2]);
        if (checkJumps(board, m, n, m + 1, n + 1, m + 2, n + 2)) availableJumps.push([m, n, m + 2, n + 2]);
      }
    }
  }

  return availableJumps.length === 0 ? availableMoves : availableJumps;
};

export const makeAmove = ({
  board,
  currentX,
  currentY,
  targetX,
  targetY,
  king,
  queenRow = 0,
}: {
  board: CellModel[][];
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  king: string;
  queenRow?: number;
}): CellModel[][] => {
  const newBoard = JSON.parse(JSON.stringify(board));

  let { figure } = newBoard[currentX][currentY];
  let dx = currentX - targetX;
  let dy = currentY - targetY;

  if (dx === -2 && dy === 2) {
    newBoard[currentX + 1][currentY - 1].figure = '';
  } else if (dx === 2 && dy === 2) {
    newBoard[currentX - 1][currentY - 1].figure = '';
  } else if (dx == 2 && dy == -2) {
    newBoard[currentX - 1][currentY + 1].figure = '';
  } else if (dx == -2 && dy == -2) {
    newBoard[currentX + 1][currentY + 1].figure = '';
  }

  if (Number(targetX) === queenRow) {
    figure = king;
  }

  newBoard[currentX][currentY].figure = '';
  newBoard[Number(targetX)][targetY].figure = figure;

  return newBoard;
};
