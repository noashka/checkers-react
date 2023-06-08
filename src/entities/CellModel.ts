import { Label, Figure } from '../helpers/constants';

export default class CellModel {
  label: Label;
  figure: Figure | '';
  x: number;
  y: number;
  key: string;

  constructor(label: Label, figure: Figure | '', x: number, y: number) {
    this.label = label;
    this.figure = figure;
    this.key = `${x}_${y}`;
    this.x = x;
    this.y = y;
  }
}
