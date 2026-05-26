import React from "react";
import Cell from "../cell/cell.component";

function Board({ grid, ships = [], onCellClick, showShips = false, radarArea = [], onCellHover, onCellHoverLeave, hoverPreview = [], disableInteraction = false, sunkShipIds = [] }) {
  const shipOverlays = showShips
    ? ships.map((ship) => {
        const [startR, startC] = ship.positions[0] || [0, 0];
        const orientation = ship.positions[1] && ship.positions[1][0] === startR ? "horizontal" : "vertical";
        const style = {
          top: `${startR * 30}px`,
          left: `${startC * 30}px`,
          width: orientation === "horizontal" ? `${ship.size * 30}px` : "30px",
          height: orientation === "horizontal" ? "30px" : `${ship.size * 30}px`,
          backgroundImage: `url('/assets/images/barco_${ship.size}x1_${orientation}.png')`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          opacity: sunkShipIds.includes(ship.id) ? 0.7 : 1,
          pointerEvents: "none",
        };
        return (
          <div
            key={ship.id}
            className={`ship-overlay ${orientation} ${sunkShipIds.includes(ship.id) ? "sunk" : ""}`}
            style={style}
          />
        );
      })
    : null;

  return (
    <div className="board" onMouseLeave={onCellHoverLeave}>
      {shipOverlays}
      {grid.map((rowArr, r) => (
        <div className="board-row" key={`r-${r}`}>
          {rowArr.map((cell, c) => {
            const highlight = radarArea.some((p) => p[0] === r && p[1] === c);
            const preview = hoverPreview.some((p) => p[0] === r && p[1] === c);
            const shipSunk = cell?.shipId ? sunkShipIds.includes(cell.shipId) : false;
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
                shipSunk={shipSunk}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Board;
