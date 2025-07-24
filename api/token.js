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

  const FROM_NUMBER = "+35722007329";
  const ANSWER_URL = `${req.headers.origin}/api/ncco`;

  try {
    // Get JWT token from /api/token
    const { data: { token } } = await axios.get(`${req.headers.origin}/api/token`);

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
};


// /api/token.js
const { SignJWT } = require('jose');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  const privateKey = process.env.VONAGE_PRIVATE_KEY;
  const applicationId = process.env.VONAGE_APPLICATION_ID;

  const key = await importPrivateKey(privateKey);

  const jwt = await new SignJWT({
    application_id: applicationId
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(key);

  res.status(200).json({ token: jwt });
};

function importPrivateKey(pem) {
  const pemClean = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')
    .trim();

  const keyBuffer = Buffer.from(pemClean, 'base64');
  return crypto.createPrivateKey({
    key: keyBuffer,
    format: 'der',
    type: 'pkcs8'
  });
}