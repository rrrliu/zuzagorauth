// pages/api/validate-sso.ts
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

export default withIronSessionApiRoute(
  async function nonceRoute(req: NextApiRequest, res: NextApiResponse) {
    try {

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
    
      // We save the nonce to check it out later and make sure it matched the one we saved.
      req?.session?.nonce = parsedPayload?.nonce;
      await req.session.save();
    
      // Validate the signature
      if (computedSignature !== sig) {
        return res.status(403).json({ isValid: false });
      }
      
      // If the signature is valid, respond with the decoded payload
      res.status(200).json({ isValid: true, ...parsedPayload });
    } catch (error) {
      console.error(`[ERROR] ${error}`);
      res.send(500);
    }
  },
  {
    cookieName: process.env.SESSION_COOKIE_NAME as string,
    password: process.env.SESSION_PASSWORD as string,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production"
    }
  }
);