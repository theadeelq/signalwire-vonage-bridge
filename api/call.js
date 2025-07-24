// /api/call.js
const axios = require('axios');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to_number } = req.body;

  if (!to_number) {
    return res.status(400).json({ error: "Missing 'to_number' in request body" });
  }

  const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
  const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
  const FROM_NUMBER = "+35722007329";
  const ANSWER_URL = `${req.headers.origin}/api/ncco`;

  try {
    const response = await axios.post(
      "https://api.nexmo.com/v1/calls",
      {
        to: [{ type: "phone", number: to_number }],
        from: { type: "phone", number: FROM_NUMBER },
        answer_url: [ANSWER_URL]
      },
      {
        auth: {
          username: VONAGE_API_KEY,
          password: VONAGE_API_SECRET
        }
      }
    );

    res.json({ status: "Call initiated", data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
};
