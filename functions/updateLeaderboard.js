const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { data, error } = await supabase
      .from("leaderboard")
      .insert([{ name, score, seed }]);

    if (error) throw error;

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Leaderboard updated successfully", data }),
    };
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update leaderboard", details: error.message }),
    };
  }
};