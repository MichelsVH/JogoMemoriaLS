import React from "react";

function Cell({ row, col, data, onClick, onHover, onHoverLeave, showShip, highlight, preview, disabled, shipSunk }) {
  const { shipId, hit, tried } = data || {};
  let cls = "cell";
  if (hit) cls += " hit";
  else if (tried) cls += " miss";
  if (showShip && shipId) cls += " ship";
  if (shipSunk) cls += " ship-sunk";
  if (highlight) cls += " highlight";
  if (preview) cls += " preview";
  if (disabled) cls += " disabled";
  const content = preview ? "▢" : "";

  return (
    <div 
      className={cls} 
      data-row={row} 
      data-col={col} 
      onClick={() => !disabled && onClick(row, col)}
      onMouseEnter={() => !disabled && onHover && onHover(row, col)}
      onMouseLeave={() => onHoverLeave && onHoverLeave()}
      style={disabled ? {cursor: 'not-allowed', opacity: 0.6} : {}}
    >
      {content}
    </div>
  );
}

export default Cell;
