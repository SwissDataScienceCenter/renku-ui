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

import { useCallback, useEffect, useReducer } from "react";

import type { AppLobbyState } from "./appLobby.utils";
import {
  APP_LOBBY_PROBE_TIMEOUT_MS,
  APP_LOBBY_RETRY_DELAY_MS,
  appLobbyReducer,
  INITIAL_APP_LOBBY_STATE,
} from "./appLobby.utils";

interface UseAppLobbyArgs {
  /** The app's public URL, already forced onto https. */
  appUrl: string | undefined;
  /**
   * Hold the probe off until the caller knows there is an app worth waking
   * (e.g. while the /apps query is still loading).
   */
  enabled?: boolean;
}

interface UseAppLobbyResult {
  state: AppLobbyState;
  /** Restart the sequence with a fresh retry budget. */
  retry: () => void;
}

/**
 * Wake an app and wait for it to answer.
 *
 * The probe is a plain request to the app's own URL. That single request does
 * two jobs: it is the inbound traffic Knative needs to scale the service from
 * zero, and its outcome is our only evidence that the app is serving.
 *
 * It is sent with `mode: "no-cors"` because the app is on a different origin
 * and will not send CORS headers for us. The consequence is an *opaque*
 * response: status, headers and body are all unreadable, so a 502 from a
 * half-started pod is indistinguishable from a 200. The probe therefore only
 * tells us the app can be reached; it is not a health check. That is acceptable
 * here, because the failure it needs to catch — nothing is listening yet — does
 * not produce a response at all.
 *
 * The sequencing lives in appLobbyReducer; this hook only supplies the two
 * side effects that reducer cannot: issuing the request and running the timer
 * between probes.
 */
export default function useAppLobby({
  appUrl,
  enabled = true,
}: UseAppLobbyArgs): UseAppLobbyResult {
  const [state, dispatch] = useReducer(
    appLobbyReducer,
    INITIAL_APP_LOBBY_STATE,
  );

  const isProbing = state.status === "probing";
  const isWaiting = state.status === "waiting";
  const { attempt } = state;

  // Issue one probe per attempt. Keying the effect on `attempt` as well as the
  // status is what makes a retry re-run it: the status is "probing" both before
  // and after a retry, so the attempt number is the only thing that changes.
  useEffect(() => {
    if (!enabled || !isProbing || appUrl == null) {
      return;
    }

    const controller = new AbortController();
    // A cold start hangs rather than failing, so the timeout — not an error —
    // is what normally ends an unsuccessful probe.
    const timeoutId = setTimeout(
      () => controller.abort(),
      APP_LOBBY_PROBE_TIMEOUT_MS,
    );
    let isCurrent = true;

    // `cache: "no-store"` keeps a cached response from answering for a service
    // that is no longer up, which would report ready for an app that is not.
    // Credentials are included so the probe traverses the same auth path as the
    // navigation that follows it.
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
        // Includes the abort we trigger on timeout. The reducer ignores results
        // that arrive after the machine has moved on, but the isCurrent guard
        // also keeps us from dispatching after unmount.
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
  }, [appUrl, attempt, enabled, isProbing]);

  // Pause between probes. The delay is flat, so unlike the probe effect this
  // one does not need to key on `attempt`: entering "waiting" again after a
  // retry is itself a change of isWaiting, which re-runs it.
  useEffect(() => {
    if (!enabled || !isWaiting) {
      return;
    }

    const timerId = setTimeout(
      () => dispatch({ type: "retry-delay-elapsed" }),
      APP_LOBBY_RETRY_DELAY_MS,
    );

    return () => {
      clearTimeout(timerId);
    };
  }, [enabled, isWaiting]);

  const retry = useCallback(() => {
    dispatch({ type: "manual-retry-requested" });
  }, []);

  return { state, retry };
}
