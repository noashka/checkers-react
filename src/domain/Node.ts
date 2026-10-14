import CellModel from '../entities/CellModel';
import { findTurns, Turn } from './turns';
import { Move } from './utils';

export default class Node {
  board: CellModel[][];
  moves: Move[];
  captures: number;

  constructor(board: CellModel[][], moves: Move[] = [], captures = 0) {
    this.board = board;
    this.moves = moves;
    this.captures = captures;
  }

  getChildren(computerMoves: boolean) {
    return findTurns(this.board, computerMoves ? 'computer' : 'player').map(
      ({ board, moves, captures }: Turn) => new Node(board, moves, captures),
    );
  }

  getBoard() {
    return this.board;
  }
}
