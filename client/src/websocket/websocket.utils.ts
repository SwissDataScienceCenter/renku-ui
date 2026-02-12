/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DateTime } from "luxon";

import type { AppParams } from "~/utils/context/appParams.types";
import type { WsServerMessage } from "./WsServerMessage";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
