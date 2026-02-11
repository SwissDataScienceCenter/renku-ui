import { DateTime } from "luxon";

import type { AppParams } from "~/utils/context/appParams.types";
import type {
  ValidatedServerMessage,
  WsServerMessage,
} from "./WsServerMessage";

interface GetWebSocketUrlArgs {
  params: AppParams;
}

export function getWebSocketUrl({ params }: GetWebSocketUrlArgs) {
  try {
    const wsUrl = new URL(params.UISERVER_URL);
    wsUrl.protocol = wsUrl.protocol === "http:" ? "ws:" : "wss:";
    wsUrl.pathname += wsUrl.pathname.endsWith("/") ? "" : "/";
    wsUrl.pathname += "ws";
    return wsUrl.toString();
  } catch (error) {
    if (error instanceof TypeError) {
      //? Creating an uncaught promise rejection to get Sentry to capture it.
      Promise.reject(error);
      return null;
    }
    throw error;
  }
}

export function parseWsServerMessage(message: unknown): WsServerMessage {
  const parsed = JSON.parse(message as any);
  if (typeof parsed !== "object") {
    throw new Error(`Incoming message is not a JSON object: ${parsed}`);
  }
  const data = parsed["data"];
  if (typeof data !== "object") {
    throw new Error(`Incoming message has invalid data: ${data}`);
  }
  const scope = parsed["scope"];
  if (typeof scope !== "string") {
    throw new Error(`Incoming message has invalid scope: ${scope}`);
  }
  const timestampStr = parsed["timestamp"];
  if (typeof timestampStr !== "string") {
    throw new Error(`Incoming message has invalid timestamp: ${timestampStr}`);
  }
  const timestamp = DateTime.fromISO(timestampStr);
  if (!timestamp.isValid) {
    throw new Error(`Incoming message has invalid timestamp: ${timestampStr}`);
  }
  const type_ = parsed["type"];
  if (typeof type_ !== "string") {
    throw new Error(`Incoming message has invalid type: ${type_}`);
  }
  const result: WsServerMessage = {
    data,
    scope,
    timestamp,
    type: type_,
  };
  return result;
}

export function validateServerMessage(
  message: WsServerMessage
): ValidatedServerMessage | { error: string } {
  const { data, scope, type: type_ } = message;

  // Only the "user" scope is valid
  if (scope !== "user") {
    return { error: `Invalid message scope: ${scope}` };
  }

  if (type_ === "init") {
    const dataMessage = data["message"];
    if (dataMessage != null && typeof dataMessage !== "string") {
      return { error: `Invalid message data.message: ${dataMessage}` };
    }
    const extraProperties = checkExtraProperties(data, ["message"]);
    if (extraProperties.length > 0) {
      return {
        error: `Invalid message data, found extra properties: ${extraProperties}`,
      };
    }
    const result: ValidatedServerMessage = {
      ...message,
      scope,
      type: type_,
      data: { message: dataMessage || undefined },
    };
    return result;

    //   init: [
    //   {
    //     required: null,
    //     optional: ["message"],
    //     handler: handleUserInit,
    //   },
    // ],
  }

  return { error: `Could not validate message: ${JSON.stringify(message)}` };
}

function checkExtraProperties(
  data: Record<string, unknown>,
  properties: string[]
) {
  const extraProperties: string[] = [];
  for (const prop of Object.keys(data)) {
    if (!properties.includes(prop)) {
      extraProperties.push(prop);
    }
  }
  return extraProperties;
}
