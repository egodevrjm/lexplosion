import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Trophy, Share2, RefreshCw, Crown, AlertTriangle } from "lucide-react";
import GameGrid from "./components/GameGrid";
import TutorialModal from "./components/TutorialModal";
import Leaderboard from "./components/Leaderboard";
import axios from "axios";

const App = () => {
  const [searchParams] = useSearchParams();
  const seedParam = searchParams.get("seed");
  const seed = seedParam && !isNaN(seedParam) ? parseInt(seedParam, 10) : Date.now(); // Validate or generate a seed

  const [grid, setGrid] = useState(() => generateGameBoard(5, 5, parseInt(seed, 10)));
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [playerName] = useState(localStorage.getItem("playerName") || "");
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastWord, setLastWord] = useState("");


  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
    }
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) {
      saveHighScore(score, playerName, seed);
    }
  }, [gameOver, score, playerName, seed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showToast = (title, description, variant = "default") => {
    setToastMessage({ title, description, variant });
    setTimeout(() => setToastMessage(null), 2000); // Dismiss after 2 seconds
  };

  const handleWordSubmission = async (word, selectedCells) => {
    if (await validateWord(word)) {
      setLastWord(word); // Store the last valid word
      const basePoints = word.length;
      let bonusPoints = 0;
  
      if (word.length >= 5) bonusPoints += (word.length - 4) * 2;
  
      const totalPoints = basePoints + bonusPoints;
      setScore((prev) => prev + totalPoints);
      showToast("Word Accepted!", `+${totalPoints} points!`, "success");
  
      collapseGrid(selectedCells);
    } else {
      showToast("Invalid Word", "Try another combination.", "error");
    }
  };

  const collapseGrid = (selectedCells) => {
    const newGrid = [...grid];
    selectedCells.forEach(([row, col]) => {
      for (let r = row; r > 0; r--) {
        newGrid[r][col] = newGrid[r - 1][col];
      }
      newGrid[0][col] = "";
    });
    setGrid(newGrid);
  
    if (newGrid.flat().every((cell) => cell === "")) {
      setGameOver(true);
      showToast("Perfect Clear!", "Bonus points awarded for clearing the grid!", "success");
      setScore((prev) => prev + 50); // Bonus for clearing the grid
    }
  };

  const startNewGame = () => {
    const newSeed = Date.now(); // Generate a new unique seed
    setGrid(generateGameBoard(5, 5, newSeed)); // Generate a new board
    setScore(0);
    setGameOver(false);
    setTimeLeft(120);
    setLastWord("");
    // setComboCount(0);
    showToast("New Game Started", "Good luck!", "info");
  
    // Update the URL with the new seed
    const params = new URLSearchParams(window.location.search);
    params.set("seed", newSeed);
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  const shareResults = async () => {
    const url = `${window.location.origin}?seed=${seed}`;
    const message = `🎮 Word Collapse\n📊 Score: ${score}\n⏱️ Time: ${formatTime(
      120 - timeLeft
    )}\n\nPlay my board: ${url}`;
  
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Word Collapse",
          text: message,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(message);
        showToast("Link Copied!", "Share it with your friends!", "info");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      showToast("Error Sharing", "Could not share the link.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Lexplosion
        </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-bold text-xl">{score}</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-bold text-xl">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <GameGrid grid={grid} onWordSubmit={handleWordSubmission} />
          <div className="text-sm text-gray-600 text-center mt-4">
  Playing board: <span className="font-bold text-purple-600">{seed}</span>
</div>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            onClick={startNewGame}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            New Game
          </button>
          <button
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            onClick={shareResults}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Score
          </button>
        </div>

        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-xl mb-6">
                  Final Score:{" "}
                  <span className="font-bold text-purple-600">{score}</span>
                </p>
                <div className="space-y-4">
                  <button
                    className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={startNewGame}
                  >
                    Play Again
                  </button>
                  <button
                    className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={shareResults}
                  >
                    Share Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

        {timeLeft <= 30 && !gameOver && (
          <div className="bg-red-100 text-red-700 border border-red-400 rounded-lg p-4 mb-4">
            <AlertTriangle className="w-4 h-4" />
            <strong>Time is running out!</strong>
            <p>Only {timeLeft} seconds remaining!</p>
          </div>
        )}

        <div className="mt-8">
          <Leaderboard playerName={playerName} />
        </div>
      </div>

      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-md text-white ${
            toastMessage.variant === "success"
              ? "bg-green-500"
              : toastMessage.variant === "error"
              ? "bg-red-500"
              : "bg-gray-500"
          }`}
        >
          <strong>{toastMessage.title}</strong>
          <p>{toastMessage.description}</p>
        </div>
      )}
    </div>
  );
};

// const generateDailyGrid = (rows, cols, seed) => {
//   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const random = () => Math.floor(Math.random() * alphabet.length);

//   return Array.from({ length: rows }, () =>
//     Array.from({ length: cols }, () => alphabet[random()])
//   );
// };

const generateGameBoard = (rows, cols, seed) => {
  const random = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      alphabet.charAt(Math.floor(random(seed++) * alphabet.length))
    )
  );
};

const validateWord = async (word) => {
  if (word.length < 3) return false;

  const cachedWords = JSON.parse(localStorage.getItem("cachedWords")) || {};
  if (cachedWords[word.toUpperCase()] !== undefined) {
    return cachedWords[word.toUpperCase()];
  }

  try {
    const response = await axios.get(
      `https://api.datamuse.com/words?sp=${word}&max=1`
    );
    const isValid = response.data.length > 0;
    cachedWords[word.toUpperCase()] = isValid;
    localStorage.setItem("cachedWords", JSON.stringify(cachedWords));
    return isValid;
  } catch (error) {
    console.error("Error validating word:", error);
    return false;
  }
};

const saveHighScore = (score, playerName, seed) => {
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  const newEntry = { name: playerName || "Anonymous", score, seed };
  highScores.push(newEntry);
  highScores.sort((a, b) => b.score - a.score);
  localStorage.setItem("highScores", JSON.stringify(highScores.slice(0, 5)));
};

export default App;