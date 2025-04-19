// This module contains the AI for the computer player
// The AI difficulty ranges from 1 (easiest) to 10 (hardest)
import { Chess } from 'chess.js';

// Simple evaluation function for the chess position
// This is a basic evaluation that considers material value only
const evaluateBoard = (game) => {
  // Initialize evaluation
  let evaluation = 0;
  
  // Piece values (standard chess piece values)
  const pieceValues = {
    p: 1,   // pawn
    n: 3,   // knight
    b: 3,   // bishop
    r: 5,   // rook
    q: 9,   // queen
    k: 0    // king (not counted in material evaluation)
  };
  
  // Get the board representation
  const board = game.board();
  
  // Iterate through the board and sum up the material
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = pieceValues[piece.type];
        evaluation += piece.color === 'w' ? value : -value;
      }
    }
  }
  
  return evaluation;
};

// Function to check if a move is a capture
const isCapture = (game, move) => {
  return game.get(move.to) !== null || move.flags.includes('e'); // 'e' is en passant
};

// Function to check if a move gives check
const givesCheck = (game, move) => {
  // Make a copy of the game to simulate the move
  const gameCopy = new Chess(game.fen());
  try {
    gameCopy.move(move);
    return gameCopy.isCheck();
  } catch (e) {
    return false;
  }
};

// Generate a random move with optional bias towards captures and checks
const randomMove = (game, captureBias = 0.7, checkBias = 0.8) => {
  // Get all possible moves
  const moves = game.moves({ verbose: true });
  
  if (moves.length === 0) return null;
  
  // Categorize moves
  const captures = moves.filter(move => isCapture(game, move));
  const checks = moves.filter(move => givesCheck(game, move));
  const regular = moves.filter(move => !isCapture(game, move) && !givesCheck(game, move));
  
  // Use random number to decide which category to choose from
  const random = Math.random();
  
  let movePool;
  
  // Choose a category with bias
  if (captures.length > 0 && random < captureBias) {
    movePool = captures;
  } else if (checks.length > 0 && random < checkBias) {
    movePool = checks;
  } else {
    movePool = regular.length > 0 ? regular : moves;
  }
  
  // Select a random move from the pool
  const move = movePool[Math.floor(Math.random() * movePool.length)];
  return move;
};

// Minimax algorithm with alpha-beta pruning
const minimax = (game, depth, alpha, beta, maximizingPlayer) => {
  // Base case: reached leaf node or game over
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }
  
  const moves = game.moves({ verbose: true });
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluationScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluationScore);
      alpha = Math.max(alpha, evaluationScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluationScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evaluationScore);
      beta = Math.min(beta, evaluationScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
};

// Find the best move using minimax with alpha-beta pruning
const findBestMove = (game, depth) => {
  let bestMove = null;
  let bestEval = -Infinity;
  const maximizingPlayer = game.turn() === 'w';
  const moves = game.moves({ verbose: true });
  
  // Randomize moves to add variety
  moves.sort(() => Math.random() - 0.5);
  
  for (const move of moves) {
    game.move(move);
    const evaluationScore = minimax(
      game, 
      depth - 1, 
      -Infinity, 
      Infinity, 
      !maximizingPlayer
    );
    game.undo();
    
    if (evaluationScore > bestEval) {
      bestEval = evaluationScore;
      bestMove = move;
    }
  }
  
  return bestMove;
};

// Make a move for the computer based on the difficulty level
export const makeComputerMove = (game, level) => {
  // Clone the game to not modify the original
  const gameCopy = new Chess(game.fen());
  
  // Scale difficulty (1-10) to different strategies
  if (level <= 3) {
    // Easy: Mostly random moves with slight bias towards captures
    const captureBias = 0.2 + (level * 0.1); // 0.3, 0.4, 0.5
    return randomMove(gameCopy, captureBias, 0.3);
  } else if (level <= 6) {
    // Medium: Higher bias towards good tactical moves
    const captureBias = 0.5 + ((level - 3) * 0.1); // 0.6, 0.7, 0.8
    const checkBias = 0.5 + ((level - 3) * 0.1); // 0.6, 0.7, 0.8
    return randomMove(gameCopy, captureBias, checkBias);
  } else {
    // Hard: Use minimax with depth based on level
    const depth = Math.min(3, level - 5); // Depth 2-3
    return findBestMove(gameCopy, depth);
  }
};

// Helper function to get a random element from an array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};