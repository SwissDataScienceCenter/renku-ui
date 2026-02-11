import { useEffect, useState } from "react";

import type { AppParams } from "~/utils/context/appParams.types";
import { initializeWebSocket } from "./websocket";
import { StoreType } from "./webSocket.types";
import { getWebSocketUrl } from "./websocket.utils";

interface UseWebSocketArgs {
  params: AppParams;
  store: StoreType;
}

/** Sets up the web socket connection
 *
 * Note that the state handling of this hook means that we
 * maintain one active connection per browser tab,
 * even in development mode (e.g. with telepresence).
 */
export default function useWebSocket({ params, store }: UseWebSocketArgs) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const webSocketUrl = getWebSocketUrl({ params });
    console.log({ webSocketUrl });
    if (webSocketUrl == null) {
      return;
    }
    const { cleanup, ws } = initializeWebSocket({ url: webSocketUrl, store });
    console.log({ ws });

    setWs(ws);

    return () => {
      console.log("cleanup()");
      cleanup();
    };
  }, [params, store]);

  return ws;
}
