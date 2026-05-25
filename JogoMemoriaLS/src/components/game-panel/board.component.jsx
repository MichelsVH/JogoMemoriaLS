import React from "react";
import Cell from "./cell.component";

function Board({ grid, onCellClick, showShips = false, radarArea = [], onCellHover, onCellHoverLeave, hoverPreview = [], disableInteraction = false }) {
  return (
    <div className="board" onMouseLeave={onCellHoverLeave}>
      {grid.map((rowArr, r) => (
        <div className="board-row" key={`r-${r}`}>
          {rowArr.map((cell, c) => {
            const highlight = radarArea.some(p => p[0]===r && p[1]===c);
            const preview = hoverPreview.some(p => p[0]===r && p[1]===c);
            return (
              <Cell
                key={`c-${r}-${c}`}
                row={r}
                col={c}
                data={cell}
                onClick={onCellClick}
                onHover={onCellHover}
                onHoverLeave={onCellHoverLeave}
                showShip={showShips}
                highlight={highlight}
                preview={preview}
                disabled={disableInteraction}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Board;
