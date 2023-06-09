import React, { useEffect, useState, useCallback } from 'react';
import Board from './Board';
import { findPlayerAvailableMoves, makeAmove, shouldPlayerJump, shouldJump } from './domain/utils';
import minimax from './domain/minimax';
import Node from './entities/Node';
import CellModel from './entities/CellModel';
import { PositionCellType } from './types';
import delay from './helpers/delay';
import useCheckersState from './hooks/useCheckersState';
import { Figure } from './helpers/constants';

const App = () => {
  const { state, updateComputerTurn, updatePlayerTurn, resetState, updateTargetPosition } = useCheckersState();
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
      let newBoard: CellModel[][] = [];
      const availableMoves = findPlayerAvailableMoves(state.board);

      if (availableMoves.length === 0) {
        return state.playerPieces > state.computerPieces ? alert('No available moves') : alert('YOU LOSE');
      }

      const currentX = currentCell.x;
      const currentY = currentCell.y;
      const targetX = Number(targetPosition.x);
      const targetY = Number(targetPosition.y);
      const newMove = [currentX, currentY, targetX, targetY].toString();

      if (availableMoves.some((move) => move.toString() === newMove)) {
        newBoard = makeAmove({ board: state.board, currentX, currentY, targetX, targetY, king: Figure.Player });
        let computerPieces = state.computerPieces;
        if (shouldPlayerJump(state.board, currentX, currentY)) computerPieces--;

        updatePlayerTurn({
          computerPieces,
          availableMoves,
          board: newBoard,
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
    let move = dict[minimaxKeys[0]].move;
    let playerPieces = state.playerPieces;
    setComputerNotification(`from [${move[0]}, ${move[1]}] to [${move[2]}, ${move[3]}]`);
    if (shouldJump(state.board, move[0], move[1])) playerPieces--;

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
      <Board handlePlayerTurn={handlePlayerTurn} updateTargetPosition={updateTargetPosition} board={state.board} />
    </div>
  );
};

export default App;
