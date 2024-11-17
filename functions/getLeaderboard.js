const fs = require("fs").promises;
const path = require("path");

const LEADERBOARD_FILE = path.resolve(__dirname, "../leaderboard.json");

exports.handler = async () => {
  try {
    const data = await fs.readFile(LEADERBOARD_FILE, "utf-8");
    return {
      statusCode: 200,
      body: data,
    };
  } catch (error) {
    console.error("Error reading leaderboard:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch leaderboard" }),
    };
  }
};