const fs = require("fs").promises;
const path = require("path");

// Use __dirname for resolving paths in Netlify Functions
const LEADERBOARD_FILE = path.join(__dirname, "leaderboard.json");

exports.handler = async () => {
  try {
    console.log("Attempting to read leaderboard file from:", LEADERBOARD_FILE);

    // Check if the file exists
    const fileExists = await fs.access(LEADERBOARD_FILE).then(() => true).catch(() => false);
    if (!fileExists) {
      console.error("Leaderboard file does not exist");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Leaderboard file not found" }),
      };
    }

    const data = await fs.readFile(LEADERBOARD_FILE, "utf-8");
    console.log("Leaderboard data successfully read:", data);

    return {
      statusCode: 200,
      body: data,
    };
  } catch (error) {
    console.error("Error in getLeaderboard function:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch leaderboard", details: error.message }),
    };
  }
};