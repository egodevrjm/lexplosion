const fs = require("fs").promises;

const LEADERBOARD_FILE = "/tmp/leaderboard.json";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { name, score, seed } = JSON.parse(event.body);

    if (!name || score === undefined || !seed) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request data" }),
      };
    }

    // Check if the file exists
    const fileExists = await fs.access(LEADERBOARD_FILE).then(() => true).catch(() => false);

    // Read the existing leaderboard or initialize an empty one
    const leaderboard = fileExists
      ? JSON.parse(await fs.readFile(LEADERBOARD_FILE, "utf-8"))
      : [];

    // Add the new entry
    leaderboard.push({ name, score, seed });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending

    // Write back the updated leaderboard
    await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2), "utf-8");

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Leaderboard updated successfully" }),
    };
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update leaderboard", details: error.message }),
    };
  }
};