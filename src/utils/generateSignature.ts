// generateSignature.ts
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
        const attendeeName = pcd.claim.partialTicket.attendeeName;
        const attendeeSemaphoreId = pcd.claim.partialTicket.attendeeSemaphoreId;
        const eventId = pcd.claim.partialTicket.eventId;
        const productId = pcd.claim.partialTicket.productId;
        
        // CHECK TICKET TYPE
        if (!eventId || !productId) {
          throw new Error("No product or event selected.");
        }

        const ticketType = matchTicketToType(eventId, productId);
        const isResident = ticketType === "ZuzaluResident"  ||  ticketType === "ZuConnectResident"  ||  ticketType === "ZuzaluOrganizer";

        const payload = {
          nonce: nonce, 
          email: attendeeEmail,
          name: attendeeName,
          external_id: attendeeSemaphoreId,
          add_groups: `$ticketType}, ${isResident && 'Resident'}`
        };

        // TODO: SIGN WITH PAYLOAD AND RETURN IT
        const urlPayload = toUrlEncodedString(payload)

        // Encoding payload to Base64
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
      return { encodedPayload, signature };
  } catch (error) {
      console.error('There was an error generating the signature:', error);
      throw new Error("There was an error generating the signature.");
  }
};


