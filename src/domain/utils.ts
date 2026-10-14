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

export type Move = [fromX: number, fromY: number, toX: number, toY: number];

export type Side = 'player' | 'computer';
type Direction = readonly [dx: number, dy: number];

const MAN_DIRECTIONS: Record<Side, Direction[]> = {
  player: [
    [-1, -1],
    [-1, 1],
  ],
  computer: [
    [1, -1],
    [1, 1],
  ],
};

export const CAPTURE_DIRECTIONS: Direction[] = [...MAN_DIRECTIONS.player, ...MAN_DIRECTIONS.computer];

export const sideOf = (figure: Figure | ''): Side | null => {
  if (figure === Figure.PlayerMan || figure === Figure.PlayerKing) return 'player';
  if (figure === Figure.ComputerMan || figure === Figure.ComputerKing) return 'computer';

  return null;
};

export const isKing = (figure: Figure | '') => figure === Figure.PlayerKing || figure === Figure.ComputerKing;

const stepDirectionsOf = (figure: Figure, side: Side): readonly Direction[] =>
  isKing(figure) ? CAPTURE_DIRECTIONS : MAN_DIRECTIONS[side];

export const inBounds = (board: CellModel[][], x: number, y: number) =>
  x >= 0 && x < board.length && y >= 0 && y < board.length;

const findPieceMoves = (board: CellModel[][], x: number, y: number) => {
  const steps: Move[] = [];
  const jumps: Move[] = [];
  const { figure } = board[x][y];
  const side = sideOf(figure);

  if (!side) return { steps, jumps };

  const stepDirections = stepDirectionsOf(figure as Figure, side);

  for (const [dx, dy] of CAPTURE_DIRECTIONS) {
    const nextX = x + dx;
    const nextY = y + dy;
    if (!inBounds(board, nextX, nextY)) continue;

    const nextSide = sideOf(board[nextX][nextY].figure);
    if (!nextSide) {
      if (stepDirections.some(([sx, sy]) => sx === dx && sy === dy)) steps.push([x, y, nextX, nextY]);
      continue;
    }

    const landingX = x + 2 * dx;
    const landingY = y + 2 * dy;
    if (nextSide !== side && inBounds(board, landingX, landingY) && !board[landingX][landingY].figure) {
      jumps.push([x, y, landingX, landingY]);
    }
  }

  return { steps, jumps };
};

export type Position = { x: number; y: number };

export const findMoves = (board: CellModel[][], side: Side, chainFrom?: Position | null): Move[] => {
  const steps: Move[] = [];
  const jumps: Move[] = [];

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board.length; y++) {
      if (sideOf(board[x][y].figure) !== side) continue;
      // mid-capture only the piece that just jumped may move, and only by jumping
      if (chainFrom && (chainFrom.x !== x || chainFrom.y !== y)) continue;

      const piece = findPieceMoves(board, x, y);
      steps.push(...piece.steps);
      jumps.push(...piece.jumps);
    }
  }

  return jumps.length === 0 && !chainFrom ? steps : jumps;
};

export const findJumpsFrom = (board: CellModel[][], x: number, y: number): Move[] => findPieceMoves(board, x, y).jumps;

export const findPlayerAvailableMoves = (board: CellModel[][], chainFrom?: Position | null) =>
  findMoves(board, 'player', chainFrom);

export const findAvailableMoves = (board: CellModel[][]) => findMoves(board, 'computer');

export type MoveResult = {
  board: CellModel[][];
  captured: boolean;
  promoted: boolean;
};

const promotionRow = (board: CellModel[][], side: Side) => (side === 'player' ? 0 : board.length - 1);

const isLegalMove = (board: CellModel[][], move: Move) => {
  const [fromX, fromY, toX, toY] = move;
  if (!inBounds(board, fromX, fromY) || !inBounds(board, toX, toY)) return false;

  const { steps, jumps } = findPieceMoves(board, fromX, fromY);

  return [...steps, ...jumps].some(([, , x, y]) => x === toX && y === toY);
};

export const applyMove = (board: CellModel[][], move: Move): MoveResult => {
  if (!isLegalMove(board, move)) {
    throw new Error(`Illegal move: [${move.join(', ')}]`);
  }

  const [fromX, fromY, toX, toY] = move;
  // Rows are copied, cells are replaced rather than mutated, so untouched cells are shared between boards
  const newBoard = board.map((row) => row.slice());
  const setFigure = (x: number, y: number, figure: Figure | '') => {
    newBoard[x][y] = new CellModel(newBoard[x][y].label, figure, x, y);
  };

  const { figure } = board[fromX][fromY];
  const side = sideOf(figure);
  const captured = Math.abs(toX - fromX) === 2;
  const promoted = side !== null && !isKing(figure) && toX === promotionRow(board, side);

  if (captured) {
    setFigure((fromX + toX) / 2, (fromY + toY) / 2, '');
  }

  setFigure(fromX, fromY, '');
  if (promoted) {
    setFigure(toX, toY, side === 'player' ? Figure.PlayerKing : Figure.ComputerKing);
  } else {
    setFigure(toX, toY, figure);
  }

  return { board: newBoard, captured, promoted };
};

export const findContinuation = (result: MoveResult, [, , toX, toY]: Move): Move[] =>
  result.captured && !result.promoted ? findJumpsFrom(result.board, toX, toY) : [];
