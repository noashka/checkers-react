import { Label, Figure, BOARD_SIZE } from '../helpers/constants';
import CellModel from '../entities/CellModel';

export const fillBoard = (size = BOARD_SIZE): CellModel[][] => {
  const pieceRows = size / 2 - 1;
  const board = Array.from({ length: size }, () => [] as CellModel[]);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const label = (i + j) % 2 !== 0 ? Label.Dark : Label.Light;
      board[i][j] = new CellModel(label, '', i, j);

      if (i < pieceRows && (i + j) % 2 === 1) {
        board[i][j] = new CellModel(label, Figure.ComputerMan, i, j);
      }

      if (i >= size - pieceRows && (i + j) % 2 === 1) {
        board[i][j] = new CellModel(label, Figure.PlayerMan, i, j);
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
  if (targetX >= board.length || targetX < 0) return false;

  if (targetY >= board.length || targetY < 0) return false;

  if (!board[currentX][currentY].figure) return false;

  if (board[targetX][targetY].figure) return false;

  if (
    board[currentX][currentY].figure === Figure.ComputerMan ||
    board[currentX][currentY].figure === Figure.ComputerKing
  )
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
  if (targetX >= board.length || targetX < 0) return false;

  if (targetY >= board.length || targetY < 0) return false;

  if (board[crossX][crossY].figure === '') return false;

  if (board[crossX][crossY].figure === Figure.PlayerKing || board[crossX][crossY].figure === Figure.PlayerMan)
    return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure === '') return false;

  if (
    board[currentX][currentY].figure === Figure.ComputerMan ||
    board[currentX][currentY].figure === Figure.ComputerKing
  )
    return false;

  return true;
};

export const findPlayerAvailableMoves = (board: CellModel[][]) => {
  let availableMoves = [];
  let availableJumps = [];

  for (let m = 0; m < board.length; m++) {
    for (let n = 0; n < board.length; n++) {
      if (board[m][n].figure === Figure.PlayerMan) {
        if (checkPlayerMoves(board, m, n, m - 1, n - 1)) availableMoves.push([m, n, m - 1, n - 1]);
        if (checkPlayerMoves(board, m, n, m - 1, n + 1)) availableMoves.push([m, n, m - 1, n + 1]);
        if (checkPlayerJumps(board, m, n, m - 1, n - 1, m - 2, n - 2)) availableJumps.push([m, n, m - 2, n - 2]);
        if (checkPlayerJumps(board, m, n, m - 1, n + 1, m - 2, n + 2)) availableJumps.push([m, n, m - 2, n + 2]);
      } else if (board[m][n].figure === Figure.PlayerKing) {
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
  if (targetX >= board.length || targetX < 0) {
    return false;
  }
  if (targetY >= board.length || targetY < 0) {
    return false;
  }
  if (!board[crossX][crossY].figure) {
    return false;
  }
  if (board[crossX][crossY].figure === Figure.ComputerKing || board[crossX][crossY].figure === Figure.ComputerMan) {
    return false;
  }
  if (board[targetX][targetY].figure) {
    return false;
  }
  if (!board[currentX][currentY].figure) {
    return false;
  }
  if (board[currentX][currentY].figure === Figure.PlayerMan || board[currentX][currentY].figure === Figure.PlayerKing) {
    return false;
  }

  return true;
};

export const shouldJump = (board: CellModel[][], x: number, y: number) => {
  if (board[x][y].figure === Figure.ComputerMan) {
    if (checkJumps(board, x, y, x + 1, y - 1, x + 2, y - 2)) return true; // ↙️
    if (checkJumps(board, x, y, x + 1, y + 1, x + 2, y + 2)) return true; // ↘️
  } else if (board[x][y].figure === Figure.ComputerKing) {
    if (checkJumps(board, x, y, x + 1, y - 1, x + 2, y - 2)) return true; // ↙️
    if (checkJumps(board, x, y, x + 1, y + 1, x + 2, y + 2)) return true; // ↘️
    if (checkJumps(board, x, y, x - 1, y - 1, x - 2, y - 2)) return true; // ↖️
    if (checkJumps(board, x, y, x - 1, y + 1, x - 2, y + 2)) return true; // ↗️
  }

  return false;
};

export const shouldPlayerJump = (board: CellModel[][], x: number, y: number) => {
  if (board[x][y].figure === Figure.PlayerMan) {
    if (checkPlayerJumps(board, x, y, x - 1, y + 1, x - 2, y + 2)) return true; // ↗️
    if (checkPlayerJumps(board, x, y, x - 1, y - 1, x - 2, y - 2)) return true; // ↖️
  } else if (board[x][y].figure === Figure.PlayerKing) {
    if (checkPlayerJumps(board, x, y, x - 1, y + 1, x - 2, y + 2)) return true; // ↗️
    if (checkPlayerJumps(board, x, y, x - 1, y - 1, x - 2, y - 2)) return true; // ↖️
    if (checkPlayerJumps(board, x, y, x + 1, y - 1, x + 2, y - 2)) return true; // ↙️
    if (checkPlayerJumps(board, x, y, x + 1, y + 1, x + 2, y + 2)) return true; // ↘️
  }

  return false;
};

const checkMoves = (board: CellModel[][], currentX: number, currentY: number, targetX: number, targetY: number) => {
  if (targetX >= board.length || targetX < 0) return false;

  if (targetY >= board.length || targetY < 0) return false;

  if (!board[currentX][currentY].figure) return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure === Figure.PlayerKing) return false;

  if (!board[targetX][targetY].figure) return true;
};

export const findAvailableMoves = (board: CellModel[][]) => {
  let availableMoves = [];
  let availableJumps = [];

  for (let m = 0; m < board.length; m++) {
    for (let n = 0; n < board.length; n++) {
      if (board[m][n].figure === Figure.ComputerMan) {
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
      } else if (board[m][n].figure === Figure.ComputerKing) {
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
  // Rows are copied, cells are replaced rather than mutated, so untouched cells are shared between boards
  const newBoard = board.map((row) => row.slice());
  const setFigure = (x: number, y: number, figure: Figure | '') => {
    newBoard[x][y] = new CellModel(newBoard[x][y].label, figure, x, y);
  };

  let { figure } = newBoard[currentX][currentY];
  const dx = currentX - targetX;
  const dy = currentY - targetY;

  if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
    setFigure(currentX - dx / 2, currentY - dy / 2, '');
  }

  if (Number(targetX) === queenRow) {
    figure = king as Figure;
  }

  setFigure(currentX, currentY, '');
  setFigure(Number(targetX), targetY, figure);

  return newBoard;
};
