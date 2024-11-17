import React, { useState } from "react";

const Leaderboard = ({ playerName }) => {
  const [nameInput, setNameInput] = useState(playerName || "");
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  const validHighScores = highScores.filter(
    (entry) => entry.name && entry.score !== undefined && entry.seed
  );
    
  const handleNameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("playerName", nameInput);
    setNameInput(nameInput); // Dynamically update the name
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "🏅";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Check if the date is valid
    return isNaN(date.getTime()) ? "Unknown Date" : date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-600">🏆 Leaderboard</h2>
        <div className="text-sm text-gray-500">
          Today's Top Scores
        </div>
      </div>

      {!playerName && (
        <div className="mb-6 bg-purple-50 rounded-lg p-4">
          <form onSubmit={handleNameSubmit} className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={20}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              disabled={!nameInput.trim()}
            >
              Save Name
            </button>
          </form>
        </div>
      )}

      {highScores.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No high scores yet!</p>
          <p className="text-gray-400 mt-2">Be the first to make the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
    {validHighScores.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.name === playerName
                  ? "bg-purple-50 border border-purple-200"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getMedalEmoji(index)}</span>
                <div>
                  <span className="font-medium">
                    {entry.name}
                    {entry.name === playerName && (
                      <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </span>
                  <div className="text-sm text-gray-500">
                    {formatDate(entry.seed)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-purple-600">
                  {entry.score}
                </span>
                <span className="text-sm text-gray-500 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {playerName && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Playing as: {playerName}</span>
            <button
                onClick={() => {
                    localStorage.removeItem("playerName");
                    setNameInput(""); // Reset the name dynamically
                }}
                className="text-purple-600 hover:text-purple-700 underline"
                >
                Change Name
                </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;