import { useState } from 'react';
import GameSetup from './components/GameSetup';
import ChessGame from './components/ChessGame';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState('');
  const [botLevel, setBotLevel] = useState(1);

  const handleStartGame = (color, level) => {
    setPlayerColor(color);
    setBotLevel(level);
    setGameStarted(true);
  };

  const handleExitGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Chess Royale</h1>
      </header>
      <main className="app-content">
        {!gameStarted ? (
          <GameSetup onStartGame={handleStartGame} />
        ) : (
          <ChessGame 
            playerColor={playerColor} 
            botLevel={botLevel} 
            onExitGame={handleExitGame} 
          />
        )}
      </main>
      <footer className="app-footer">
        <p>tusharkaw64@gmail.com &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;