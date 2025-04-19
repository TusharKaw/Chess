import './GameInfo.css';

const GameInfo = ({ playerColor, botLevel, gameStatus }) => {
  // Calculate elapsed time
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-info">
      <h3>Game Info</h3>
      
      <div className="info-sections">
        <div className="info-section">
          <h4>Players</h4>
          <div className="players-info">
            <div className={`player-info ${gameStatus.turn === 'white' ? 'active' : ''}`}>
              <div className="player-color white"></div>
              <span>{playerColor === 'white' ? 'You' : `Bot (Level ${botLevel})`}</span>
              {gameStatus.turn === 'white' && <div className="turn-indicator"></div>}
            </div>
            <div className={`player-info ${gameStatus.turn === 'black' ? 'active' : ''}`}>
              <div className="player-color black"></div>
              <span>{playerColor === 'black' ? 'You' : `Bot (Level ${botLevel})`}</span>
              {gameStatus.turn === 'black' && <div className="turn-indicator"></div>}
            </div>
          </div>
        </div>
        
        <div className="info-section">
          <h4>Status</h4>
          <div className="status-info">
            {gameStatus.isCheck && <div className="status-item check">Check</div>}
            {gameStatus.isCheckmate && <div className="status-item checkmate">Checkmate</div>}
            {gameStatus.isDraw && <div className="status-item draw">Draw</div>}
            {gameStatus.isStalemate && <div className="status-item stalemate">Stalemate</div>}
            {!gameStatus.isCheck && !gameStatus.isCheckmate && !gameStatus.isDraw && !gameStatus.isStalemate && (
              <div className="status-item normal">In Progress</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;