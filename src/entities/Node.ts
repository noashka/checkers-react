import { findAvailableMoves, findPlayerAvailableMoves, makeAmove } from '../domain/utils';
import CellModel from './CellModel';

export default class Node {
  board: CellModel[][];
  move: number[];

  constructor(board: CellModel[][], move?: number[]) {
    this.board = board;
    this.move = move;
  }

  getChildren(minimizingPlayer: boolean) {
    let availableMoves = [];
    let childrenStates = [];
    let bigLetter = '';
    let queenRow = 0;

    if (minimizingPlayer) {
      availableMoves = findAvailableMoves(this.board);
      bigLetter = 'C';
      queenRow = 7;
    } else {
      availableMoves = findPlayerAvailableMoves(this.board);
      bigLetter = 'B';
      queenRow = 0;
    }

    for (let i = 0; i < availableMoves.length; i++) {
      const currentX = availableMoves[i][0];
      const currentY = availableMoves[i][1];
      const targetX = availableMoves[i][2];
      const targetY = availableMoves[i][3];
      const copy = makeAmove({ board: this.board, currentX, currentY, targetX, targetY, bigLetter, queenRow });
      childrenStates.push(new Node(copy, [currentX, currentY, targetX, targetY]));
    }

    return childrenStates;
  }

  getBoard() {
    return this.board;
  }
}
