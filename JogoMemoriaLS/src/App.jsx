import "./assets/styles/App.css";
import {
  ControlPanel,
  Footer,
  Header,
  GamePanel,
  GameOverModal,
} from "./components";
import { useState } from "react";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [panelStatus, setPanelStatus] = useState({
    turnSeconds: 15,
    fuel: 100,
    radarAvailable: false,
    radarCount: 0,
    playerName: "",
    isPlayerTurn: true,
    debugShowComputer: false,
    computerFleetChoice: "random",
    aiDifficulty: "advanced",
  });
  const [selectedLevel, setSelectedLevel] = useState("0");
  const [totalPoints, setTotalPoints] = useState(0);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [gameWinner, setGameWinner] = useState(null);
  const [gameMoves, setGameMoves] = useState(0);

  const handlePanelStatusUpdate = (partial) => {
    setPanelStatus((prev) => ({ ...prev, ...partial }));
  };

  const handleGameStart = () => {
    if (gameStarted) {
      setGameStarted(false);
    } else {
      setGameStarted(true);
      setTotalPoints(0);
    }
  };

  const handleLevelChange = (event) => {
    const { value } = event.currentTarget;
    // const value = event.currentTarget.value

    setSelectedLevel(value);
  };

  const handlePoints = (delta) => {
    setTotalPoints((prev) => prev + delta);
  };

  const handleGameOverModalClose = () => {
    setIsGameOverModalOpen(false);
    setGameStarted(false);
    setGameWinner(null);
    setGameMoves(0);
  };

  const handleGameOver = (winner, moves) => {
    setGameWinner(winner);
    setGameMoves(moves);
    setIsGameOverModalOpen(true);
  };

  const handleRestart = () => {
    handleGameOverModalClose();
    setGameStarted(false);
    setPanelStatus(prev => ({...prev, playerName: prev.playerName}));
  };

  return (
    <div id="container">
      <Header />
      <main>
        <ControlPanel
          gameStarted={gameStarted}
          onGameStart={handleGameStart}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          panelStatus={panelStatus}
          onPanelAction={handlePanelStatusUpdate}
          totalPoints={totalPoints}
          isModalOpen={isGameOverModalOpen}
          onGameOver={handleGameOver}
        />
        {gameStarted && (
        <GamePanel
          selectedLevel={selectedLevel}
          gameStarted={gameStarted}
          onGameStart={handleGameStart}
          onPoints={handlePoints}
          onGameOver={handleGameOver}
          onPanelStatusUpdate={handlePanelStatusUpdate}
          panelStatus={panelStatus}
        />
        )}
      </main>
      <GameOverModal
        isOpen={isGameOverModalOpen}
        onClose={handleGameOverModalClose}
        onRestart={handleRestart}
        points={totalPoints}
        winner={gameWinner}
        moves={gameMoves}
        playerName={panelStatus.playerName}
      />
      <Footer />
    </div>
  );
}

export default App;
