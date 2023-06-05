import React, { useEffect, useState } from 'react';
import Board from './Board';
import { findPlayerAvailableMoves, fillBoard, makeAmove } from './domain/utils';
import minimax from './domain/minimax';
import Node from './entities/Node';
import CellModel from './entities/CellModel';
import { InitialStateType, PositionCellType } from './types';

const initialBoard = fillBoard([[], [], [], [], [], [], [], []]);
const initialState: InitialStateType = {
  board: initialBoard,
  playerTurn: true,
  computerPieces: 12,
  playerPieces: 12,
  availableMoves: findPlayerAvailableMoves(initialBoard),
  targetPosition: null,
  currentCell: null,
};

const App = () => {
  const [state, setState] = useState(initialState);
  const [computerNotification, setComputerNotification] = useState('');

  useEffect(() => {
    if ((!state.targetPosition || !state.currentCell) && state.playerTurn) return;

    if (state.playerTurn) {
      handlePlayerTurn(state.currentCell, state.targetPosition);
    } else {
      setTimeout(() => {
        handleComputerTurn();
      }, 100);
    }
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
    setState(initialState);
  };

  const calculatePieces = (board: CellModel[][]) => {
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

  const handlePlayerTurn = (currentCell: CellModel, targetPosition: PositionCellType) => {
    let copy: CellModel[][] = [];
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
      copy = makeAmove({ board: state.board, currentX, currentY, targetX, targetY, bigLetter: 'B' });
      const { playerPieces, computerPieces } = calculatePieces(copy);

      setState((state) => ({
        ...state,
        playerPieces,
        computerPieces,
        currentCell: null,
        targetPosition: null,
        playerTurn: false,
        availableMoves,
        board: copy,
      }));
    }
  };

  const handleComputerTurn = () => {
    const currentState = new Node(state.board);
    const firstComputerMoves = currentState.getChildren(true);

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

    const newMatrix = dict[minimaxKeys[0]].getBoard();
    let move = dict[minimaxKeys[0]].move;
    setComputerNotification(`from [${move[0]}, ${move[1]}] to [${move[2]}, ${move[3]}]`);

    const { playerPieces, computerPieces } = calculatePieces(newMatrix);

    setState((state) => ({
      ...state,
      board: newMatrix,
      playerTurn: true,
      playerPieces,
      computerPieces,
    }));
  };

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
      <Board handlePlayerTurn={handlePlayerTurn} setState={setState} board={state.board} />
    </div>
  );
};

export default App;
