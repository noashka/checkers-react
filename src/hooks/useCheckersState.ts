import { useReducer, useCallback } from 'react';
import { InitialStateType } from '../types';
import { fillBoard, findPlayerAvailableMoves } from '../domain/utils';

const initialBoard = fillBoard();
const initialState: InitialStateType = {
  board: initialBoard,
  playerTurn: true,
  computerPieces: 12,
  playerPieces: 12,
  availableMoves: findPlayerAvailableMoves(initialBoard),
  targetPosition: null,
  currentCell: null,
};

type ActionType<T> = {
  type: string;
  payload?: T;
};

const UPDATE_COMPUTER_TURN = 'UPDATE_COMPUTER_TURN';
const UPDATE_PLAYER_TURN = 'UPDATE_PLAYER_TURN';
const UPDATE_TARGET_POSITION = 'UPDATE_TARGET_POSITION';
const RESET_STATE = 'RESET_STATE';

const checkersReducer = (state: InitialStateType, action: ActionType<Partial<InitialStateType>>) => {
  switch (action.type) {
    case UPDATE_COMPUTER_TURN:
      return {
        ...state,
        playerTurn: true,
        board: action.payload.board,
        playerPieces: action.payload.playerPieces,
      };
    case UPDATE_PLAYER_TURN:
      return {
        ...state,
        currentCell: null,
        targetPosition: null,
        playerTurn: false,
        computerPieces: action.payload.computerPieces,
        availableMoves: action.payload.availableMoves,
        board: action.payload.board,
      };
    case UPDATE_TARGET_POSITION:
      return {
        ...state,
        targetPosition: action.payload.targetPosition,
        currentCell: action.payload.currentCell,
      };
    case RESET_STATE:
      return initialState;
    default:
      state;
  }
};

const useCheckersState = () => {
  const [state, dispatch] = useReducer(checkersReducer, initialState);

  const updateComputerTurn = useCallback((payload: Partial<InitialStateType>) => {
    dispatch({
      type: UPDATE_COMPUTER_TURN,
      payload,
    });
  }, []);

  const updatePlayerTurn = useCallback((payload: Partial<InitialStateType>) => {
    return dispatch({
      type: UPDATE_PLAYER_TURN,
      payload,
    });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: RESET_STATE });
  }, []);

  const updateTargetPosition = useCallback((payload: Partial<InitialStateType>) => {
    dispatch({
      type: UPDATE_TARGET_POSITION,
      payload,
    });
  }, []);

  return { state, updateComputerTurn, updatePlayerTurn, resetState, updateTargetPosition };
};

export default useCheckersState;
