// pages/api/validate-sso.ts
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { payload, sig } = req.body;
  
  const secret = process.env.DISCOURSE_CONNECT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'DISCOURSE_CONNECT_SECRET environment variable is not set.' });
  }

  // Compute the HMAC-SHA256
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Decode the payload
  const rawPayload = Buffer.from(payload, 'base64').toString('utf8');
  const parsedPayload = querystring.parse(rawPayload);

  // Validate the signature
  if (computedSignature !== sig) {
    return res.status(403).json({ isValid: false });
  }
  
  // If the signature is valid, respond with the decoded payload
  res.status(200).json({ isValid: true, ...parsedPayload });
}
