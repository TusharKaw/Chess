import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const STOCKFISH_SKILL_LEVEL = 10; // 0-20, higher is stronger
const THINKING_TIME = 1000; // time in ms for the engine to think

const ChessGame = ({ onGameOver, gameResult }) => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('');
  const [playerColor, setPlayerColor] = useState('w');
  const [status, setStatus] = useState('');
  const [thinking, setThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const stockfishRef = useRef(null);
  
  // Initialize the game and stockfish
  useEffect(() => {
    // Initialize board
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setStatus('Your turn (White)');
    
    // Initialize Stockfish
    try {
      const stockfish = new Worker('/stockfish.js');
      stockfishRef.current = stockfish;
      
      stockfish.postMessage('uci');
      stockfish.postMessage('setoption name Skill Level value ' + STOCKFISH_SKILL_LEVEL);
      stockfish.postMessage('isready');
      
      // Handle messages from Stockfish
      stockfish.addEventListener('message', handleStockfishMessage);
      
      // Stockfish is ready after receiving "readyok"
      const readyListener = (event) => {
        if (event.data === 'readyok') {
          setEngineReady(true);
          stockfish.removeEventListener('message', readyListener);
        }
      };
      stockfish.addEventListener('message', readyListener);
      
      // Cleanup
      return () => {
        if (stockfishRef.current) {
          stockfishRef.current.terminate();
        }
      };
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      setStatus('Error loading chess engine. Try refreshing the page.');
    }
  }, [gameResult]); // Reset when gameResult changes (new game)
  
  // Helper function to get the game status
  const getGameStatus = () => {
    if (game.isCheckmate()) return playerColor === game.turn() ? 'lose' : 'win';
    if (game.isDraw()) return 'draw';
    if (game.isStalemate()) return 'draw';
    if (game.isThreefoldRepetition()) return 'draw';
    if (game.isInsufficientMaterial()) return 'draw';
    return null;
  };
  
  // Update game state and check for end conditions
  useEffect(() => {
    if (!game) return;
    
    const result = getGameStatus();
    if (result) {
      onGameOver(result);
      return;
    }
    
    // If it's the computer's turn
    if (game.turn() !== playerColor && engineReady) {
      setStatus('Stockfish is thinking...');
      setThinking(true);
      makeStockfishMove();
    } else if (game.turn() === playerColor) {
      setStatus(`Your turn (${playerColor === 'w' ? 'White' : 'Black'})`);
    }
  }, [game, playerColor, engineReady]);
  
  // Handle Stockfish engine messages
  const handleStockfishMessage = (event) => {
    const message = event.data;
    if (message.startsWith('bestmove')) {
      const moveStr = message.split(' ')[1];
      if (moveStr && moveStr !== '(none)' && thinking) {
        setTimeout(() => {
          const gameCopy = new Chess(game.fen());
          try {
            const move = gameCopy.move({
              from: moveStr.substring(0, 2),
              to: moveStr.substring(2, 4),
              promotion: moveStr.length === 5 ? moveStr[4] : undefined
            });
            
            if (move) {
              setGame(gameCopy);
              setFen(gameCopy.fen());
            }
          } catch (error) {
            console.error('Invalid move:', moveStr, error);
          } finally {
            setThinking(false);
          }
        }, THINKING_TIME);
      }
    }
  };
  
  // Ask Stockfish for the best move
  const makeStockfishMove = () => {
    if (stockfishRef.current && engineReady) {
      stockfishRef.current.postMessage('position fen ' + game.fen());
      stockfishRef.current.postMessage('go depth 10');
    }
  };
  
  // Handle when the player makes a move
  const onDrop = (sourceSquare, targetSquare) => {
    if (thinking || game.turn() !== playerColor) return false;
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      });
      
      if (move === null) return false;
      
      setGame(gameCopy);
      setFen(gameCopy.fen());
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Reset the game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setStatus('Your turn (White)');
  };
  
  return (
    <div className="chess-game">
      <div style={{ width: 480, margin: '0 auto' }}>
        <Chessboard 
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
          }}
        />
      </div>
      
      <div className="game-info">
        <div className="status">{status}</div>
      </div>
      
      <div className="game-controls">
        <button onClick={resetGame} disabled={thinking}>Reset Game</button>
        <button 
          onClick={() => setPlayerColor(playerColor === 'w' ? 'b' : 'w')}
          disabled={game.history().length > 0 || thinking}
        >
          Switch Sides
        </button>
      </div>
    </div>
  );
};

export default ChessGame; 