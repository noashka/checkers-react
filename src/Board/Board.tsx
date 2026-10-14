import React, { useRef, useState, memo } from 'react';
import { findPlayerAvailableMoves } from '../domain/utils';
import Square from '../Square';
import './Board.styles.css';
import CellModel from '../entities/CellModel';
import useDragGhost from '../hooks/useDragGhost';
import { BOARD_SIZE } from '../helpers/constants';
import { InitialStateType, PositionCellType } from '../types';

const BOARD_LABELS = Array.from(Array(BOARD_SIZE).keys());

type Props = {
  board: CellModel[][];
  chainFrom: PositionCellType | null;
  handlePlayerTurn: (cell: CellModel, targetPosition: PositionCellType | DOMStringMap) => void;
  updateTargetPosition: (payload: Partial<InitialStateType>) => void;
};

const Board = ({ board, chainFrom, handlePlayerTurn, updateTargetPosition }: Props) => {
  // Handle Safari and Firefox [clientX clientY] positions
  const clientCoordinates = useRef<number[]>([0, 0]);
  const { createDragGhost, resetDragGhost } = useDragGhost();
  const [possibleMoves, setPossibleMoves] = useState([]);

  const dragStart = (cell: CellModel) => (e: React.DragEvent<HTMLDivElement>) => {
    createDragGhost(e);
    const availableMoves = findPlayerAvailableMoves(board, chainFrom);
    const moves = availableMoves.filter((item: number[]) => item[0] === cell.x && item[1] === cell.y);
    setPossibleMoves(moves);
  };

  const dragEnd = (cell: CellModel) => (_e: React.DragEvent<HTMLDivElement>) => {
    resetDragGhost();
    const elemBelow = document.elementFromPoint(
      clientCoordinates.current[0],
      clientCoordinates.current[1],
    ) as HTMLElement;

    setPossibleMoves([]);
    if (elemBelow.dataset.x) {
      updateTargetPosition({
        targetPosition: { x: Number(elemBelow.dataset.x), y: Number(elemBelow.dataset.y) },
        currentCell: cell,
      });

      handlePlayerTurn(cell, elemBelow.dataset);
      clientCoordinates.current = [0, 0];
    }
  };

  const dragOver = (e: React.DragEvent<HTMLDivElement>) => {
    clientCoordinates.current = [e.clientX, e.clientY];
    e.preventDefault();
  };

  const isAvailableCell = (cell: CellModel) => {
    return possibleMoves.some(([_prevX, _prevY, newX, newY]) => newX === cell.x && newY === cell.y);
  };

  return (
    <div className="board-wrapper">
      <div className="board-label-horizontal">
        {BOARD_LABELS.map((rowLabel: number) => (
          <span key={rowLabel} className="board-row-label">
            {rowLabel}
          </span>
        ))}
      </div>
      <div className="board-label-vertical">
        {BOARD_LABELS.map((cellIndex: number) => (
          <span key={cellIndex} className="board-cell-label">
            {cellIndex}
          </span>
        ))}
      </div>
      <div className="board">
        {board.map((row) => {
          return row.map((cell) => {
            return (
              <Square
                cell={cell}
                key={cell.key}
                onDragStart={dragStart(cell)}
                onDragEnd={dragEnd(cell)}
                onDragOver={dragOver}
                available={isAvailableCell(cell)}
              />
            );
          });
        })}
      </div>
    </div>
  );
};

export default memo(Board);
