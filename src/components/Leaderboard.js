import React, { useState, useEffect } from "react";

const Leaderboard = ({ playerName, setPlayerName, leaderboardData }) => {
  const [nameInput, setNameInput] = useState(playerName || "");
  const [leaderboard, setLeaderboard] = useState([]); // State for leaderboard data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch leaderboard data from Supabase
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/.netlify/functions/getLeaderboard");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid leaderboard data format");
      }
      setLeaderboard(data); // Save fetched leaderboard data
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]); // Fallback to an empty leaderboard
    } finally {
      setLoading(false); // Ensure loading ends
    }
  };

  // Fetch leaderboard when the component mounts or leaderboardData changes
  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardData]);

  // Handle saving or changing player name
  const handleNameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("playerName", nameInput); // Save name locally
    setPlayerName(nameInput); // Update parent state
  };

  // Get medal emoji based on rank
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

  // Format date
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

      {/* Display name input if no name is set */}
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

      {/* Display loading state */}
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
        // Display leaderboard entries
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