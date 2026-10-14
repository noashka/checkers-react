import React, { useEffect, useState, useCallback } from 'react';
import Board from './Board';
import { findPlayerAvailableMoves, findContinuation, applyMove, Move } from './domain/utils';
import { findBestMove } from './domain/bestMove';
import { advanceDrawState, getGameStatus, isProgress, GameStatus } from './domain/game';
import CellModel from './entities/CellModel';
import { PositionCellType } from './types';
import delay from './helpers/delay';
import useCheckersState from './hooks/useCheckersState';

const GAME_OVER_MESSAGES: Record<Exclude<GameStatus, 'playing'>, string> = {
  playerWins: 'Computer has no moves left. You win.',
  computerWins: 'You have no moves left. You lose.',
  draw: 'Draw.',
};

const App = () => {
  const { state, updateComputerTurn, updatePlayerTurn, updatePlayerChain, resetState, updateTargetPosition } =
    useCheckersState();
  const [computerNotification, setComputerNotification] = useState('');
  const status = getGameStatus(state.board, state.playerTurn ? 'player' : 'computer', state.draw);

  useEffect(() => {
    if ((!state.targetPosition || !state.currentCell) && state.playerTurn) return;

    if (status !== 'playing') return;

    if (state.playerTurn) {
      handlePlayerTurn(state.currentCell, state.targetPosition);
      return;
    }

    delay(200).then(() => {
      handleComputerTurn();
    });
  }, [state.playerTurn]);

  useEffect(() => {
    if (status === 'playing') return;

    alert(GAME_OVER_MESSAGES[status]);
    restart();
  }, [status]);

  const restart = () => {
    resetState();
    setComputerNotification('');
  };

  const handlePlayerTurn = useCallback(
    (currentCell: CellModel, targetPosition: PositionCellType) => {
      const availableMoves = findPlayerAvailableMoves(state.board, state.chainFrom);

      if (availableMoves.length === 0) return;

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
          draw: advanceDrawState(state.draw, result.board, 'computer', isProgress(state.board, move, result.captured)),
        });
      }
    },
    [state],
  );

  const handleComputerTurn = useCallback(() => {
    const best = findBestMove(state.board);
    if (!best) return;

    const { moves, captures, board } = best;
    const [firstMove] = moves;
    setComputerNotification(
      `from [${firstMove[0]}, ${firstMove[1]}]` + moves.map(([, , x, y]) => ` to [${x}, ${y}]`).join(''),
    );

    updateComputerTurn({
      board,
      playerPieces: state.playerPieces - captures,
      draw: advanceDrawState(state.draw, board, 'player', isProgress(state.board, firstMove, captures > 0)),
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
