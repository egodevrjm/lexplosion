const fs = require("fs").promises;
const path = require("path");

const LEADERBOARD_FILE = path.resolve(__dirname, "../leaderboard.json");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { name, score, seed } = JSON.parse(event.body);

    if (!name || typeof score !== "number" || !seed) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid data" }),
      };
    }

    const data = await fs.readFile(LEADERBOARD_FILE, "utf-8");
    const leaderboard = JSON.parse(data);

    leaderboard.push({ name, score, seed });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
    const trimmedLeaderboard = leaderboard.slice(0, 5); // Keep top 5 scores

    await fs.writeFile(
      LEADERBOARD_FILE,
      JSON.stringify(trimmedLeaderboard, null, 2)
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Score added", leaderboard: trimmedLeaderboard }),
    };
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update leaderboard" }),
    };
  }
};