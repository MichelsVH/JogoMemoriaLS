import React, { useState, useEffect, useRef } from "react";
import "../../assets/styles/App.css";
import "./game-panel.css";
import Board from "./board.component";
import Setup from "./setup.component";

const BOARD_SIZE = 10;
const SHIP_SIZES = [5,4,3,3,2,2];

function createEmptyGrid() {
  return Array.from({length: BOARD_SIZE}, () => Array.from({length: BOARD_SIZE}, () => ({ shipId: null, hit:false, tried:false })));
}

function cloneGrid(g){
  return g.map(r => r.map(c => ({...c})));
}

function GamePanel({ selectedLevel, gameStarted, onGameStart, onPoints, onGameOver, onPanelStatusUpdate, panelStatus }) {
  const [phase, setPhase] = useState('setup');
  const [playerGrid, setPlayerGrid] = useState(createEmptyGrid());
  const [computerGrid, setComputerGrid] = useState(createEmptyGrid());
  const [playerShips, setPlayerShips] = useState([]);
  const [computerShips, setComputerShips] = useState([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [fuel, setFuel] = useState(100);
  const [radarCount, setRadarCount] = useState(0);
  const [radarArea, setRadarArea] = useState([]);
  const [turnSeconds, setTurnSeconds] = useState(15);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('');
  const [hoverPreview, setHoverPreview] = useState([]);
  const aiDifficulty = (panelStatus && panelStatus.aiDifficulty) || 'advanced';
  const timerRef = useRef(null);
  const aiStateRef = useRef({});
  const messageTimerRef = useRef(null);

  useEffect(()=>{
    // initialize on mount or when game restarts
    resetGame();
  },[]);

  useEffect(()=>{
    return ()=>{
      if (messageTimerRef.current){
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
    };
  },[]);

  useEffect(()=>{
    onPanelStatusUpdate && onPanelStatusUpdate({
      fuel,
      radarAvailable: radarCount>0,
      radarCount,
      turnSeconds,
      isPlayerTurn,
      moves,
      message,
      playerName: (panelStatus && panelStatus.playerName) || ''
    });
  },[fuel, radarCount, turnSeconds, isPlayerTurn, moves, message, panelStatus, onPanelStatusUpdate]);

  useEffect(()=>{
    if (!gameStarted){
      setPhase('setup');
      resetGame();
    }
  },[gameStarted]);

  useEffect(()=>{
    if (phase==='playing') startTurnTimer();
    return ()=> stopTurnTimer();
  },[phase, isPlayerTurn]);

  function resetGame(){
    setPlayerGrid(createEmptyGrid());
    setComputerGrid(createEmptyGrid());
    setPlayerShips([]);
    setComputerShips([]);
    setCurrentShipIndex(0);
    setOrientation('horizontal');
    setIsPlayerTurn(true);
    setFuel(100);
    setRadarCount(0);
    setRadarArea([]);
    setTurnSeconds(15);
    setMoves(0);
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setMessage('');
    aiStateRef.current = { mode:'search', hitStack:[], targetQueue:[] };
  }

  function setTemporaryMessage(msg, duration = 3000){
    if (messageTimerRef.current){
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setMessage(msg);
    if (msg){
      messageTimerRef.current = setTimeout(()=>{
        setMessage('');
        messageTimerRef.current = null;
      }, duration);
    }
  }

  function canPlaceShip(grid, size, r,c,orient){
    if (orient==='horizontal'){
      if (c+size>BOARD_SIZE) return false;
      for(let i=0;i<size;i++) if (grid[r][c+i].shipId) return false;
    } else {
      if (r+size>BOARD_SIZE) return false;
      for(let i=0;i<size;i++) if (grid[r+i][c].shipId) return false;
    }
    return true;
  }

  function placeShip(grid, setGrid, ships, setShips, size, r,c,orient){
    if (!canPlaceShip(grid,size,r,c,orient)) return false;
    const id = `s-${ships.length+1}`;
    const newGrid = cloneGrid(grid);
    const positions = [];
    for(let i=0;i<size;i++){
      const rr = orient==='horizontal' ? r : r+i;
      const cc = orient==='horizontal' ? c+i : c;
      newGrid[rr][cc].shipId = id;
      positions.push([rr,cc]);
    }
    setGrid(newGrid);
    setShips([...ships, {id, size, positions, hits:0}]);
    return true;
  }

  function handlePlayerPlace(r,c){
    if (phase!=='setup') return;
    const size = SHIP_SIZES[currentShipIndex];
    if (!size) return;
    if (placeShip(playerGrid, setPlayerGrid, playerShips, setPlayerShips, size, r,c, orientation)){
      const next = currentShipIndex+1;
      setCurrentShipIndex(next);
      if (next >= SHIP_SIZES.length){
        // finished placement, place computer fleet
        placeComputerFleet();
        setPhase('playing');
        setTemporaryMessage('Jogo Iniciado', 3000);
      }
    } else {
      setTemporaryMessage('Posição inválida', 3000);
    }
  }

  function placeComputerFleet(){
    const choice = (panelStatus && panelStatus.computerFleetChoice) || 'random';
    const newGrid = createEmptyGrid();
    const ships = [];
    if (choice.startsWith('preset')){
      // simple presets: place ships in fixed rows
      let r=0;
      SHIP_SIZES.forEach((size,idx)=>{
        const id = `cs-${idx+1}`;
        const positions = [];
        for(let i=0;i<size;i++){
          newGrid[r][i].shipId = id;
          positions.push([r,i]);
        }
        ships.push({id,size,positions,hits:0});
        r+=1;
      });
    } else {
      // random placement
      let attempts=0;
      SHIP_SIZES.forEach((size,idx)=>{
        let placed=false;
        while(!placed && attempts<1000){
          attempts++;
          const orient = Math.random()<0.5?'horizontal':'vertical';
          const r = Math.floor(Math.random()*BOARD_SIZE);
          const c = Math.floor(Math.random()*BOARD_SIZE);
          if (canPlaceShip(newGrid,size,r,c,orient)){
            const id = `cs-${idx+1}`;
            const positions=[];
            for(let i=0;i<size;i++){
              const rr = orient==='horizontal' ? r : r+i;
              const cc = orient==='horizontal' ? c+i : c;
              newGrid[rr][cc].shipId = id;
              positions.push([rr,cc]);
            }
            ships.push({id,size,positions,hits:0});
            placed=true;
          }
        }
      });
    }
    setComputerGrid(newGrid);
    setComputerShips(ships);
  }

  function startTurnTimer(){
    stopTurnTimer();
    setTurnSeconds(15);
    timerRef.current = setInterval(()=>{
      setTurnSeconds(prev=>{
        if (prev<=1){
          clearInterval(timerRef.current);
          handleTurnTimeout();
          return 0;
        }
        return prev-1;
      });
    },1000);
  }

  function stopTurnTimer(){
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleTurnTimeout(){
    // penalize and pass to computer
    setFuel(f=>Math.max(0,f-5));
    setIsPlayerTurn(false);
    setMoves(m=>m+1);
    setTemporaryMessage('Tempo esgotado: turno do computador', 3000);
    setTimeout(()=> runComputerTurn(), 800);
  }

  function checkShipSunk(ships, shipId){
    const ship = ships.find(s=>s.id===shipId);
    if (!ship) return false;
    // count hits in grid
    let hits=0;
    ship.positions.forEach(([r,c])=>{
      if (computerGrid[r][c].hit) hits++;
    });
    return hits>=ship.size;
  }

  function handlePlayerAttack(r,c){
    if (phase!=='playing' || !isPlayerTurn) return;
    const cell = computerGrid[r][c];
    if (cell.tried || cell.hit) return;
    // consume fuel
    let newFuel = Math.max(0, fuel - 5);
    if (newFuel === 0){
      setFuel(0);
      endGame('Computador (combustível)');
      return;
    }
    setFuel(newFuel);
    
    const newGrid = cloneGrid(computerGrid);
    let hit=false;
    if (cell.shipId){
      newGrid[r][c].hit = true;
      hit=true;
      // recover fuel +10
      newFuel = Math.min(100, newFuel + 10);
      setFuel(newFuel);
    } else {
      newGrid[r][c].tried = true;
    }
    console.log(`Player shot at (${r},${c}) - ${hit ? 'hit' : 'miss'}`);
    onPoints && onPoints(hit ? 5 : -2);
    setComputerGrid(newGrid);
    setMoves(m=>m+1);
    // radar merit: if turned in less than 3s and hit, give one radar
    if (hit){
      // check if turnSeconds indicates quick action: started at 15, so time taken = 15 - turnSeconds
      const timeTaken = 15 - turnSeconds;
      if (timeTaken < 3){
        setRadarCount(rc=>rc+1);
      }
    }

    // check sink and win
    if (hit){
      // check if all computer ships sunk
      const allSunk = computerShips.every(ship => ship.positions.every(([rr,cc]) => newGrid[rr][cc].hit));
      if (allSunk){
        endGame((panelStatus && panelStatus.playerName) ? panelStatus.playerName : 'Jogador');
        return;
      }
    }

    // switch to computer turn after small delay
    setIsPlayerTurn(false);
    setTimeout(()=> runComputerTurn(), 600);
  }

  function runComputerTurn(){
    const grid = cloneGrid(playerGrid);
    let target = null;
    const ai = aiStateRef.current;
    const isAvailable = (rr,cc) => rr>=0 && rr<BOARD_SIZE && cc>=0 && cc<BOARD_SIZE && !grid[rr][cc].hit && !grid[rr][cc].tried;

    if (aiDifficulty === 'advanced'){
      // Advanced: pursue hits locally until ship sinks
      while(!target && ai.mode === 'target' && ai.targetQueue && ai.targetQueue.length){
        const candidate = ai.targetQueue.shift();
        if (candidate && isAvailable(candidate[0], candidate[1])){
          target = candidate;
        }
      }
    }

    if (!target){
      // Basic/fallback: pick random untried cell
      let tries=0;
      while(tries<1000){
        const r = Math.floor(Math.random()*BOARD_SIZE);
        const c = Math.floor(Math.random()*BOARD_SIZE);
        if (!grid[r][c].tried && !grid[r][c].hit){ target=[r,c]; break; }
        tries++;
      }
    }
    if (!target){ setIsPlayerTurn(true); return; }
    const [r,c]=target;
    const cell = grid[r][c];
    console.log(`Computer shot at (${r},${c}) - ${cell.shipId ? 'hit' : 'miss'}`);
    if (cell.shipId){
      grid[r][c].hit = true;
      // mark surrounding as targetQueue
      ai.mode='target';
      const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
        .filter(([rr,cc]) => isAvailable(rr,cc));
      const existing = (ai.targetQueue || []).map(([rr,cc]) => `${rr},${cc}`);
      ai.targetQueue = (ai.targetQueue || []).concat(adj.filter(([rr,cc]) => !existing.includes(`${rr},${cc}`)));
    } else {
      grid[r][c].tried = true;
    }
    setPlayerGrid(grid);
    setMoves(m=>m+1);
    // check player lost (all ships hit)
    const playerLost = playerShips.length>0 && playerShips.every(ship => ship.positions.every(([rr,cc]) => grid[rr][cc].hit));
    if (playerLost){ endGame('Computador'); return; }
    // after computer move resume player turn
    setTimeout(()=>{ setIsPlayerTurn(true); setTurnSeconds(15); }, 800);
  }

  function endGame(winner){
    setPhase('gameover');
    onPanelStatusUpdate && onPanelStatusUpdate({isPlayerTurn:false});
    onGameOver && onGameOver(winner, moves);
    setTemporaryMessage(`Vencedor: ${winner}`, 5000);
  }

  function handleCellClick(r,c){
    if (phase==='setup') return handlePlayerPlace(r,c);
    if (phase==='playing'){
      if (isPlayerTurn) handlePlayerAttack(r,c);
    }
  }

  function handleCellHover(r, c){
    if (phase !== 'setup') { setHoverPreview([]); return; }
    const size = SHIP_SIZES[currentShipIndex];
    if (!size) { setHoverPreview([]); return; }
    const preview = [];
    for(let i=0;i<size;i++){
      const rr = orientation==='horizontal' ? r : r+i;
      const cc = orientation==='horizontal' ? c+i : c;
      if (rr < BOARD_SIZE && cc < BOARD_SIZE) preview.push([rr,cc]);
    }
    setHoverPreview(preview);
  }

  function handleCellHoverLeave(){
    setHoverPreview([]);
  }

  function handleToggleOrientation(o){ setOrientation(o); }

  function handleUseRadar(){
    if (radarCount<=0) return;
    // find a 2x2 with at least one undamaged ship cell
    const g = computerGrid;
    for(let r=0;r<BOARD_SIZE-1;r++){
      for(let c=0;c<BOARD_SIZE-1;c++){
        const area = [[r,c],[r,c+1],[r+1,c],[r+1,c+1]];
        const ok = area.some(([rr,cc])=> g[rr][cc].shipId && !g[rr][cc].hit);
        if (ok){ setRadarArea(area); setRadarCount(rc=>rc-1); setTimeout(()=> setRadarArea([]), 3000); return; }
      }
    }
  }

  return (
    <section id="panel-game">
      <h3 className="sr-only">Batalha Naval</h3>
      <div className="game-wrapper">
        <div className="board-column">
          <h4>Seu Tabuleiro</h4>
          <Board grid={playerGrid} onCellClick={handleCellClick} showShips={true} radarArea={[]} onCellHover={handleCellHover} onCellHoverLeave={handleCellHoverLeave} hoverPreview={hoverPreview} disableInteraction={phase==='playing'} />
        </div>
        <div className="board-column">
          <h4>Tabuleiro do Computador</h4>
          <Board grid={computerGrid} onCellClick={handleCellClick} showShips={(panelStatus && panelStatus.debugShowComputer)} radarArea={radarArea} onCellHover={handleCellHover} onCellHoverLeave={handleCellHoverLeave} hoverPreview={[]} disableInteraction={phase==='setup'} />
          <div style={{marginTop:8}}>
            <button onClick={handleUseRadar} disabled={radarCount<=0}>Usar Radar</button>
          </div>
        </div>
        <aside className="game-info">
          {phase==='setup' && <Setup shipSizes={SHIP_SIZES} currentIndex={currentShipIndex} orientation={orientation} onToggleOrientation={handleToggleOrientation} placedCount={playerShips.length} />}
        </aside>
      </div>
    </section>
  );
}

export default GamePanel;
