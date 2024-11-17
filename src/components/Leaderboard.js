import React, { useState, useEffect } from "react";

const Leaderboard = ({ playerName, setPlayerName }) => {
  const [nameInput, setNameInput] = useState(playerName || "");
  const [leaderboard, setLeaderboard] = useState([]); // State for fetched leaderboard
  const [loading, setLoading] = useState(true); // For loading state

  // Fetch leaderboard data from the server or API
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/.netlify/functions/getLeaderboard");
      const data = await response.json();
      setLeaderboard(data); // Use fetched data
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false); // Ensure loading ends
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("playerName", nameInput); // Save to localStorage
    setPlayerName(nameInput); // Update parent state dynamically
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return "🏅";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Unknown Date" : date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-600">🏆 Leaderboard</h2>
        <div className="text-sm text-gray-500">Today's Top Scores</div>
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

      {loading ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No high scores yet!</p>
          <p className="text-gray-400 mt-2">Be the first to make the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
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
                  <div className="text-sm text-gray-500">{formatDate(entry.seed)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-purple-600">{entry.score}</span>
                <span className="text-sm text-gray-500 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;