const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Only POST requests are allowed.' }),
    };
  }

  const { score, playerName, seed } = JSON.parse(event.body);

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ name: playerName || 'Anonymous', score, seed }]);

    if (error) {
      throw new Error(error.message);
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Score saved successfully!', data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};