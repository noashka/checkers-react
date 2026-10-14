import CellModel from '../entities/CellModel';
import { Figure, Label } from '../helpers/constants';

const FIGURES: Record<string, Figure | ''> = {
  '.': '',
  c: Figure.ComputerMan,
  C: Figure.ComputerKing,
  p: Figure.PlayerMan,
  P: Figure.PlayerKing,
};

export const boardFrom = (rows: string[]): CellModel[][] =>
  rows.map((row, x) =>
    row.split(' ').map((char, y) => new CellModel((x + y) % 2 ? Label.Dark : Label.Light, FIGURES[char], x, y)),
  );
