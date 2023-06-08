import React from 'react';
import cn from 'classnames';
import { Label, Figure } from '../helpers/constants';
import './Square.styles.css';

type Props = {
  cell: any;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  available: boolean;
};

const Square = ({ cell, onDragStart, onDragEnd, onDragOver, available }: Props) => {
  return (
    <div
      data-x={cell.x}
      data-y={cell.y}
      className={cn('square', {
        dark: cell.label === Label.Dark,
        available,
      })}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      {cell.figure ? (
        <span
          draggable
          className={cn('figure', {
            dark: cell.figure === Figure.player || cell.figure === Figure.Player,
            queen: cell.figure === Figure.Player || cell.figure === Figure.Computer,
          })}
        />
      ) : null}
    </div>
  );
};

export default Square;
