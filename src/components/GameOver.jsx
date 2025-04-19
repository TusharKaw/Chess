import './GameOver.css';

const GameOver = ({ result, onRestart, onExit }) => {
  let resultMessage = '';
  let resultClass = '';
  
  if (result.includes('White wins')) {
    resultMessage = 'White wins by checkmate!';
    resultClass = 'white-wins';
  } else if (result.includes('Black wins')) {
    resultMessage = 'Black wins by checkmate!';
    resultClass = 'black-wins';
  } else {
    resultMessage = 'Game ended in a draw!';
    resultClass = 'draw';
  }

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <div className={`result-banner ${resultClass}`}>
          <h2>{resultMessage}</h2>
        </div>
        
        <div className="game-over-content">
          <p className="result-details">
            {result.includes('wins') 
              ? 'Checkmate! The king has nowhere to move and is under attack.' 
              : 'The game has ended in a draw. Neither player can checkmate the other.'}
          </p>
          
          <div className="game-over-buttons">
            <button 
              className="restart-button" 
              onClick={onRestart}
            >
              Play Again
            </button>
            <button 
              className="exit-button" 
              onClick={onExit}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;