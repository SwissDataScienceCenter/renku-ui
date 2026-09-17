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

import { useCallback, useEffect, useMemo, useReducer } from "react";

import type { AppLobbyState } from "./appLobby.utils";
import {
  createAppLobbyReducer,
  INITIAL_APP_LOBBY_STATE,
} from "./appLobby.utils";
import useAppLobbyConfig from "./useAppLobbyConfig.hook";

interface UseAppLobbyArgs {
  appUrl: string | undefined;
  enabled?: boolean;
}

interface UseAppLobbyResult {
  state: AppLobbyState;
  retry: () => void;
}

export default function useAppLobby({
  appUrl,
  enabled = true,
}: UseAppLobbyArgs): UseAppLobbyResult {
  const config = useAppLobbyConfig();
  const { probeTimeoutMs, retryDelayMs } = config;

  const reducer = useMemo(() => createAppLobbyReducer(config), [config]);
  const [state, dispatch] = useReducer(reducer, INITIAL_APP_LOBBY_STATE);

  const isProbing = state.status === "probing";
  const isWaiting = state.status === "waiting";
  const { attempt } = state;

  useEffect(() => {
    if (!enabled || !isProbing || appUrl == null) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), probeTimeoutMs);
    let isCurrent = true;

    fetch(appUrl, {
      mode: "no-cors",
      cache: "no-store",
      credentials: "include",
      redirect: "follow",
      signal: controller.signal,
    })
      .then(() => {
        if (isCurrent) {
          dispatch({ type: "probe-succeeded" });
        }
      })
      .catch(() => {
        if (isCurrent) {
          dispatch({ type: "probe-failed" });
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isCurrent = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [appUrl, attempt, enabled, isProbing, probeTimeoutMs]);

  useEffect(() => {
    if (!enabled || !isWaiting) {
      return;
    }

    const timerId = setTimeout(
      () => dispatch({ type: "retry-delay-elapsed" }),
      retryDelayMs,
    );

    return () => {
      clearTimeout(timerId);
    };
  }, [enabled, isWaiting, retryDelayMs]);

  const retry = useCallback(() => {
    dispatch({ type: "manual-retry-requested" });
  }, []);

  return { state, retry };
}
