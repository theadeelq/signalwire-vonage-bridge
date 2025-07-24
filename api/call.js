// /api/call.js
import axios from 'axios';
import { jwtGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to_number } = req.body;

  if (!to_number) {
    return res.status(400).json({ error: "Missing 'to_number' in request body" });
  }

  const VONAGE_APPLICATION_ID = process.env.VONAGE_APPLICATION_ID;
  const VONAGE_PRIVATE_KEY = process.env.VONAGE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const FROM_NUMBER = process.env.VONAGE_NUMBER;
  const ANSWER_URL = `${req.headers.origin}/api/ncco`;

  const token = jwtGenerate({
    application_id: VONAGE_APPLICATION_ID,
    private_key: VONAGE_PRIVATE_KEY,
    ttl: 60 * 60
  });

  try {
    const response = await axios.post(
      "https://api.nexmo.com/v1/calls",
      {
        to: [{ type: "phone", number: to_number }],
        from: { type: "phone", number: FROM_NUMBER },
        answer_url: [ANSWER_URL]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ status: "Call initiated", data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
}
