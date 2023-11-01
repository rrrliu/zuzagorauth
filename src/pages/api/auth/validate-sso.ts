// pages/api/auth/validate-sso.ts
import crypto from 'crypto';
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import querystring from 'querystring';

declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    user?: string;
  }
}

const validateRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method Not Allowed' });
      return
    }
  
    const { payload, sig } = req.body;
    
    const secret = process.env.DISCOURSE_CONNECT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'DISCOURSE_CONNECT_SECRET environment variable is not set.' });
      return
    }
  
    // Compute the HMAC-SHA256
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  
    // Decode the payload
    const rawPayload = Buffer.from(payload, 'base64').toString('utf8');
    const parsedPayload = querystring.parse(rawPayload);
    const nonce = Array.isArray(parsedPayload.nonce) ? parsedPayload.nonce[0] : parsedPayload.nonce;

    // We save the nonce to check it out later and make sure it matched the one we saved.
    // Ensure session exists
    if (!req.session) {
      console.error('Session is not initialized.');
      res.status(500).json({ error: 'Internal Server Error' });
      return
    }

    req.session.nonce = nonce;
    await req.session.save();
  
    // Validate the signature
    if (computedSignature !== sig) {
      res.status(403).json({ isValid: false });
      return
    }
    
    // If the signature is valid, respond with the decoded payload
    res.send({ isValid: true, ...parsedPayload });
  } catch (error) {
    console.error(`[ERROR] ${error}`);
    res.status(500).json('Error: ');
    return
  }
}

const ironOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME as string,
  password: process.env.SESSION_PASSWORD as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production"
  }
}

export default withIronSessionApiRoute(validateRoute, ironOptions);