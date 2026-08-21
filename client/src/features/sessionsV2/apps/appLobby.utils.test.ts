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

import { describe, expect, it } from "vitest";

import type { AppLobbyEvent, AppLobbyState } from "./appLobby.utils";
import {
  APP_LOBBY_MAX_ATTEMPTS,
  APP_LOBBY_PROBE_TIMEOUT_MS,
  APP_LOBBY_RETRY_DELAY_MS,
  APP_LOBBY_TOTAL_BUDGET_MS,
  appLobbyReducer,
  INITIAL_APP_LOBBY_STATE,
  isAppLobbyBusy,
} from "./appLobby.utils";

function reduceAll(
  state: AppLobbyState,
  events: AppLobbyEvent[],
): AppLobbyState {
  return events.reduce(appLobbyReducer, state);
}

const FAIL_THEN_RETRY: AppLobbyEvent[] = [
  { type: "probe-failed" },
  { type: "retry-delay-elapsed" },
];

describe("appLobbyReducer()", () => {
  it("starts by probing, because the first probe is also the wake-up kick", () => {
    expect(INITIAL_APP_LOBBY_STATE).toEqual({ status: "probing", attempt: 1 });
  });

  it("becomes ready when a probe succeeds", () => {
    expect(
      appLobbyReducer(INITIAL_APP_LOBBY_STATE, { type: "probe-succeeded" }),
    ).toEqual({ status: "ready", attempt: 1 });
  });

  it("backs off instead of retrying immediately when a probe fails", () => {
    expect(
      appLobbyReducer(INITIAL_APP_LOBBY_STATE, { type: "probe-failed" }),
    ).toEqual({ status: "waiting", attempt: 1 });
  });

  it("advances the attempt counter once the backoff elapses", () => {
    expect(reduceAll(INITIAL_APP_LOBBY_STATE, FAIL_THEN_RETRY)).toEqual({
      status: "probing",
      attempt: 2,
    });
  });

  it("becomes ready on a probe that succeeds after earlier failures", () => {
    const state = reduceAll(INITIAL_APP_LOBBY_STATE, [
      ...FAIL_THEN_RETRY,
      ...FAIL_THEN_RETRY,
      { type: "probe-succeeded" },
    ]);
    expect(state).toEqual({ status: "ready", attempt: 3 });
  });

  it("spends exactly APP_LOBBY_MAX_ATTEMPTS probes before giving up", () => {
    const onFinalAttempt = reduceAll(
      INITIAL_APP_LOBBY_STATE,
      Array.from(
        { length: APP_LOBBY_MAX_ATTEMPTS - 1 },
        () => FAIL_THEN_RETRY,
      ).flat(),
    );
    expect(onFinalAttempt).toEqual({
      status: "probing",
      attempt: APP_LOBBY_MAX_ATTEMPTS,
    });

    expect(appLobbyReducer(onFinalAttempt, { type: "probe-failed" })).toEqual({
      status: "exhausted",
      attempt: APP_LOBBY_MAX_ATTEMPTS,
    });
  });

  it("restores the full budget on a manual retry", () => {
    const exhausted: AppLobbyState = {
      status: "exhausted",
      attempt: APP_LOBBY_MAX_ATTEMPTS,
    };
    expect(
      appLobbyReducer(exhausted, { type: "manual-retry-requested" }),
    ).toEqual(INITIAL_APP_LOBBY_STATE);
  });

  describe("ignores events that do not apply to the current status", () => {
    it("ignores a late probe result while backing off", () => {
      const waiting: AppLobbyState = { status: "waiting", attempt: 2 };
      expect(appLobbyReducer(waiting, { type: "probe-failed" })).toBe(waiting);
      expect(appLobbyReducer(waiting, { type: "probe-succeeded" })).toBe(
        waiting,
      );
    });

    it("ignores a late probe failure once the lobby is ready", () => {
      const ready: AppLobbyState = { status: "ready", attempt: 3 };
      expect(appLobbyReducer(ready, { type: "probe-failed" })).toBe(ready);
    });

    it("ignores a manual retry while a probe is already in flight", () => {
      expect(
        appLobbyReducer(INITIAL_APP_LOBBY_STATE, {
          type: "manual-retry-requested",
        }),
      ).toBe(INITIAL_APP_LOBBY_STATE);
    });

    it("ignores a stray backoff expiry while probing", () => {
      expect(
        appLobbyReducer(INITIAL_APP_LOBBY_STATE, {
          type: "retry-delay-elapsed",
        }),
      ).toBe(INITIAL_APP_LOBBY_STATE);
    });
  });
});

describe("lobby timing budget", () => {
  it("gives up between five and six minutes after the first probe", () => {
    expect(APP_LOBBY_TOTAL_BUDGET_MS).toBeGreaterThanOrEqual(5 * 60_000);
    expect(APP_LOBBY_TOTAL_BUDGET_MS).toBeLessThanOrEqual(6 * 60_000);
  });

  it("derives the budget from every probe and every pause between them", () => {
    expect(APP_LOBBY_TOTAL_BUDGET_MS).toBe(
      APP_LOBBY_MAX_ATTEMPTS * APP_LOBBY_PROBE_TIMEOUT_MS +
        (APP_LOBBY_MAX_ATTEMPTS - 1) * APP_LOBBY_RETRY_DELAY_MS,
    );
  });

  it("keeps a single probe under the shortest timeout on the path", () => {
    expect(APP_LOBBY_PROBE_TIMEOUT_MS).toBeLessThan(60_000);
  });

  it("pauses long enough that a failing URL cannot spin the budget away", () => {
    expect(APP_LOBBY_RETRY_DELAY_MS).toBeGreaterThanOrEqual(1_000);
  });
});

describe("isAppLobbyBusy()", () => {
  it.each<[AppLobbyState["status"], boolean]>([
    ["probing", true],
    ["waiting", true],
    ["ready", false],
    ["exhausted", false],
  ])("reports %s as busy=%s", (status, expected) => {
    expect(isAppLobbyBusy({ status, attempt: 1 })).toBe(expected);
  });
});
