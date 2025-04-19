import './MoveHistory.css';

const MoveHistory = ({ moves }) => {
  // Format moves into pairs (white and black)
  const formatMoves = () => {
    const formattedMoves = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      formattedMoves.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i],
        black: moves[i + 1]
      });
    }
    
    return formattedMoves;
  };
  
  // Format a move into algebraic notation
  const formatMove = (move) => {
    if (!move) return '';
    
    // Extract piece type, from square, to square, and whether it's a capture
    const { piece, from, to, san } = move;
    
    return san;
  };

  const movesList = formatMoves();

  return (
    <div className="move-history">
      <h3>Move History</h3>
      
      <div className="moves-container">
        <table className="moves-table">
          <thead>
            <tr>
              <th>#</th>
              <th>White</th>
              <th>Black</th>
            </tr>
          </thead>
          <tbody>
            {movesList.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-moves">No moves yet</td>
              </tr>
            ) : (
              movesList.map((movePair) => (
                <tr key={movePair.number}>
                  <td>{movePair.number}.</td>
                  <td>{formatMove(movePair.white)}</td>
                  <td>{formatMove(movePair.black)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoveHistory;