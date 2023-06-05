import React, { useRef, useState } from 'react';
import { findPlayerAvailableMoves } from '../helpers/utls';
import Square from '../Square';
import './Board.styles.css';
import CellModel from '../entities/CellModel';
import { InitialStateType, PositionCellType } from '../types';

const BOARD_CELL_COUNT = 8;
const BOARD_LABELS = Array.from(Array(BOARD_CELL_COUNT).keys());

type Props = {
  board: CellModel[][];
  handlePlayerTurn: (cell: CellModel, targetPosition: PositionCellType | DOMStringMap) => void;
  setState: (fn: (state: InitialStateType) => InitialStateType) => void;
};

const Board = ({ board, handlePlayerTurn, setState }: Props) => {
  // Handle Safari and Firefox [clientX clientY] positions
  const clientCoordinates = useRef<number[]>([0, 0]);
  let dragGhost = useRef(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  const dragStart = (cell: CellModel) => (e: React.DragEvent<HTMLDivElement>) => {
    dragGhost.current = (e.target as HTMLDivElement).cloneNode(true);
    document.body.appendChild(dragGhost.current);
    e.dataTransfer.setDragImage(dragGhost.current, 0, 0);
    dragGhost.current.classList.add('hidden-drag-ghost');

    const availableMoves = findPlayerAvailableMoves(board);
    const moves = availableMoves.filter((item: number[]) => item[0] === cell.x && item[1] === cell.y);
    // handle required moves
    setPossibleMoves(availableMoves.length > 2 ? moves : availableMoves);
  };

  const dragEnd = (cell: CellModel) => (_e: React.DragEvent<HTMLDivElement>) => {
    dragGhost.current.parentNode.removeChild(dragGhost.current);
    dragGhost.current = null;
    const elemBelow = document.elementFromPoint(
      clientCoordinates.current[0],
      clientCoordinates.current[1],
    ) as HTMLElement;

    setPossibleMoves([]);
    if (elemBelow.dataset.x) {
      setState((state) => ({
        ...state,
        targetPosition: elemBelow.dataset.x,
        currentCell: cell,
      }));

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

export default Board;
