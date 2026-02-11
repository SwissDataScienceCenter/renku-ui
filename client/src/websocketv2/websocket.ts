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

import { WEBSOCKET_PING_INTERVAL_MILLIS } from "./webSocket.constants";
import {
  setError,
  setLastPing,
  setLastReceived,
  setOpen,
} from "./webSocket.slice";
import type { StoreType } from "./webSocket.types";
import { parseWsServerMessage } from "./websocket.utils";
import WsMessage from "./WsMessage";
import type { WsServerMessage } from "./WsServerMessage";

interface InitializeWebSocketArgs {
  url: string;
  store: StoreType;
}

type InitializeWebSocketReturn = {
  /** Cleanup function, to be called when removing the web socket */
  cleanup: () => void;
  ws: WebSocket;
};

/** Initialize the web socket */
export function initializeWebSocket({
  url,
  store,
}: InitializeWebSocketArgs): InitializeWebSocketReturn {
  const ws = new WebSocket(url);

  //? Internal state to know if this is the active web socket connection
  let isActive: boolean = true;
  function getIsActive() {
    return isActive;
  }

  // Setup listeners
  ws.addEventListener("open", onOpen(ws, store, getIsActive));
  ws.addEventListener("close", onClose(ws, store, getIsActive));
  ws.addEventListener("error", onError(store, getIsActive));
  ws.addEventListener("message", onMessage(ws, store, getIsActive));

  function cleanup() {
    isActive = false;
    ws.close(1000); // Normal closure code
  }

  return {
    cleanup,
    ws,
  };
}

// start pinging regularly when the connection is open
function onOpen(
  ws: WebSocket,
  store: StoreType,
  getIsActive: () => boolean
): (event: Event) => void {
  return function onOpenInner(_event: Event) {
    if (!getIsActive()) {
      return;
    }

    const isReady = ws.readyState === WebSocket.OPEN;
    if (isReady) {
      store.dispatch(setOpen(true));
      // request session status V2
      // TODO: startPullingSessionStatusV2(webSocket);
    }
    // Start a ping loop -- this should keep the connection alive
    if (WEBSOCKET_PING_INTERVAL_MILLIS) {
      const pingFn = pingServer(ws, store, getIsActive);
      const timeout = window.setInterval(
        pingFn,
        WEBSOCKET_PING_INTERVAL_MILLIS
      );
      console.log(`added interval ${timeout}`);
      ws.addEventListener("close", () => {
        console.log(`removing interval ${timeout}`);
        window.clearInterval(timeout);
      });
    }
  };
}

function onClose(
  ws: WebSocket,
  store: StoreType,
  getIsActive: () => boolean
): (event: CloseEvent) => void {
  return function onCloseInner(event: CloseEvent) {
    if (!getIsActive()) {
      return;
    }

    store.dispatch(setOpen(false));

    // abnormal closure, restart the socket
    if (event.code === 1006 || event.code === 4000) {
      store.dispatch(
        setError({ message: `WebSocket channel error ${event.code}` })
      );

      // TODO: retry connection
    }
  };
}

function onError(
  store: StoreType,
  getIsActive: () => boolean
): (event: Event) => void {
  return function onErrorInner(event: Event) {
    if (!getIsActive()) {
      return;
    }
    store.dispatch(
      setError({
        message: "WebSocket error",
        error: new Error("WebSocket error", { cause: event }),
      })
    );
  };
}

//MessageEvent
function onMessage(
  ws: WebSocket,
  store: StoreType,
  getIsActive: () => boolean
): (event: MessageEvent) => void {
  return function onMessageInner(event: MessageEvent) {
    if (!getIsActive()) {
      return;
    }
    store.dispatch(setLastReceived(DateTime.utc()));

    if (event.type === "message" && event.data) {
      let message: WsServerMessage | null = null;
      try {
        message = parseWsServerMessage(event.data);
      } catch (error) {
        store.dispatch(
          setError({
            message:
              "Incoming message is not correctly formed: " +
              (error instanceof Error ? error.message : "Unexpected error"),
            error: error as any,
          })
        );
      }
      if (message == null) {
        return;
      }

      console.log({ message });

      //   const validatedMessage = validateServerMessage(message);
      //   if ("error" in validatedMessage) {
      //     store.dispatch(
      //       setError({
      //         message: validatedMessage.error,
      //         error: new Error(validatedMessage.error),
      //       })
      //     );
      //   }

      return;
    }

    store.dispatch(
      setError({
        message: `Unexpected message: ${event}`,
        error: new Error("WebSocket unexpected message", { cause: event }),
      })
    );
  };
}

// webSocket.onmessage = (message) => {
//     model.set("lastReceived", new Date());
//     // handle the message
//     if (message.type === "message" && message.data) {
//       // Try to parse the message to a WsServerMessage
//       let serverMessage: WsServerMessage;
//       try {
//         serverMessage = JSON.parse(message.data as string);
//         const res = checkWsServerMessage(serverMessage);
//         if (!res)
//           throw new Error(
//             "WebSocket message is a valid JSON object but not a WsServerMessage"
//           );
//       } catch (error) {
//         model.setObject({
//           error: true,
//           errorObject: {
//             ...(error as Error),
//             message:
//               "Incoming message bad formed: " + (error as Error).toString(),
//           },
//         });
//         return false;
//       }

//       // Validate the message and find the instructions
//       const handler = getWsServerMessageHandler(messageHandlers, serverMessage);

//       if (typeof handler === "string") {
//         model.setObject({
//           error: true,
//           errorObject: { message: `${handler}\nmessage: ${message}` },
//         });
//         return false;
//       }

//       // execute the command
//       try {
//         // ? Mind we are passing the full model, not just model
//         const outcome = handler(
//           serverMessage.data,
//           webSocket,
//           fullModel,
//           getLocation,
//           client
//         );
//         if (outcome && model.get("error")) model.set("error", false);
//         else if (!outcome && !model.get("error")) model.set("error", true);
//       } catch (error) {
//         const info = `Error while executing the '${
//           serverMessage.type
//         }' command: ${(error as Error).toString()}`;
//         model.setObject({
//           error: true,
//           errorObject: {
//             ...(error as Error),
//             message: `${info}\nmessage: ${message}`,
//           },
//         });
//       }
//     } else {
//       model.setObject({
//         error: true,
//         errorObject: { message: `Unexpected message: ${message}` },
//       });
//     }
//   };

function pingServer(
  ws: WebSocket,
  store: StoreType,
  getIsActive: () => boolean
): () => void {
  return function pingServerInner() {
    if (!getIsActive()) {
      return;
    }
    const { open } = select(store, ({ webSocket }) => webSocket);
    if (open && ws.readyState === WebSocket.OPEN) {
      const pingMessage = new WsMessage("ping", {});
      ws.send(pingMessage.toString());
      store.dispatch(setLastPing(pingMessage.timestamp));
    }
  };
}

function select<T>(
  store: StoreType,
  selector: (state: ReturnType<StoreType["getState"]>) => T
): T {
  return selector(store.getState());
}
