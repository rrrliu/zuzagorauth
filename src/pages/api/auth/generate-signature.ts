// pages/api/generate-signature.ts
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { payload } = req.body;
  if (!payload) {
    return res.status(400).json({ message: 'Missing payload.' });
  }

  try {
    // Encoding payload to Base64
    const encodedPayload = Buffer.from(payload).toString('base64');

    // Your secret should be stored safely, for example using environment variables
    const secret = process.env.DISCOURSE_CONNECT_SECRET;

    if (typeof secret !== 'string') {
      return res.status(500).json({ message: 'You need to set DISCOURSE_CONNECT_SECRET as an environment variable.' });
    }

    // Compute the HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('hex');

    console.log("Encoded Payload:", encodedPayload);
    console.log("Signature:", signature);

    res.status(200).json({ encodedPayload, signature });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
