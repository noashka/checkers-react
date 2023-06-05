import { Label } from '../helpers/constants';

export default class CellModel {
  label: Label;
  figure: string | null;
  x: number;
  y: number;
  key: string;

  constructor(label: Label, figure: string | null, x: number, y: number) {
    this.label = label;
    this.figure = figure;
    this.key = `${x}_${y}`;
    this.x = x;
    this.y = y;
  }
}
