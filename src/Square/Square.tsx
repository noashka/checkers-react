import React, { DragEvent, useRef } from 'react';
import cn from 'classnames';
import { Label } from '../helpers/constants';
import './Square.styles.css';

export enum Labels {
  Light = 'white',
  Dark = 'black',
}

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
            dark: cell.figure[0] === 'b' || cell.figure[0] === 'B',
            queen: cell.figure[0] === 'B' || cell.figure[0] === 'C',
          })}
        />
      ) : null}
    </div>
  );
};

export default Square;
