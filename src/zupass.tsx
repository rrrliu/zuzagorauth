import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import {
  constructZupassPcdGetRequestUrl,
  openZupassPopup
} from "@pcd/passport-interface";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { generateSnarkMessageHash } from "@pcd/util";
import {
  EdDSATicketFieldsToReveal,
  ZKEdDSAEventTicketPCDArgs,
  ZKEdDSAEventTicketPCDPackage
} from "@pcd/zk-eddsa-event-ticket-pcd";
import { ZUPASS_URL } from "./constants";
import { InputParams } from './types';
import { whitelistedTickets } from "./zupass-config";

/**
 * Opens a Zupass popup to prove a prove a ZKEdDSATicketPCD.
 *
 * @param urlToZupassWebsite URL of the Zupass website
 * @param popupUrl Route where the useZupassPopupSetup hook is being served from
 * @param fieldsToReveal Ticket data fields that site is requesting for user to reveal
 * @param fieldsToRevealUserProvided Whether the user can customize the fields to reveal
 * @param watermark Challenge to watermark this proof to
 * @param externalNullifier Optional unique identifier for this ZKEdDSAEventTicketPCD
 */
export function openZKEdDSAEventTicketPopup(
  urlToZupassWebsite: string,
  popupUrl: string,
  fieldsToReveal: EdDSATicketFieldsToReveal,
  fieldsToRevealUserProvided: boolean,
  watermark: bigint,
  validEventIds: string[],
  displayValidEventIds: string[],
  displayValidProductIds: string[],
  externalNullifier?: string
): void {
  const args: ZKEdDSAEventTicketPCDArgs = {
    ticket: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: EdDSATicketPCDPackage.name,
      value: undefined,
      userProvided: true,
      displayName: "Ticket(s)",
      validatorParams: {
        eventIds: displayValidEventIds,
        productIds: displayValidProductIds,
        notFoundMessage: "No eligible PCDs found"
      }
    },
    identity: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: SemaphoreIdentityPCDPackage.name,
      value: undefined,
      userProvided: true
    },
    validEventIds: {
      argumentType: ArgumentTypeName.StringArray,
      value: validEventIds.length !== 0 ? validEventIds : undefined,
      userProvided: false
    },
    fieldsToReveal: {
      argumentType: ArgumentTypeName.ToggleList,
      value: fieldsToReveal,
      userProvided: fieldsToRevealUserProvided
    },
    externalNullifier: {
      argumentType: ArgumentTypeName.BigInt,
      value: externalNullifier,
      userProvided: false
    },
    watermark: {
      argumentType: ArgumentTypeName.BigInt,
      value: watermark.toString(),
      userProvided: false
    }
  };
  console.log("🚀 ~ ZUPASS_URL:", urlToZupassWebsite)

  const proofUrl = constructZupassPcdGetRequestUrl<
  typeof ZKEdDSAEventTicketPCDPackage
  >(
    urlToZupassWebsite,
    popupUrl,
    ZKEdDSAEventTicketPCDPackage.name,
    args,
    {
      genericProveScreen: true,
      title: "ZKEdDSA Proof",
      description: "zkeddsa ticket pcd request",
      // @ts-ignore
      multi: true
      },
      true
      );
      
  console.log("🚀 ~ proofUrl:", proofUrl)
  openZupassPopup(popupUrl, proofUrl);
}



async function login(inputParams: InputParams | null) {
  if (inputParams === null) return;

  const watermark = generateSnarkMessageHash(process.env.NEXT_PUBLIC_WATERMARK);
  const externalNullifier = generateSnarkMessageHash("consumer-client").toString();

  const fieldsToReveal = {
    revealAttendeeEmail: true,
    revealEventId: true,
    revealProductId: true,
    revealAttendeeSemaphoreId: true
  };
  const revealFieldsUserProvided = true;

  const objectKeys = Object.keys(whitelistedTickets);
  // @ts-ignore
  const events = objectKeys.map(key => whitelistedTickets[key]);


  const validEventIds = (events: any[]) => {
    return events.reduce((acc, event) => {
      event.forEach((product: { eventId: string; }) => {
        if (!acc.includes(product.eventId)) {
          acc.push(product.eventId);
        }
      });
      return acc;
    }, []);
  };

  const displayValidEventIds = (events: any[]) => {
    return events.reduce((acc, event) => {
      event.forEach((product: { eventId: string; }) => {
        if (!acc.includes(product.eventId)) {
          acc.push(product.eventId);
        }
      });
      return acc;
    }, []);
  };

  const displayValidProductIds = (events: any[]) => {
    return events.reduce((acc, event) => {
      event.forEach((product: { productId: string; }) => {
        if (!acc.includes(product.productId)) {
          acc.push(product.productId);
        }
      });
      return acc;
    }, []);
  };
  
  console.log("🚀 ~ login ~ displayValidProductIds:", displayValidProductIds(events))
  console.log("🚀 ~ login ~ validEventIds:", validEventIds(events))

  openZKEdDSAEventTicketPopup(
    ZUPASS_URL,
    window.location.origin + "/popup/",
    fieldsToReveal,
    revealFieldsUserProvided,
    watermark,
    validEventIds(events),
    displayValidEventIds(events),
    displayValidProductIds(events),
    externalNullifier
  )
}

export function useZupass(): {
  login: (params: InputParams | null) => Promise<void>;
} {

  return { login };
}