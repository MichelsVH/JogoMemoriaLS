import React from "react";
import "./control-panel.css";

function ControlPanel(props) {
  const {
    gameStarted,
    onGameStart,
    selectedLevel,
    onLevelChange,
    panelStatus = {},
    onPanelAction,
    totalPoints,
    isModalOpen,
    onGameOver,
  } = props;

  const { turnSeconds = 15, fuel = 100, radarAvailable = false, radarCount = 0, playerName = "", isPlayerTurn = true, debugShowComputer = false, computerFleetChoice = "random", aiDifficulty = "advanced", moves = 0, message = "" } = panelStatus;

  return (
    <section id="panel-control">
      <h3 className="sr-only">Painel de Controlo</h3>
      <form className="form">
        <fieldset className="form-group">
          <label htmlFor="playerName">Nome do Jogador:</label>
          <input id="playerName" value={playerName} onChange={(e)=> onPanelAction({playerName: e.target.value})} placeholder="Jogador" />
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor="computerDifficulty">Dificuldade do Computador:</label>
          <select id="computerDifficulty" value={aiDifficulty} onChange={(e)=> onPanelAction({aiDifficulty: e.target.value})} disabled={gameStarted}>
            <option value="basic">Básica (Aleatória)</option>
            <option value="advanced">Avançada (Estratégica)</option>
          </select>
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor="computerFleet">Frota do Computador:</label>
          <select id="computerFleet" value={computerFleetChoice} onChange={(e)=> onPanelAction({computerFleetChoice: e.target.value})} disabled={gameStarted}>
            <option value="random">Aleatória</option>
            <option value="preset1">Pré-definida 1</option>
            <option value="preset2">Pré-definida 2</option>
            <option value="preset3">Pré-definida 3</option>
          </select>
        </fieldset>
        <div style={{marginTop:8}}>
          <button type="button" id="btPlay" onClick={onGameStart} disabled={!playerName || playerName.trim() === ''}>{gameStarted ? "Terminar Jogo" : "Iniciar Jogo"}</button>
        </div>
      </form>

      <div className="form-metadata">
        <dl className={`list-item ${gameStarted? 'left gameStarted':''}`}>
          <dt>Cronómetro (turno):</dt>
          <dd id="gameTime" style={turnSeconds<=5?{backgroundColor:'red'}:{}}>{turnSeconds}s</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'right gameStarted':''}`}>
          <dt>Combustível:</dt>
          <dd id="fuel">{fuel}</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'left gameStarted':''}`}>
          <dt>Radar:</dt>
          <dd id="radar">{radarAvailable ? `Disponível (${radarCount})` : 'Indisponível'}</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'right gameStarted':''}`}>
          <dt>Jogador:</dt>
          <dd id="playerNameDisplay">{playerName || '---'}</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'left gameStarted':''}`}>
          <dt>Pontuação:</dt>
          <dd id="scoreDisplay">{totalPoints}</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'right gameStarted':''}`}>
          <dt>Turno do jogador:</dt>
          <dd id="playerTurnDisplay">{isPlayerTurn ? 'Sim' : 'Não'}</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'left gameStarted':''}`}>
          <dt>Jogadas:</dt>
          <dd id="movesDisplay">{moves}</dd>
        </dl>
        <dl className={`list-item ${gameStarted? 'right gameStarted':''}`}>
          <dt>Mensagem:</dt>
          <dd id="messageDisplay">{message || '---'}</dd>
        </dl>
        <div style={{marginTop:8}}>
          <label><input type="checkbox" checked={debugShowComputer} onChange={(e)=> onPanelAction({debugShowComputer: e.target.checked})} /> Mostrar frota do PC (debug)</label>
        </div>
      </div>
    </section>
  );
}

export default ControlPanel;
