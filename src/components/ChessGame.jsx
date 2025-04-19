import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import GameOver from './GameOver';
import MoveHistory from './MoveHistory';
import GameInfo from './GameInfo';
import { makeComputerMove } from '../utils/botAI';
import './ChessGame.css';

const ChessGame = ({ playerColor, botLevel, onExitGame }) => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState({
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    isStalemate: false,
    gameResult: '',
    turn: 'white'
  });
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pieceSquare, setPieceSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [pendingMove, setPendingMove] = useState(null);

  // Initialize the board
  useEffect(() => {
    setFen(game.fen());
    updateGameStatus();
    
    // If computer plays as white, make the first move
    if (playerColor === 'black') {
      makeComputerMoveWithDelay();
    }
  }, []);
  
  // Update the game status whenever the game state changes
  const updateGameStatus = useCallback(() => {
    const newStatus = {
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isDraw: game.isDraw(),
      isStalemate: game.isStalemate(),
      gameResult: '',
      turn: game.turn() === 'w' ? 'white' : 'black'
    };
    
    if (newStatus.isCheckmate) {
      newStatus.gameResult = game.turn() === 'w' ? 'Black wins' : 'White wins';
      setIsGameOver(true);
    } else if (newStatus.isDraw || newStatus.isStalemate) {
      newStatus.gameResult = 'Draw';
      setIsGameOver(true);
    }
    
    setGameStatus(newStatus);
  }, [game]);
  
  // Make a move and update the game state
  const makeMove = useCallback((move) => {
    try {
      const result = game.move(move);
      if (result) {
        setFen(game.fen());
        setMoveHistory(game.history({ verbose: true }));
        updateGameStatus();
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  }, [game, updateGameStatus]);
  
  // Handle computer's move with a delay for better UX
  const makeComputerMoveWithDelay = useCallback(() => {
    // Add a small delay before the computer makes its move
    setTimeout(() => {
      const computerMove = makeComputerMove(game, botLevel);
      if (computerMove) {
        makeMove(computerMove);
      }
    }, 500);
  }, [game, botLevel, makeMove]);
  
  // Handle player's move
  useEffect(() => {
    if (pendingMove && game.turn() === (playerColor === 'white' ? 'w' : 'b')) {
      const result = makeMove(pendingMove);
      if (result && !isGameOver) {
        makeComputerMoveWithDelay();
      }
      setPendingMove(null);
    }
  }, [pendingMove, game, makeMove, makeComputerMoveWithDelay, playerColor, isGameOver]);
  
  // Get possible moves for a piece
  const getMoveOptions = useCallback((square) => {
    const moves = game.moves({
      square,
      verbose: true
    });
    return moves.map(move => move.to);
  }, [game]);
  
  // Handle piece click
  const onSquareClick = useCallback((square) => {
    // If it's not the player's turn, don't allow moves
    if (game.turn() !== (playerColor === 'white' ? 'w' : 'b')) {
      return;
    }
    
    // Check if the clicked square has a piece that can be moved
    const piece = game.get(square);
    const hasPiece = piece && piece.color === (playerColor === 'white' ? 'w' : 'b');
    
    // If no piece was previously selected, select this piece if it belongs to the player
    if (!moveFrom) {
      if (hasPiece) {
        setMoveFrom(square);
        setPieceSquare(square);
        setPossibleMoves(getMoveOptions(square));
      }
      return;
    }
    
    // If a piece was already selected
    
    // If the user clicks the already selected piece, deselect it
    if (square === moveFrom) {
      setMoveFrom('');
      setPieceSquare(null);
      setPossibleMoves([]);
      return;
    }
    
    // If the user clicks a different piece of their own color, select that piece instead
    if (hasPiece) {
      setMoveFrom(square);
      setPieceSquare(square);
      setPossibleMoves(getMoveOptions(square));
      return;
    }
    
    // Try to make the move
    const moveObj = {
      from: moveFrom,
      to: square,
      promotion: 'q' // Default promotion to queen
    };
    
    // Check if this is a pawn promotion move
    const selectedPiece = game.get(moveFrom);
    if (
      selectedPiece && 
      selectedPiece.type === 'p' && 
      ((square[1] === '8' && selectedPiece.color === 'w') || 
       (square[1] === '1' && selectedPiece.color === 'b'))
    ) {
      setMoveTo(square);
      setShowPromotionDialog(true);
      return;
    }
    
    // Make the move
    setPendingMove(moveObj);
    setMoveFrom('');
    setPieceSquare(null);
    setPossibleMoves([]);
  }, [game, moveFrom, playerColor, getMoveOptions]);
  
  // Handle piece promotion
  const handlePromotion = (promotionPiece) => {
    const moveObj = {
      from: moveFrom,
      to: moveTo,
      promotion: promotionPiece
    };
    
    setPendingMove(moveObj);
    setMoveFrom('');
    setMoveTo(null);
    setPieceSquare(null);
    setPossibleMoves([]);
    setShowPromotionDialog(false);
  };
  
  // Restart the game
  const handleRestartGame = () => {
    setGame(new Chess());
    setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setIsGameOver(false);
    setMoveFrom('');
    setMoveTo(null);
    setPieceSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    updateGameStatus();
    
    // If computer plays as white, make the first move
    if (playerColor === 'black') {
      makeComputerMoveWithDelay();
    }
  };

  // Customize square styles (highlight valid moves and selected piece)
  const customSquareStyles = {};
  
  // Highlight the selected piece
  if (pieceSquare) {
    customSquareStyles[pieceSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    };
  }
  
  // Highlight possible moves
  possibleMoves.forEach(square => {
    customSquareStyles[square] = {
      backgroundColor: 'rgba(0, 255, 0, 0.2)',
      borderRadius: '50%',
      boxShadow: 'inset 0 0 1px 2px rgba(0, 255, 0, 0.7)'
    };
  });
  
  // Highlight check
  if (gameStatus.isCheck) {
    // Find the king's position
    const king = Object.entries(game.board().flat().filter(Boolean))
      .find(([_, piece]) => piece.type === 'k' && piece.color === game.turn());
    
    if (king) {
      const square = king[1].square;
      customSquareStyles[square] = {
        backgroundColor: 'rgba(255, 0, 0, 0.4)'
      };
    }
  }

  return (
    <div className="chess-game">
      <div className="game-container">
        <div className="board-container">
          <Chessboard
            position={fen}
            boardWidth={Math.min(560, window.innerWidth - 40)}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
            }}
            customSquareStyles={customSquareStyles}
            boardOrientation={playerColor === 'black' ? 'black' : 'white'}
            onSquareClick={onSquareClick}
            areArrowsAllowed={true}
          />
        </div>
        
        <div className="game-sidebar">
          <GameInfo 
            playerColor={playerColor} 
            botLevel={botLevel} 
            gameStatus={gameStatus} 
          />
          <MoveHistory moves={moveHistory} />
        </div>
      </div>
      
      {showPromotionDialog && (
        <div className="promotion-dialog">
          <div className="promotion-pieces">
            <button onClick={() => handlePromotion('q')}>Queen</button>
            <button onClick={() => handlePromotion('r')}>Rook</button>
            <button onClick={() => handlePromotion('b')}>Bishop</button>
            <button onClick={() => handlePromotion('n')}>Knight</button>
          </div>
        </div>
      )}
      
      {isGameOver && (
        <GameOver 
          result={gameStatus.gameResult} 
          onRestart={handleRestartGame} 
          onExit={onExitGame} 
        />
      )}
    </div>
  );
};

export default ChessGame;