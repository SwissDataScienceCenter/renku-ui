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

export const DEFAULT_APP_LOBBY_CONFIG: AppLobbyConfig = {
  maxAttempts: 7,
  probeTimeoutMs: 45_000,
  retryDelayMs: 2_000,
};

export const APP_LOBBY_CONFIG_BOUNDS = {
  maxAttempts: { min: 1, max: 100 },
  probeTimeoutMs: { min: 1_000, max: 300_000 },
  retryDelayMs: { min: 0, max: 60_000 },
} as const;

export const INITIAL_APP_LOBBY_STATE: AppLobbyState = {
  status: "probing",
  attempt: 1,
};

export interface AppLobbyConfig {
  maxAttempts: number;
  probeTimeoutMs: number;
  retryDelayMs: number;
}

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

export type AppLobbyReducer = (
  state: AppLobbyState,
  event: AppLobbyEvent,
) => AppLobbyState;

export function appLobbyTotalBudgetMs({
  maxAttempts,
  probeTimeoutMs,
  retryDelayMs,
}: AppLobbyConfig): number {
  return maxAttempts * probeTimeoutMs + (maxAttempts - 1) * retryDelayMs;
}

export function createAppLobbyReducer({
  maxAttempts,
}: AppLobbyConfig): AppLobbyReducer {
  return function appLobbyReducer(state, event) {
    switch (state.status) {
      case "probing":
        if (event.type === "probe-succeeded") {
          return { status: "ready", attempt: state.attempt };
        }
        if (event.type === "probe-failed") {
          return state.attempt >= maxAttempts
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
  };
}

export function isAppLobbyBusy(state: AppLobbyState): boolean {
  return state.status === "probing" || state.status === "waiting";
}
