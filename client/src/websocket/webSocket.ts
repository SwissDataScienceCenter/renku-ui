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

import type { StoreType } from "~/store/store";
import { makeDispatcher } from "./messageDispatch";
import { WEBSOCKET_PING_INTERVAL_MILLIS } from "./webSocket.constants";
import {
  setError,
  setLastPing,
  setLastReceived,
  setOpen,
  unsetError,
} from "./webSocket.slice";
import { parseWsServerMessage } from "./websocket.utils";
import WsMessage from "./WsMessage";
import type { WsServerMessage } from "./WsServerMessage";

interface InitializeWebSocketArgs {
  url: string;
  store: StoreType;
  onRetryConnection: () => void;
}

type InitializeWebSocketReturn = {
  /** Cleanup function, to be called when removing the web socket */
  cleanup: () => void;
  ws: WebSocket;
};

/** Initialize the web socket */
// TODO: refactor to use store hooks
export function initializeWebSocket({
  url,
  store,
  onRetryConnection,
}: InitializeWebSocketArgs): InitializeWebSocketReturn {
  const ws = new WebSocket(url);

  //? Internal state to know if this is the active web socket connection
  let isActive: boolean = true;
  function getIsActive() {
    return isActive;
  }

  // Setup listeners
  ws.addEventListener("open", onOpen(ws, store, getIsActive));
  ws.addEventListener("close", onClose(store, getIsActive, onRetryConnection));
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
  const pingFn = pingServer(ws, store, getIsActive);
  const startPullingSessionStatusV2Fn = startPullingSessionStatusV2(
    ws,
    store,
    getIsActive
  );

  return function onOpenInner() {
    if (!getIsActive()) {
      return;
    }

    const isReady = ws.readyState === WebSocket.OPEN;
    if (isReady) {
      store.dispatch(setOpen(true));
      // request session status V2
      startPullingSessionStatusV2Fn();
    }
    // Start a ping loop -- this should keep the connection alive
    if (WEBSOCKET_PING_INTERVAL_MILLIS) {
      const timeout = window.setInterval(
        pingFn,
        WEBSOCKET_PING_INTERVAL_MILLIS
      );
      ws.addEventListener("close", () => {
        window.clearInterval(timeout);
      });
    }
  };
}

function onClose(
  store: StoreType,
  getIsActive: () => boolean,
  onRetryConnection: () => void
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
      onRetryConnection();

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
  const dispatcher = makeDispatcher();

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
        const error_ =
          error instanceof Error ? error : new Error("Unexpected error");
        store.dispatch(
          setError({
            message:
              "Incoming message is not correctly formed: " + error_.message,
            error: error_,
          })
        );
      }
      if (message == null) {
        return;
      }

      const dispatcherResult = dispatcher(message);
      if (!dispatcherResult.ok) {
        store.dispatch(
          setError({
            message: dispatcherResult.error.message,
            error: dispatcherResult.error,
          })
        );
        return;
      }
      const { handler } = dispatcherResult;

      // Execute the command
      try {
        const handlerResult = handler({ message, store, ws });
        if (handlerResult.ok) {
          store.dispatch(unsetError());
        } else {
          store.dispatch(
            setError({
              message: handlerResult.error.message,
              error: handlerResult.error,
            })
          );
        }
      } catch (error) {
        const error_ =
          error instanceof Error ? error : new Error("unknown error");
        store.dispatch(
          setError({
            message: `Error while executing the ${
              message.type
            } command: ${error_.toString()}`,
            error: error_,
          })
        );
      }

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

function startPullingSessionStatusV2(
  ws: WebSocket,
  store: StoreType,
  getIsActive: () => boolean
): () => void {
  return function inner() {
    if (!getIsActive()) {
      return;
    }
    const { open } = select(store, ({ webSocket }) => webSocket);
    if (open && ws.readyState === WebSocket.OPEN) {
      const startPullingMessage = new WsMessage("pullSessionStatusV2", {});
      ws.send(startPullingMessage.toString());
    }
  };
}

function select<T>(
  store: StoreType,
  selector: (state: ReturnType<StoreType["getState"]>) => T
): T {
  return selector(store.getState());
}
