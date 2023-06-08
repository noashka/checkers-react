import { Label } from '../helpers/constants';
import CellModel from '../entities/CellModel';

export const fillBoard = (size = 8): CellModel[][] => {
  const board = Array.from({ length: size }, () => []);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const label = (i + j) % 2 !== 0 ? Label.Dark : Label.Light;
      board[i][j] = new CellModel(label, '', i, j);

      if (i < 3 && (i + j) % 2 === 1) {
        board[i][j] = new CellModel(label, `c${i}${j}`, i, j);
      }

      if (i > 4 && (i + j) % 2 === 1) {
        board[i][j] = new CellModel(label, `b${i}${j}`, i, j);
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

  if (board[currentX][currentY].figure[0] === 'c' || board[currentX][currentY].figure[0] === 'C') return false;

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

  if (board[crossX][crossY].figure[0] === 'B' || board[crossX][crossY].figure[0] === 'b') return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure === '') return false;

  if (board[currentX][currentY].figure[0] === 'c' || board[currentX][currentY].figure[0] === 'C') return false;

  return true;
};

export const findPlayerAvailableMoves = (board: CellModel[][]) => {
  let availableMoves = [];
  let availableJumps = [];

  for (let m = 0; m < 8; m++) {
    for (let n = 0; n < 8; n++) {
      if (board[m][n].figure[0] === 'b') {
        if (checkPlayerMoves(board, m, n, m - 1, n - 1)) availableMoves.push([m, n, m - 1, n - 1]);
        if (checkPlayerMoves(board, m, n, m - 1, n + 1)) availableMoves.push([m, n, m - 1, n + 1]);
        if (checkPlayerJumps(board, m, n, m - 1, n - 1, m - 2, n - 2)) availableJumps.push([m, n, m - 2, n - 2]);
        if (checkPlayerJumps(board, m, n, m - 1, n + 1, m - 2, n + 2)) availableJumps.push([m, n, m - 2, n + 2]);
      } else if (board[m][n].figure[0] === 'B') {
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
  if (board[crossX][crossY].figure[0] === 'C' || board[crossX][crossY].figure[0] === 'c') {
    return false;
  }
  if (board[targetX][targetY].figure) {
    return false;
  }
  if (!board[currentX][currentY].figure) {
    return false;
  }
  if (board[currentX][currentY].figure[0] === 'b' || board[currentX][currentY].figure[0] === 'B') {
    return false;
  }

  return true;
};

const checkMoves = (board: CellModel[][], currentX: number, currentY: number, targetX: number, targetY: number) => {
  if (targetX > 7 || targetX < 0) return false;

  if (targetY > 7 || targetY < 0) return false;

  if (!board[currentX][currentY].figure) return false;

  if (board[targetX][targetY].figure) return false;

  if (board[currentX][currentY].figure[0] === 'B') return false;

  if (!board[targetX][targetY].figure) return true;
};

export const findAvailableMoves = (board: CellModel[][]) => {
  let availableMoves = [];
  let availableJumps = [];

  for (let m = 0; m < 8; m++) {
    for (let n = 0; n < 8; n++) {
      if (board[m][n].figure[0] === 'c') {
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
      } else if (board[m][n].figure[0] === 'C') {
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
  bigLetter,
  queenRow = 0,
}: {
  board: CellModel[][];
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  bigLetter: string;
  queenRow?: number;
}): CellModel[][] => {
  const copy = JSON.parse(JSON.stringify(board));

  let letter = copy[currentX][currentY].figure[0];
  let dx = currentX - targetX;
  let dy = currentY - targetY;

  if (dx === -2 && dy === 2) {
    copy[currentX + 1][currentY - 1].figure = '';
  } else if (dx === 2 && dy === 2) {
    copy[currentX - 1][currentY - 1].figure = '';
  } else if (dx == 2 && dy == -2) {
    copy[currentX - 1][currentY + 1].figure = '';
  } else if (dx == -2 && dy == -2) {
    copy[currentX + 1][currentY + 1].figure = '';
  }

  if (Number(targetX) === queenRow) {
    letter = bigLetter;
  }

  copy[currentX][currentY].figure = '';
  copy[Number(targetX)][targetY].figure = `${letter}${targetX}${targetY}`;

  return copy;
};

export const calculatePieces = (board: CellModel[][]) => {
  let playerPieces = 0;
  let computerPieces = 0;

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const cell = board[i][j];
      if (cell.figure[0] === 'b' || cell.figure[0] === 'B') {
        playerPieces++;
      } else if (cell.figure[0] === 'c' || cell.figure[0] === 'C') {
        computerPieces++;
      }
    }
  }

  return { playerPieces, computerPieces };
};
