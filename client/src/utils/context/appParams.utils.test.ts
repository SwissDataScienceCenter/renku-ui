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

import { APP_LOBBY_CONFIG_BOUNDS } from "~/features/sessionsV2/apps/appLobby.utils";
import { DEFAULT_APP_PARAMS } from "./appParams.constants";
import { validatedAppParams } from "./appParams.utils";

const DEFAULT_APP_LOBBY = DEFAULT_APP_PARAMS.APP_LOBBY;

function appLobbyOf(rawAppLobby: unknown) {
  return validatedAppParams({ APP_LOBBY: rawAppLobby }).APP_LOBBY;
}

describe("validatedAppParams(): APP_LOBBY", () => {
  it("falls back to the defaults when the deployment sets nothing", () => {
    expect(validatedAppParams({}).APP_LOBBY).toEqual(DEFAULT_APP_LOBBY);
  });

  it.each([undefined, null, "", "not-json", 7, []])(
    "falls back to the defaults for the non-object value %p",
    (rawAppLobby) => {
      expect(appLobbyOf(rawAppLobby)).toEqual(DEFAULT_APP_LOBBY);
    },
  );

  it("takes the deployment values when they are numbers", () => {
    expect(
      appLobbyOf({ maxAttempts: 3, probeTimeoutMs: 20_000, retryDelayMs: 500 }),
    ).toEqual({ maxAttempts: 3, probeTimeoutMs: 20_000, retryDelayMs: 500 });
  });

  it("parses the strings that Helm renders into the config", () => {
    expect(
      appLobbyOf({
        maxAttempts: "3",
        probeTimeoutMs: "20000",
        retryDelayMs: "500",
      }),
    ).toEqual({ maxAttempts: 3, probeTimeoutMs: 20_000, retryDelayMs: 500 });
  });

  it("falls back per field, so one bad value does not discard the others", () => {
    expect(
      appLobbyOf({
        maxAttempts: 3,
        probeTimeoutMs: "soon",
        retryDelayMs: null,
      }),
    ).toEqual({
      maxAttempts: 3,
      probeTimeoutMs: DEFAULT_APP_LOBBY.probeTimeoutMs,
      retryDelayMs: DEFAULT_APP_LOBBY.retryDelayMs,
    });
  });

  it("clamps a budget that would never let the lobby probe", () => {
    expect(
      appLobbyOf({ maxAttempts: 0, probeTimeoutMs: 1, retryDelayMs: -1 }),
    ).toEqual({
      maxAttempts: APP_LOBBY_CONFIG_BOUNDS.maxAttempts.min,
      probeTimeoutMs: APP_LOBBY_CONFIG_BOUNDS.probeTimeoutMs.min,
      retryDelayMs: APP_LOBBY_CONFIG_BOUNDS.retryDelayMs.min,
    });
  });

  it("clamps a budget that would keep the page probing forever", () => {
    expect(
      appLobbyOf({
        maxAttempts: 10_000,
        probeTimeoutMs: 10_000_000,
        retryDelayMs: 10_000_000,
      }),
    ).toEqual({
      maxAttempts: APP_LOBBY_CONFIG_BOUNDS.maxAttempts.max,
      probeTimeoutMs: APP_LOBBY_CONFIG_BOUNDS.probeTimeoutMs.max,
      retryDelayMs: APP_LOBBY_CONFIG_BOUNDS.retryDelayMs.max,
    });
  });

  it("rounds a fractional attempt count down to a whole probe", () => {
    expect(appLobbyOf({ maxAttempts: 3.9 }).maxAttempts).toBe(3);
  });
});
