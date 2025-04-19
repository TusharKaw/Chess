import React, { useState } from 'react';
import './App.css';
import ChessGame from './components/ChessGame';
import GameOverModal from './components/GameOverModal';

function App() {
  const [gameResult, setGameResult] = useState(null);
  
  const handleGameOver = (result) => {
    setGameResult(result);
  };
  
  const handleReset = () => {
    setGameResult(null);
  };
  
  return (
    <div className="App">
      <h1>Chess vs Stockfish</h1>
      <ChessGame onGameOver={handleGameOver} gameResult={gameResult} />
      {gameResult && (
        <GameOverModal 
          result={gameResult} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
}

export default App;
