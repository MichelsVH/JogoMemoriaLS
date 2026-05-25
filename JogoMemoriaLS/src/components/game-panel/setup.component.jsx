import React from "react";

function Setup({ shipSizes, currentIndex, orientation, onToggleOrientation, placedCount }) {
  const currentSize = shipSizes[currentIndex] || null;
  return (
    <div className="setup-panel">
      <h4>Posicionamento da Frota</h4>
      <p>Navios restantes: {shipSizes.length - currentIndex}</p>
      {currentSize && <p>Navio tamanho: {currentSize}</p>}
      <div>
        <label>
          <input type="radio" name="orient" checked={orientation==='horizontal'} onChange={()=> onToggleOrientation('horizontal')} /> Horizontal
        </label>
        <label style={{marginLeft:8}}>
          <input type="radio" name="orient" checked={orientation==='vertical'} onChange={()=> onToggleOrientation('vertical')} /> Vertical
        </label>
      </div>
      <p style={{marginTop:8}}>Clique no tabuleiro para colocar o navio</p>
      <p>Posicionados: {placedCount}</p>
    </div>
  );
}

export default Setup;
