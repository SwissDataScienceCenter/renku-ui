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

/**
 * The app lobby's kick-and-wait state machine.
 *
 * Apps run on Knative with min-scale 0, and a scaled-to-zero service still
 * reports Ready, so `AppStatus.ready` does not mean the app will answer a
 * request now. The lobby probes the app directly: the request both wakes the
 * service and tells us when it is answering. The probe is opaque (see
 * useAppLobby), so the only signal is "resolved" versus "failed or timed out".
 *
 * Kept free of React and of fetch so the sequencing can be unit-tested; the
 * effects that issue requests and run timers live in useAppLobby.
 */

/**
 * How long to let a single probe run before treating it as failed.
 *
 * A cold start does not fail fast — Knative's activator holds the request open
 * while it scales up, so a probe is closer to long polling than to sampling.
 * Measured against a scaled-to-zero app on dev.renku.ch (2026-07-29): 13.4 s,
 * returning 200.
 *
 * Timing out ourselves keeps us on the rejection path. A gateway's 504 would
 * arrive as a resolved opaque response indistinguishable from a 200, and we
 * would hand the visitor to an error page.
 */
export const APP_LOBBY_PROBE_TIMEOUT_MS = 45_000;

/**
 * How long to pause between probes.
 *
 * Flat, not exponential: a pause is time with no connection open, so nothing
 * can tell us the app came up, and growing pauses would put the longest blind
 * spots at the end of the wait. The gap exists only to stop a hot loop when a
 * URL rejects in milliseconds (bad DNS, refused connection).
 */
export const APP_LOBBY_RETRY_DELAY_MS = 2_000;

/**
 * How many probes to make before handing control to the user.
 *
 * Derived from the budget and the probe timeout, not chosen. Bounded because a
 * broken app (bad image, crash loop) will never answer, and retrying forever
 * presents that as an indefinite wait.
 */
export const APP_LOBBY_MAX_ATTEMPTS = 7;

/**
 * Total time the lobby waits before escalating to the user.
 *
 * Exported so a test can hold the three constants above to a stated budget:
 * they only mean anything in combination.
 */
export const APP_LOBBY_TOTAL_BUDGET_MS =
  APP_LOBBY_MAX_ATTEMPTS * APP_LOBBY_PROBE_TIMEOUT_MS +
  (APP_LOBBY_MAX_ATTEMPTS - 1) * APP_LOBBY_RETRY_DELAY_MS;

/**
 * Where the lobby is in the wake-up sequence.
 *   - probing   — a request is in flight against the app
 *   - waiting   — pausing between probes
 *   - ready     — the app answered; the visitor can be handed over
 *   - exhausted — the retry budget is spent; offer a manual retry
 */
export type AppLobbyStatus = "probing" | "waiting" | "ready" | "exhausted";

export interface AppLobbyState {
  status: AppLobbyStatus;
  /** 1-based index of the probe that is in flight or has just finished. */
  attempt: number;
}

export type AppLobbyEvent =
  | { type: "probe-succeeded" }
  | { type: "probe-failed" }
  | { type: "retry-delay-elapsed" }
  | { type: "manual-retry-requested" };

/** The lobby starts by probing immediately — the first probe is also the kick. */
export const INITIAL_APP_LOBBY_STATE: AppLobbyState = {
  status: "probing",
  attempt: 1,
};

/**
 * Advance the lobby.
 *
 * Events that do not apply to the current status are ignored. That is
 * load-bearing, not defensive padding: an aborted probe can still settle after
 * the machine has moved on, and a late `probe-failed` must not consume a second
 * attempt or knock a `ready` lobby back into retrying.
 */
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
      // A manual retry restores the full budget rather than granting one extra
      // attempt.
      return event.type === "manual-retry-requested"
        ? INITIAL_APP_LOBBY_STATE
        : state;

    case "ready":
      return state;
  }
}

/**
 * Whether the lobby is still working on its own behalf, as opposed to having
 * settled into a state that needs the user or the caller to act.
 */
export function isAppLobbyBusy(state: AppLobbyState): boolean {
  return state.status === "probing" || state.status === "waiting";
}
