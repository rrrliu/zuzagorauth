import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import {
  constructZupassPcdGetRequestUrl,
  openZupassPopup
} from "@pcd/passport-interface";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import {
  EdDSATicketFieldsToReveal,
  ZKEdDSAEventTicketPCDArgs,
  ZKEdDSAEventTicketPCDPackage
} from "@pcd/zk-eddsa-event-ticket-pcd";
import { ZUPASS_URL } from "./constants";
import { InputParams } from "./types";
import { supportedEvents } from "./zupass-config";

/**
 * Opens a Zupass popup to make a proof of a ZK EdDSA event ticket PCD.
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
      description: "zkeddsa ticket pcd request"
      // multi: true
    },
    true
  );

  openZupassPopup(popupUrl, proofUrl);
}

async function login(inputParams: InputParams | null) {
  if (inputParams === null) return;

  const bigIntNonce = "0x" + inputParams?.nonce.toString();

  console.log("Logging in with nonce:", bigIntNonce);

  const fieldsToReveal: EdDSATicketFieldsToReveal = {
    revealAttendeeEmail: true,
    revealEventId: true,
    revealProductId: true,
    revealAttendeeSemaphoreId: true
  };

  const revealFieldsUserProvided = false;
  const watermark = BigInt(bigIntNonce);
  const validEventIds: string[] = supportedEvents;
  const displayValidEventIds: string[] = supportedEvents;
  const displayValidProductIds: string[] = [];
  const externalNullifier = watermark.toString();

  openZKEdDSAEventTicketPopup(
    ZUPASS_URL,
    window.location.origin + "/popup",
    fieldsToReveal,
    revealFieldsUserProvided,
    watermark,
    validEventIds,
    displayValidEventIds,
    displayValidProductIds,
    externalNullifier
  );
}

export function useZupass(): {
  login: (params: InputParams | null) => Promise<void>;
} {
  return { login };
}
