// generateSignature.ts
import setDiscourseGroups from '@/utils/setDiscourseGroups';
import { PCD } from '@pcd/pcd-types';
import { ZKEdDSAEventTicketPCDClaim } from '@pcd/zk-eddsa-event-ticket-pcd';
import { Groth16Proof } from '@zk-kit/groth16';
import crypto from 'crypto';
import { matchTicketToType } from '../zupass-config';
import { toUrlEncodedString } from "./toUrl";

export const generateSignature = (pcd: PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof>, nonce: string)  => {
  try {
        // Extract the desired fields
        const attendeeEmail = pcd.claim.partialTicket.attendeeEmail;
        const attendeeSemaphoreId = pcd.claim.partialTicket.attendeeSemaphoreId;
        const eventId = pcd.claim.partialTicket.eventId;
        const productId = pcd.claim.partialTicket.productId;
        
        // CHECK TICKET TYPE
        if (!eventId || !productId) {
          throw new Error("No product or event selected.");
        }

        const ticketType = matchTicketToType(eventId, productId);
        
        // TODO: Change input to enable multi-proofs
        const groups = setDiscourseGroups(ticketType);
        
        const payload = {
          nonce: nonce, 
          email: attendeeEmail,
          external_id: attendeeSemaphoreId,
          add_groups: groups
        };

        // Encoding payload to Base64
        const urlPayload = toUrlEncodedString(payload)
        console.log("🚀 ~ file: generateSignature.ts:36 ~ generateSignature ~ urlPayload:", urlPayload)
        const encodedPayload = Buffer.from(urlPayload).toString('base64');

        // Your secret should be stored safely, for example using environment variables
        const secret = process.env.DISCOURSE_CONNECT_SECRET;
    
        if (typeof secret !== 'string') {
          throw new Error("'You need to set DISCOURSE_CONNECT_SECRET as an environment variable.'");
        }
    
        // Compute the HMAC-SHA256
        const signature = crypto
          .createHmac('sha256', secret)
          .update(encodedPayload)
          .digest('hex');
    
        console.log("Encoded Payload:", encodedPayload);
        console.log("Signature:", signature);
      return { encodedPayload, signature, ticketType };
  } catch (error) {
      console.error('There was an error generating the signature:', error);
      throw new Error("There was an error generating the signature.");
  }
};


