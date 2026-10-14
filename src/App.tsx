import React, { useEffect, useState, useCallback } from 'react';
import Board from './Board';
import { findPlayerAvailableMoves, findContinuation, applyMove, Move } from './domain/utils';
import minimax from './domain/minimax';
import Node from './domain/Node';
import CellModel from './entities/CellModel';
import { PositionCellType } from './types';
import delay from './helpers/delay';
import useCheckersState from './hooks/useCheckersState';

const App = () => {
  const { state, updateComputerTurn, updatePlayerTurn, updatePlayerChain, resetState, updateTargetPosition } =
    useCheckersState();
  const [computerNotification, setComputerNotification] = useState('');

  useEffect(() => {
    if ((!state.targetPosition || !state.currentCell) && state.playerTurn) return;

    if (state.playerTurn) {
      handlePlayerTurn(state.currentCell, state.targetPosition);
      return;
    }

    delay(200).then(() => {
      handleComputerTurn();
    });
  }, [state.playerTurn]);

  useEffect(() => {
    if (state.playerPieces === 0) {
      alert('You have no pieces left. You lose.');
      restart();
      return;
    }

    if (state.computerPieces === 0) {
      alert('Computer has no pieces left. You win.');
      restart();
      return;
    }
  }, [state.playerPieces, state.computerPieces]);

  const restart = () => {
    resetState();
    setComputerNotification('');
  };

  const handlePlayerTurn = useCallback(
    (currentCell: CellModel, targetPosition: PositionCellType) => {
      const availableMoves = findPlayerAvailableMoves(state.board, state.chainFrom);

      if (availableMoves.length === 0) {
        return state.playerPieces > state.computerPieces ? alert('No available moves') : alert('YOU LOSE');
      }

      const currentX = currentCell.x;
      const currentY = currentCell.y;
      const targetX = Number(targetPosition.x);
      const targetY = Number(targetPosition.y);
      if (![targetX, targetY].every(Number.isInteger)) return;

      const newMove = [currentX, currentY, targetX, targetY].toString();

      if (availableMoves.some((move) => move.toString() === newMove)) {
        const move: Move = [currentX, currentY, targetX, targetY];
        const result = applyMove(state.board, move);
        const computerPieces = result.captured ? state.computerPieces - 1 : state.computerPieces;

        // a capture must be continued with the same piece while it can still jump, unless it was just promoted
        if (findContinuation(result, move).length > 0) {
          updatePlayerChain({ computerPieces, board: result.board, chainFrom: { x: targetX, y: targetY } });
          return;
        }

        updatePlayerTurn({
          computerPieces,
          availableMoves,
          board: result.board,
        });
      }
    },
    [state],
  );

  const handleComputerTurn = useCallback(() => {
    const currentBoardState = new Node(state.board);
    const firstComputerMoves = currentBoardState.getChildren(true);

    if (firstComputerMoves.length === 0) {
      if (state.playerPieces > state.computerPieces) {
        alert('Computer has no available moves left. You win');
        restart();
        return;
      }

      alert('Computer has no available moves left. Game ended');
      restart();
      return;
    }

    let dict: { [key: number | string]: Node } = {};
    for (let i = 0; i < firstComputerMoves.length; i++) {
      const child: Node = firstComputerMoves[i];
      const value = minimax(child.getBoard(), 1, -Infinity, Infinity, false);
      dict[value] = child;
    }

    // best option in the top
    const minimaxKeys = Object.keys(dict).sort((a, b) => Number(b) - Number(a));

    if (minimaxKeys.length === 0) {
      alert('Computer has cornered itself. You win');
      restart();
      return;
    }

    const updatedBoard = dict[minimaxKeys[0]].getBoard();
    const { moves, captures } = dict[minimaxKeys[0]];
    const playerPieces = state.playerPieces - captures;
    const [firstMove] = moves;
    setComputerNotification(
      `from [${firstMove[0]}, ${firstMove[1]}]` + moves.map(([, , x, y]) => ` to [${x}, ${y}]`).join(''),
    );

    updateComputerTurn({
      board: updatedBoard,
      playerPieces: playerPieces,
    });
  }, [state.board]);

  return (
    <div>
      <h1>Checkers</h1>
      <div>
        <button onClick={restart}>Restart</button>
        <ul>
          <li>Pieces Player: {state.playerPieces}</li>
          <li>Pieces Computer: {state.computerPieces}</li>
        </ul>
        <p>Computer moves - {computerNotification}</p>
      </div>
      <Board
        chainFrom={state.chainFrom}
        handlePlayerTurn={handlePlayerTurn}
        updateTargetPosition={updateTargetPosition}
        board={state.board}
      />
    </div>
  );
};

export default App;
