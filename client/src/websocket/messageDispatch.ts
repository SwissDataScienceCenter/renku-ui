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

import { handleSessionsStatusV2 } from "./handlers/sessionStatusHandlerV2";
import {
  handleAck,
  handleUserError,
  handleUserInit,
  handleUserUiVersion,
} from "./handlers/userHandlers";
import type { MessageHandler } from "./webSocket.types";
import type { WsServerMessage } from "./WsServerMessage";

// *** Accepted messages ***

interface MessageData {
  required: Array<string> | null;
  optional: Array<string> | null;
  handler: MessageHandler;
}

type MessageHandlersType = Record<
  string,
  Record<string, Array<MessageData> | undefined> | undefined
>;

export const MESSAGE_HANDLERS = {
  user: {
    init: [
      {
        required: null,
        optional: ["message"],
        handler: handleUserInit,
      },
    ],
    version: [
      {
        required: ["version"],
        optional: ["start", "message"],
        handler: handleUserUiVersion,
      },
    ],
    ack: [
      {
        required: null,
        optional: ["message"],
        handler: handleAck,
      },
    ],
    error: [
      {
        required: null,
        optional: ["message"],
        handler: handleUserError,
      },
    ],
    sessionStatusV2: [
      {
        required: null,
        optional: ["message"],
        handler: handleSessionsStatusV2,
      },
    ],
  },
} as const satisfies MessageHandlersType;

type DispatcherReturn =
  | { ok: true; handler: MessageHandler }
  | { ok: false; error: Error };

/** Returns a message dispatcher which uses the rules defined in `acceptedMessages` */
export function makeDispatcher(
  acceptedMessages: MessageHandlersType = MESSAGE_HANDLERS
): (message: WsServerMessage) => DispatcherReturn {
  /**
   * Either get the handler function for the specific client message, or a sentence explaining the error.
   *
   * @param message - message received from the web socket server
   * @returns handler function or error message
   */
  return function (message: WsServerMessage) {
    const acceptedScopeMessages = acceptedMessages[message.scope];
    if (acceptedScopeMessages == null) {
      return {
        ok: false,
        error: new Error(`Scope '${message.scope}' is not supported`),
      };
    }
    const instructions = acceptedScopeMessages[message.type];
    if (instructions == null) {
      return {
        ok: false,
        error: new Error(
          `Type '${message.type}' is not supported for the scope '${message.scope}'`
        ),
      };
    }

    // match proper instruction set for the message type
    const dataProps = Object.keys(message.data);
    for (const instruction of instructions) {
      let valid = true;
      // must have all the required
      if (instruction.required) {
        for (const required of instruction.required) {
          if (!dataProps.includes(required)) {
            valid = false;
            break;
          }
        }
      }
      // can have only required or optional
      if (valid) {
        for (const prop of dataProps) {
          if (
            !instruction.required?.includes(prop) &&
            !instruction.optional?.includes(prop)
          ) {
            valid = false;
            break;
          }
        }
      }

      // stop when found a valid one
      if (valid) {
        return { ok: true, handler: instruction.handler };
      }
    }

    return {
      ok: false,
      error: new Error(
        `Could not find a proper handler; data is wrong for a '${message.type}' instruction`
      ),
    };
  };
}
