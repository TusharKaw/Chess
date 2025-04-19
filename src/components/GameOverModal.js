import React from 'react';

const GameOverModal = ({ result, onReset }) => {
  let title;
  
  switch (result) {
    case 'win':
      title = 'Congratulations! You Won!';
      break;
    case 'lose':
      title = 'You Lost. Better Luck Next Time!';
      break;
    case 'draw':
      title = 'Game Ended in a Draw!';
      break;
    default:
      title = 'Game Over';
  }
  
  const handleExit = () => {
    // For now, this just resets the game
    onReset();
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <div className="modal-buttons">
          <button className="retry-btn" onClick={onReset}>
            Play Again
          </button>
          <button className="exit-btn" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal; 