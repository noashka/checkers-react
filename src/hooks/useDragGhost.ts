import React, { useRef } from 'react';

const useDragGhost = () => {
  const dragGhost = useRef(null);

  const createDragGhost = (e: React.DragEvent<HTMLDivElement>) => {
    dragGhost.current = (e.target as HTMLDivElement).cloneNode(true);
    document.body.appendChild(dragGhost.current);
    e.dataTransfer.setDragImage(dragGhost.current, 0, 0);
    dragGhost.current.classList.add('hidden-drag-ghost');
  };

  const resetDragGhost = () => {
    dragGhost.current.parentNode.removeChild(dragGhost.current);
    dragGhost.current = null;
    dragGhost.current = null;
  };

  return {
    dragGhost,
    createDragGhost,
    resetDragGhost,
  };
};

export default useDragGhost;
