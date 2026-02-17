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

import { setUiVersion, setUiVersionWebSocket } from "../webSocket.slice";
import type { MessageHandler } from "../webSocket.types";
import WsMessage from "../WsMessage";

// Handles the "init" message
export const handleUserInit: MessageHandler = ({ message, ws }) => {
  if (
    typeof message.data["message"] === "string" &&
    message.data["message"].toLowerCase().includes("connection established")
  ) {
    const reply = new WsMessage("init", { requestServerVersion: true });
    ws.send(reply.toString());
  }
  return { ok: true };
};

// Handles the "version" message
export const handleUserUiVersion: MessageHandler = ({ message, store }) => {
  const start =
    typeof message.data["start"] === "boolean"
      ? message.data["start"]
      : undefined;
  const version =
    typeof message.data["version"] === "string" ? message.data["version"] : "";
  if (start) {
    store.dispatch(setUiVersionWebSocket(true));
  } else if (start === false) {
    store.dispatch(setUiVersionWebSocket(false));
  }
  if (version) {
    store.dispatch(setUiVersion({ version, lastReceived: DateTime.utc() }));
  }
  return { ok: true };
};

// Handles the "ack" message
export const handleAck: MessageHandler = () => {
  return { ok: true };
};

// Handles the "error" message
export const handleUserError: MessageHandler = ({ message }) => {
  const errorMessage =
    typeof message.data["message"] === "string"
      ? message.data["message"]
      : "Unknown error from the WebSocket server";
  return {
    ok: false,
    error: new Error(errorMessage),
  };
};
