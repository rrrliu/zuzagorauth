import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import {
  EdDSATicketFieldsToReveal,
  ZKEdDSAEventTicketPCDArgs,
  ZKEdDSAEventTicketPCDPackage
} from "@pcd/zk-eddsa-event-ticket-pcd";
import { constructZupassPcdGetRequestUrl } from "./PassportInterface";
import { openZupassPopup } from "./PassportPopup";
import { ZUPASS_URL } from "./constants";
import { InputParams } from './types';
import { supportedEvents } from "./zupass-config";

/**
 * Opens a Zupass popup to make a proof of a ZK EdDSA event ticket PCD.
 */
function openZKEdDSAEventTicketPopup(
  fieldsToReveal: EdDSATicketFieldsToReveal,
  watermark: bigint,
  validEventIds: string[],
  validProductIds: string[]
) {
  const args: ZKEdDSAEventTicketPCDArgs = {
    ticket: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: EdDSATicketPCDPackage.name,
      value: undefined,
      userProvided: true,
      validatorParams: {
        eventIds: validEventIds,
        productIds: validProductIds,
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
      value: validEventIds.length != 0 ? validEventIds : undefined,
      userProvided: false
    },
    fieldsToReveal: {
      argumentType: ArgumentTypeName.ToggleList,
      value: fieldsToReveal,
      userProvided: false
    },
    watermark: {
      argumentType: ArgumentTypeName.BigInt,
      value: watermark.toString(),
      userProvided: false
    },
    externalNullifier: {
      argumentType: ArgumentTypeName.BigInt,
      value: watermark.toString(),
      userProvided: false
    }
  };

  const popupUrl = window.location.origin + "/popup";

  const proofUrl = constructZupassPcdGetRequestUrl<
    typeof ZKEdDSAEventTicketPCDPackage
  >(ZUPASS_URL, popupUrl, ZKEdDSAEventTicketPCDPackage.name, args, {
    genericProveScreen: true,
    title: "Sign-In with Zupass",
    description: "**Select a valid ticket to hop into the zuzaverse.**"
  });

  openZupassPopup(popupUrl, proofUrl);
}

async function login(inputParams: InputParams | null) {
  if (inputParams === null) return;
  
  const bigIntNonce = '0x' + inputParams?.nonce.toString();

  openZKEdDSAEventTicketPopup(
    {
      revealAttendeeEmail: true,
      revealEventId: true,
      revealProductId: true,
      revealAttendeeSemaphoreId: true
    },
    BigInt(bigIntNonce),
    supportedEvents,
    []
  );
}

export function useZupass(): {
  login: (params: InputParams | null) => Promise<void>;
} {

  return { login };
}
