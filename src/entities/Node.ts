import { applyMove, findAvailableMoves, findPlayerAvailableMoves, Move } from '../domain/utils';
import CellModel from './CellModel';

export default class Node {
  board: CellModel[][];
  move?: Move;

  constructor(board: CellModel[][], move?: Move) {
    this.board = board;
    this.move = move;
  }

  getChildren(computerMoves: boolean) {
    const availableMoves = computerMoves ? findAvailableMoves(this.board) : findPlayerAvailableMoves(this.board);

    return availableMoves.map((move) => new Node(applyMove(this.board, move).board, move));
  }

  getBoard() {
    return this.board;
  }
}
