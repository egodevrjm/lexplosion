import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

const GameGrid = ({ grid, onWordSubmit }) => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [collapsingCells, setCollapsingCells] = useState([]);

  const handleCellClick = (row, col, letter) => {
    // Only allow selecting adjacent cells
    if (selectedCells.length > 0) {
      const lastCell = selectedCells[selectedCells.length - 1];
      const isAdjacent = Math.abs(lastCell[0] - row) <= 1 && Math.abs(lastCell[1] - col) <= 1;
      if (!isAdjacent) return;
    }

    if (!selectedCells.some(([r, c]) => r === row && c === col)) {
      setSelectedCells([...selectedCells, [row, col]]);
      setCurrentWord(currentWord + letter);
    }
  };

  const handleSubmit = () => {
    if (!currentWord || currentWord.length < 3) {
      alert("Please select a valid word (3+ letters).");
      return;
    }
  
    if (!selectedCells || selectedCells.length === 0) {
      alert("Please select letters to form a word!");
      return;
    }
  
    console.log("Submitting Word:", currentWord); // Debugging
    console.log("Selected Cells:", selectedCells); // Debugging
  
    // Pass both word and selected cells to parent
    onWordSubmit(currentWord, selectedCells);
  
    setSelectedCells([]);
    setCurrentWord("");
  };

  const resetSelection = () => {
    setSelectedCells([]);
    setCurrentWord("");
  };

  const getCellClass = (row, col) => {
    const baseClasses = "w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-xl transition-all duration-300 transform";
    
    if (collapsingCells.some(([r, c]) => r === row && c === col)) {
      return `${baseClasses} animate-collapse bg-purple-500 text-white scale-0`;
    }
    
    if (selectedCells.some(([r, c]) => r === row && c === col)) {
      return `${baseClasses} bg-gradient-to-br from-purple-500 to-blue-500 text-white scale-105 shadow-lg ring-2 ring-purple-300 ring-offset-2`;
    }
    
    return `${baseClasses} bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-gray-800 shadow-sm hover:shadow-md hover:scale-102`;
  };

  const getConnectionLines = () => {
    if (selectedCells.length < 2) return null;

    return selectedCells.slice(1).map((cell, index) => {
      const prevCell = selectedCells[index];
      const x1 = prevCell[1] * 80 + 40; // Adjust based on cell size (72px) + gap (8px)
      const y1 = prevCell[0] * 80 + 40;
      const x2 = cell[1] * 80 + 40;
      const y2 = cell[0] * 80 + 40;

      return (
        <line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(147, 51, 234, 0.5)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          {getConnectionLines()}
        </svg>
        <div className="grid grid-cols-5 gap-2 relative z-10">
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex, letter)}
                disabled={collapsingCells.length > 0}
              >
                {letter}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-lg shadow-sm">
          <span className="text-lg font-medium text-gray-500">Current Word:</span>
          <span className="text-xl font-bold text-purple-600">{currentWord || "Select letters"}</span>
        </div>
        
        <div className="flex space-x-3">
          <button
            className="flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!currentWord || currentWord.length < 3}
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Word
          </button>
          
          <button
            className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-md"
            onClick={resetSelection}
            disabled={!currentWord}
          >
            <X className="w-5 h-5 mr-2" />
            Clear
          </button>
        </div>
      </div>

      <style>{`
        @keyframes collapse {
          0% { transform: scale(1); }
          100% { transform: scale(0); }
        }
        .animate-collapse {
          animation: collapse 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GameGrid;