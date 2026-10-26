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
  appLobbyTotalBudgetMs,
  createAppLobbyReducer,
  DEFAULT_APP_LOBBY_CONFIG,
  INITIAL_APP_LOBBY_STATE,
  isAppLobbyBusy,
} from "./appLobby.utils";

const { maxAttempts, probeTimeoutMs, retryDelayMs } = DEFAULT_APP_LOBBY_CONFIG;

const appLobbyReducer = createAppLobbyReducer(DEFAULT_APP_LOBBY_CONFIG);

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

  it("spends exactly maxAttempts probes before giving up", () => {
    const onFinalAttempt = reduceAll(
      INITIAL_APP_LOBBY_STATE,
      Array.from({ length: maxAttempts - 1 }, () => FAIL_THEN_RETRY).flat(),
    );
    expect(onFinalAttempt).toEqual({
      status: "probing",
      attempt: maxAttempts,
    });

    expect(appLobbyReducer(onFinalAttempt, { type: "probe-failed" })).toEqual({
      status: "exhausted",
      attempt: maxAttempts,
    });
  });

  it("honors a deployment-configured attempt budget", () => {
    const reducer = createAppLobbyReducer({
      ...DEFAULT_APP_LOBBY_CONFIG,
      maxAttempts: 2,
    });

    const onFinalAttempt = FAIL_THEN_RETRY.reduce(
      reducer,
      INITIAL_APP_LOBBY_STATE,
    );
    expect(onFinalAttempt).toEqual({ status: "probing", attempt: 2 });

    expect(reducer(onFinalAttempt, { type: "probe-failed" })).toEqual({
      status: "exhausted",
      attempt: 2,
    });
  });

  it("gives up after a single probe when the budget is one attempt", () => {
    const reducer = createAppLobbyReducer({
      ...DEFAULT_APP_LOBBY_CONFIG,
      maxAttempts: 1,
    });

    expect(reducer(INITIAL_APP_LOBBY_STATE, { type: "probe-failed" })).toEqual({
      status: "exhausted",
      attempt: 1,
    });
  });

  it("restores the full budget on a manual retry", () => {
    const exhausted: AppLobbyState = {
      status: "exhausted",
      attempt: maxAttempts,
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
  const defaultBudgetMs = appLobbyTotalBudgetMs(DEFAULT_APP_LOBBY_CONFIG);

  it("gives up between five and six minutes after the first probe", () => {
    expect(defaultBudgetMs).toBeGreaterThanOrEqual(5 * 60_000);
    expect(defaultBudgetMs).toBeLessThanOrEqual(6 * 60_000);
  });

  it("derives the budget from every probe and every pause between them", () => {
    expect(defaultBudgetMs).toBe(
      maxAttempts * probeTimeoutMs + (maxAttempts - 1) * retryDelayMs,
    );
  });

  it("charges no backoff for a single-attempt budget", () => {
    expect(
      appLobbyTotalBudgetMs({
        maxAttempts: 1,
        probeTimeoutMs: 10_000,
        retryDelayMs: 5_000,
      }),
    ).toBe(10_000);
  });

  it("keeps a single probe under the shortest timeout on the path", () => {
    expect(probeTimeoutMs).toBeLessThan(60_000);
  });

  it("pauses long enough that a failing URL cannot spin the budget away", () => {
    expect(retryDelayMs).toBeGreaterThanOrEqual(1_000);
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
