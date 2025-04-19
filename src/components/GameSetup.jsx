import { useState } from 'react';
import './GameSetup.css';

const GameSetup = ({ onStartGame }) => {
  const [selectedColor, setSelectedColor] = useState('random');
  const [selectedLevel, setSelectedLevel] = useState(5);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(parseInt(e.target.value, 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If random is selected, randomly choose white or black
    let finalColor = selectedColor;
    if (selectedColor === 'random') {
      finalColor = Math.random() < 0.5 ? 'white' : 'black';
    }
    
    onStartGame(finalColor, selectedLevel);
  };

  return (
    <div className="game-setup">
      <div className="setup-card">
        <h2>Game Setup</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Choose your color</h3>
            <div className="color-options">
              <div 
                className={`color-option ${selectedColor === 'white' ? 'selected' : ''}`}
                onClick={() => handleColorSelect('white')}
              >
                <div className="color-circle white"></div>
                <span>White</span>
              </div>
              <div 
                className={`color-option ${selectedColor === 'black' ? 'selected' : ''}`}
                onClick={() => handleColorSelect('black')}
              >
                <div className="color-circle black"></div>
                <span>Black</span>
              </div>
              <div 
                className={`color-option ${selectedColor === 'random' ? 'selected' : ''}`}
                onClick={() => handleColorSelect('random')}
              >
                <div className="color-circle random"></div>
                <span>Random</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Bot Difficulty: {selectedLevel}</h3>
            <div className="difficulty-slider">
              <span className="difficulty-label">Easy</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={selectedLevel} 
                onChange={handleLevelChange}
                className="slider"
              />
              <span className="difficulty-label">Hard</span>
            </div>
          </div>

          <button type="submit" className="start-game-btn">
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSetup;