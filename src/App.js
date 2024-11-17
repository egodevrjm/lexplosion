import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Trophy, Share2, RefreshCw, Crown, AlertTriangle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import GameGrid from "./components/GameGrid";
import TutorialModal from "./components/TutorialModal";
import Leaderboard from "./components/Leaderboard";
import axios from "axios";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [searchParams] = useSearchParams();
  const seedParam = searchParams.get("seed");
  const seed = seedParam && !isNaN(seedParam) ? parseInt(seedParam, 10) : Date.now(); // Validate or generate a seed

  const [grid, setGrid] = useState(() => generateGameBoard(5, 5, parseInt(seed, 10)));
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || "");
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [toastMessage, setToastMessage] = useState(null);
  
  const showToast = (title, description, variant = "default") => {
    setToastMessage({ title, description, variant });
    setTimeout(() => setToastMessage(null), 2000); // Dismiss after 2 seconds
  };

  // eslint-disable-next-line no-unused-vars
  const [lastWord, setLastWord] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]); // To hold the global leaderboard data
 

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true); // End the game when the timer hits zero
    }
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); // Decrement time every second
      return () => clearTimeout(timer); // Cleanup timeout if component re-renders or unmounts
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        saveHighScore(score, playerName, seed); // Save high score
        showToast("Game Over", "Your score has been saved.", "info"); // Display game-over message
      }, 1000); // Delay by 1 second
  
      return () => clearTimeout(timer); // Cleanup the timeout if `gameOver` changes or the component unmounts
    }
  }, [gameOver, score, playerName, seed]);

  useEffect(() => {
    const fetchInitialLeaderboard = async () => {
      const data = await fetchLeaderboard(); // Fetch leaderboard from Supabase
      setLeaderboardData(data); // Save it to state
    };
  
    fetchInitialLeaderboard();
  }, []); // Runs once when the component mounts

 

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  const handleEndGame = async () => {
    setGameOver(true); // End the game
    saveHighScore(score, playerName, seed); // Save the high score
  
    // Fetch updated leaderboard data
    const updatedLeaderboard = await fetchLeaderboard();
    
    // Pass the new leaderboard data to the Leaderboard component
    setLeaderboardData(updatedLeaderboard);
  
    // Provide feedback to the user
    showToast("Game Over", "Your score has been saved and leaderboard updated.", "info");
  };

  const handleWordSubmission = async (word, selectedCells) => {
    console.log("Selected Cells:", selectedCells); // Debugging
    console.log("Word:", word); // Debugging
  
    if (!Array.isArray(selectedCells) || selectedCells.length === 0) {
      console.warn("Invalid or empty cells array");
      return;
    }
  
    const isValid = await validateWord(word, selectedCells);
    if (isValid) {
      console.log(`"${word}" is valid!`);
      
      // Award points based on word length
      const points = word.length;
      setScore((prevScore) => prevScore + points);
  
      // Collapse the grid
      collapseGrid(selectedCells);
  
      // Provide feedback to the user
      showToast("Word Accepted!", `You earned ${points} points!`, "success");
    } else {
      console.warn(`"${word}" is invalid`);
      alert("Invalid word! Try again.");
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
  
    const remainingLetters = newGrid.flat().filter((cell) => cell !== "").length;
  
    if (remainingLetters <= 2) {
      setGameOver(true);
      showToast("Game Over", "Only 1-2 letters remain.", "info");
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
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: "Word Collapse",
          text: message,
          url: url,
        });
        showToast("Shared Successfully!", "Your results were shared.", "success");
      } else {
        // Clipboard fallback for unsupported browsers
        await navigator.clipboard.writeText(message);
        showToast("Link Copied!", "Share it with your friends!", "info");
      }
    } catch (error) {
      // Handle user cancellation or other errors
      if (error.name === "AbortError") {
        console.warn("Share action was canceled by the user.");
        showToast("Share Canceled", "You canceled the share.", "error");
      } else {
        console.error("Error sharing:", error);
        showToast("Error Sharing", "Could not share the link.", "error");
      }
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
        <GameGrid
  grid={grid}
  onWordSubmit={(word, selectedCells) => handleWordSubmission(word, selectedCells)}
/>
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
          <button
  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
  onClick={handleEndGame} // Call the new function
>
  End Game
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
        <Leaderboard
          playerName={playerName}
          setPlayerName={setPlayerName}
          leaderboardData={leaderboardData} // Pass leaderboard data as a prop
        />
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

const validateWord = async (word, selectedCells) => {
  // Basic validation
  if (!Array.isArray(selectedCells) || selectedCells.length === 0) {
    console.warn("Invalid or empty cells array");
    return false;
  }
  if (word.length < 3) return false;

  // Check if cells are contiguous
  const isContiguous = (cells) => {
    for (let i = 1; i < cells.length; i++) {
      const [prevRow, prevCol] = cells[i - 1];
      const [currRow, currCol] = cells[i];
      if (Math.abs(prevRow - currRow) > 1 || Math.abs(prevCol - currCol) > 1) {
        return false;
      }
    }
    return true;
  };

  if (!isContiguous(selectedCells)) {
    console.warn("Non-contiguous cells selected");
    return false;
  }

  // Check cache first
  const cachedWords = JSON.parse(localStorage.getItem("cachedWords")) || {};
  if (cachedWords[word.toUpperCase()] !== undefined) {
    return cachedWords[word.toUpperCase()];
  }

  try {
    const response = await axios.get(
      `https://api.datamuse.com/words?sp=${word}&md=d&max=1`
    );

    console.log('Datamuse API full response for word:', word, response.data);

    // Check if we got an exact match for the word
    const match = response.data.find(
      result => result.word.toLowerCase() === word.toLowerCase()
    );

    // Valid if:
    // 1. We found a match
    // 2. Match has definitions
    const isValid = Boolean(match && match.defs && match.defs.length > 0);

    // Cache the result
    cachedWords[word.toUpperCase()] = isValid;
    localStorage.setItem("cachedWords", JSON.stringify(cachedWords));

    console.log(`Word "${word}" validation:`, {
      found: Boolean(match),
      hasDefs: Boolean(match?.defs?.length),
      isValid,
      defs: match?.defs
    });

    return isValid;

  } catch (error) {
    console.error("Error validating word:", error);
    return false;
  }
};

const saveHighScore = async (score, playerName, seed) => {
  try {
    const response = await fetch('/.netlify/functions/saveHighScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, playerName, seed }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    console.log('Score saved successfully:', result);
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

const fetchLeaderboard = async () => {
  try {
    const response = await fetch('/.netlify/functions/getLeaderboard');
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched leaderboard data:", data);
    return data; // Return the leaderboard data
  } catch (error) {
    console.error("Error fetching leaderboard from serverless function:", error);
    return []; // Return an empty array if there's an error
  }
};

export default App;