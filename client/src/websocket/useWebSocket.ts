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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { StoreType } from "~/store/store";
import type { AppParams } from "~/utils/context/appParams.types";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import useAppSelector from "~/utils/customHooks/useAppSelector.hook";
import { initializeWebSocket } from "./webSocket";
import {
  RECONNECT_INTERVAL_MILLIS,
  RECONNECT_PENALTY_FACTOR,
} from "./webSocket.constants";
import { setReconnect } from "./webSocket.slice";
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
  // TODO: refactor to use store hooks
  const { reconnect: reconnectState } = useAppSelector(
    ({ webSocket }) => webSocket
  );
  const dispatch = useAppDispatch();

  const [wsId, setWsId] = useState<string>(`ws-${Date.now().toString()}`);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const setWsIdRef = useRef<typeof setWsId | null>(setWsId);

  const onRetryConnection = useCallback(() => {
    let { attempts } = reconnectState;
    // reset timer after 1 hour
    const oneHourAgo = DateTime.utc().minus({ hours: 1 });
    if (
      reconnectState.lastTime != null &&
      reconnectState.lastTime < oneHourAgo
    ) {
      attempts = 0;
    }
    attempts++;
    dispatch(
      setReconnect({ attempts, retrying: true, lastTime: DateTime.utc() })
    );
    const delay =
      RECONNECT_PENALTY_FACTOR ** attempts * RECONNECT_INTERVAL_MILLIS;
    window.setTimeout(() => {
      if (setWsIdRef.current) {
        const setWsId = setWsIdRef.current;
        setWsId(`ws-${Date.now().toString()}`);
      }
    }, delay);
  }, [dispatch, reconnectState]);

  const webSocketUrl = useMemo(() => getWebSocketUrl({ params }), [params]);

  // Initialize the web socket
  useEffect(() => {
    if (webSocketUrl == null) {
      return;
    }

    const { cleanup, ws } = initializeWebSocket({
      url: webSocketUrl,
      store,
      onRetryConnection,
    });

    setWs(ws);

    return () => {
      cleanup();
    };
  }, [onRetryConnection, store, webSocketUrl, wsId]);

  // Ref cleanup
  useEffect(() => {
    return () => {
      setWsIdRef.current = null;
    };
  }, []);

  return ws;
}
