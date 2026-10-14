import CellModel from '../entities/CellModel';
import { DrawState } from '../domain/game';

export type InitialStateType = {
  board: CellModel[][];
  playerTurn: boolean;
  computerPieces: number;
  playerPieces: number;
  availableMoves: number[][];
  targetPosition: PositionCellType | null;
  currentCell: CellModel | null;
  chainFrom: PositionCellType | null;
  draw: DrawState;
};

export type PositionCellType = {
  x: number;
  y: number;
};
