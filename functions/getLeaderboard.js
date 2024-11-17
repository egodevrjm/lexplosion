const fs = require("fs").promises;

const LEADERBOARD_FILE = "/tmp/leaderboard.json";

exports.handler = async () => {
  try {
    // Check if the file exists in /tmp
    const fileExists = await fs.access(LEADERBOARD_FILE).then(() => true).catch(() => false);

    // Read the leaderboard data if it exists
    const leaderboard = fileExists
      ? JSON.parse(await fs.readFile(LEADERBOARD_FILE, "utf-8"))
      : [];

    return {
      statusCode: 200,
      body: JSON.stringify(leaderboard),
    };
  } catch (error) {
    console.error("Error reading leaderboard file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch leaderboard", details: error.message }),
    };
  }
};