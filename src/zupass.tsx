import { ZuAuthArgs, authenticate, zuAuthPopup } from "@pcd/zuauth";
import { InputParams, TicketTypeName } from "./types";
import { whitelistedTickets } from "./zupass-config";

async function login(inputParams: InputParams | null) {
  if (inputParams === null) return;

  const bigIntNonce = BigInt("0x" + inputParams.nonce.toString());
  const watermark = bigIntNonce.toString();

  // Ensure the tickets are formatted correctly
  const config = Object.entries(whitelistedTickets).flatMap(
    ([ticketType, tickets]) =>
      tickets
        .map((ticket) => {
          if (ticket.eventId && ticket.productId) {
            return {
              pcdType: "eddsa-ticket-pcd" as const,
              ticketType: ticketType as TicketTypeName,
              eventId: ticket.eventId,
              productId: ticket.productId,
              eventName: ticket.eventName || "",
              productName: ticket.productName || "",
              publicKey: ticket.publicKey
            };
          }
          console.error("Invalid ticket format:", ticket);
          return null;
        })
        .filter(
          (ticket): ticket is NonNullable<typeof ticket> => ticket !== null
        )
  );

  const args: ZuAuthArgs = {
    fieldsToReveal: {
      revealAttendeeEmail: true,
      revealAttendeeName: true,
      revealEventId: true,
      revealProductId: true
    },
    // zupassUrl: ZUPASS_URL,
    returnUrl: window.location.origin,
    watermark,
    config,
    proofTitle: "Sign-In with Zupass",
    proofDescription: "**Select a valid ticket to hop into the zuzaverse.**",
    multi: true
  };
  

  const result = await zuAuthPopup(args);
  console.log("🚀 ~ login ~ result:", result)
  if (result.type === "multi-pcd") {
    try {
      const pcds = await authenticate(result.pcds, watermark, config);
      console.log("Got PCD data: ", JSON.stringify(pcds))
    } catch (e) {
      console.log("Authentication failed: ", e);
    }
  }
}

export function useZupass(): {
  login: (params: InputParams | null) => Promise<void>;
} {
  return { login };
}





// 
// ####################################
// ####################################
// 




// export enum PCDRequestType {
//   Get = "Get",
//   GetWithoutProving = "GetWithoutProving",
//   Add = "Add",
//   ProveAndAdd = "ProveAndAdd"
// }

// export interface PCDRequest {
//   returnUrl: string;
//   type: PCDRequestType;
// }


// /**
//  * When a website uses the Zupass for signing in, Zupass
//  * signs this payload using a `SemaphoreSignaturePCD`.
//  */
// export interface SignInMessagePayload {
//   uuid: string;
//   referrer: string;
// }

// export interface PCDGetRequest<T extends PCDPackage = PCDPackage>
//   extends PCDRequest {
//   type: PCDRequestType.Get;
//   pcdType: T["name"];
//   args: ArgsOf<T>;
//   options?: ProveOptions;
// }

// export interface PCDGetWithoutProvingRequest extends PCDRequest {
//   pcdType: string;
// }

// export interface PCDAddRequest extends PCDRequest {
//   type: PCDRequestType.Add;
//   pcd: SerializedPCD;
// }

// export interface PCDProveAndAddRequest<T extends PCDPackage = PCDPackage>
//   extends PCDRequest {
//   type: PCDRequestType.ProveAndAdd;
//   pcdType: string;
//   args: ArgsOf<T>;
//   options?: ProveOptions;
//   returnPCD?: boolean;
// }

// export function getWithoutProvingUrl(
//   zupassClientUrl: string,
//   returnUrl: string,
//   pcdType: string
// ) {
//   const req: PCDGetWithoutProvingRequest = {
//     type: PCDRequestType.GetWithoutProving,
//     pcdType,
//     returnUrl
//   };
//   const encReq = encodeURIComponent(JSON.stringify(req));
//   return `${zupassClientUrl}#/get-without-proving?request=${encReq}`;
// }

// export function constructZupassPcdGetRequestUrl<T extends PCDPackage>(
//   zupassClientUrl: string,
//   returnUrl: string,
//   pcdType: T["name"],
//   args: ArgsOf<T>,
//   options?: ProveOptions
// ) {
//   const req: PCDGetRequest<T> = {
//     type: PCDRequestType.Get,
//     returnUrl: returnUrl,
//     args: args,
//     pcdType,
//     options
//   };
//   const encReq = encodeURIComponent(JSON.stringify(req));
//   return `${zupassClientUrl}#/prove?request=${encReq}`;
// }

// export function constructZupassPcdAddRequestUrl(
//   zupassClientUrl: string,
//   returnUrl: string,
//   pcd: SerializedPCD
// ) {
//   const req: PCDAddRequest = {
//     type: PCDRequestType.Add,
//     returnUrl: returnUrl,
//     pcd
//   };
//   const eqReq = encodeURIComponent(JSON.stringify(req));
//   return `${zupassClientUrl}#/add?request=${eqReq}`;
// }

// export function constructZupassPcdProveAndAddRequestUrl<
//   T extends PCDPackage = PCDPackage
// >(
//   zupassClientUrl: string,
//   returnUrl: string,
//   pcdType: string,
//   args: ArgsOf<T>,
//   options?: ProveOptions,
//   returnPCD?: boolean
// ) {
//   const req: PCDProveAndAddRequest = {
//     type: PCDRequestType.ProveAndAdd,
//     returnUrl: returnUrl,
//     pcdType,
//     args,
//     options,
//     returnPCD
//   };
//   const eqReq = encodeURIComponent(JSON.stringify(req));
//   return `${zupassClientUrl}#/add?request=${eqReq}`;
// }

// export const getAnonTopicNullifier = (
//   chatId: number,
//   topicId: number
// ): bigint => {
//   return BigInt(
//     "0x" + sha256(JSON.stringify({ chatId, topicId })).substring(0, 16)
//   );
// };