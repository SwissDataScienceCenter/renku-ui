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

export const APP_LOBBY_PROBE_TIMEOUT_MS = 45_000;

export const APP_LOBBY_RETRY_DELAY_MS = 2_000;

export const APP_LOBBY_MAX_ATTEMPTS = 7;

export const APP_LOBBY_TOTAL_BUDGET_MS =
  APP_LOBBY_MAX_ATTEMPTS * APP_LOBBY_PROBE_TIMEOUT_MS +
  (APP_LOBBY_MAX_ATTEMPTS - 1) * APP_LOBBY_RETRY_DELAY_MS;

export type AppLobbyStatus = "probing" | "waiting" | "ready" | "exhausted";

export interface AppLobbyState {
  status: AppLobbyStatus;
  attempt: number;
}

export type AppLobbyEvent =
  | { type: "probe-succeeded" }
  | { type: "probe-failed" }
  | { type: "retry-delay-elapsed" }
  | { type: "manual-retry-requested" };

export const INITIAL_APP_LOBBY_STATE: AppLobbyState = {
  status: "probing",
  attempt: 1,
};

export function appLobbyReducer(
  state: AppLobbyState,
  event: AppLobbyEvent,
): AppLobbyState {
  switch (state.status) {
    case "probing":
      if (event.type === "probe-succeeded") {
        return { status: "ready", attempt: state.attempt };
      }
      if (event.type === "probe-failed") {
        return state.attempt >= APP_LOBBY_MAX_ATTEMPTS
          ? { status: "exhausted", attempt: state.attempt }
          : { status: "waiting", attempt: state.attempt };
      }
      return state;

    case "waiting":
      if (event.type === "retry-delay-elapsed") {
        return { status: "probing", attempt: state.attempt + 1 };
      }
      return state;

    case "exhausted":
      return event.type === "manual-retry-requested"
        ? INITIAL_APP_LOBBY_STATE
        : state;

    case "ready":
      return state;
  }
}

export function isAppLobbyBusy(state: AppLobbyState): boolean {
  return state.status === "probing" || state.status === "waiting";
}
