// /api/ncco.js
export default function handler(req, res) {
  const ncco = [
    {
      action: "connect",
      endpoint: [
        {
          type: "sip",
          uri: "sip:adeel@sb1-fd81b3c0f5f2.sip.signalwire.com"
        }
      ]
    }
  ];

  res.status(200).json(ncco);
}
