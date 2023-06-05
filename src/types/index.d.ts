export type InitialStateType = {
  board: CellModel[][];
  playerTurn: boolean;
  computerPieces: number;
  playerPieces: number;
  availableMoves: number[][];
  targetPosition: Position | null;
  currentCell: CellModel | null;
};

export type PositionCellType = {
  x: number;
  y: number;
};
