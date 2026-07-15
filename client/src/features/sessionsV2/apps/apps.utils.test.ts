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

import type { AppResponse, AppStatus } from "../api/apps.api";
import {
  findAppForLauncher,
  getAppIndicatorState,
  hasAppOnAnotherLauncher,
  hasPendingApp,
  hasReachedAppTarget,
  toSecureAppUrl,
} from "./apps.utils";

function makeApp(overrides: Partial<AppResponse> = {}): AppResponse {
  return {
    name: "my-app",
    launcher_id: "01AN4Z79ZS5XN0F25N3DB94T4R",
    project_id: "01BN4Z79ZS5XN0F25N3DB94T4R",
    status: "ready",
    url: "https://apps.example.com/my-app",
    started: "2026-07-01T10:00:00Z",
    image: "registry.example.com/my-app:latest",
    ...overrides,
  };
}

describe("findAppForLauncher()", () => {
  const appA = makeApp({ name: "a", launcher_id: "launcher-a" });
  const appB = makeApp({ name: "b", launcher_id: "launcher-b" });

  it("returns the app matching the launcher id", () => {
    expect(findAppForLauncher([appA, appB], "launcher-b")).toBe(appB);
  });

  it("returns undefined when no app matches", () => {
    expect(findAppForLauncher([appA, appB], "launcher-c")).toBeUndefined();
  });

  it("returns undefined when the app list is undefined", () => {
    expect(findAppForLauncher(undefined, "launcher-a")).toBeUndefined();
  });

  it("returns undefined for an empty app list", () => {
    expect(findAppForLauncher([], "launcher-a")).toBeUndefined();
  });
});

describe("getAppIndicatorState()", () => {
  it("reports 'not-running' when there is no app", () => {
    expect(getAppIndicatorState(undefined)).toBe("not-running");
  });

  it.each<[AppStatus, string]>([
    ["pending", "starting"],
    ["ready", "live"],
    ["failed", "error"],
    ["hibernated", "not-running"],
  ])("maps a %s app to '%s'", (status, expected) => {
    expect(getAppIndicatorState(makeApp({ status }))).toBe(expected);
  });

  it("collapses a platform-hibernated app to 'not-running' (no resume in the UI)", () => {
    expect(getAppIndicatorState(makeApp({ status: "hibernated" }))).toBe(
      "not-running",
    );
  });

  it("forces 'starting' while a publish is in flight, even before the app appears", () => {
    expect(getAppIndicatorState(undefined, { isStarting: true })).toBe(
      "starting",
    );
  });

  it("lets an in-flight publish override a stale observed status", () => {
    // isStarting reflects the caller's intent and takes precedence, so a brief
    // window where the old app is still 'ready'/'failed' does not flicker away
    // from the starting indicator.
    expect(
      getAppIndicatorState(makeApp({ status: "failed" }), { isStarting: true }),
    ).toBe("starting");
  });

  it("defaults isStarting to false when no options are passed", () => {
    expect(getAppIndicatorState(makeApp({ status: "ready" }))).toBe("live");
  });
});

describe("hasPendingApp()", () => {
  it("is true when at least one app is pending", () => {
    const apps = [
      makeApp({ name: "a", status: "ready" }),
      makeApp({ name: "b", status: "pending" }),
    ];
    expect(hasPendingApp(apps)).toBe(true);
  });

  it("is false when every app has settled", () => {
    const apps = [
      makeApp({ name: "a", status: "ready" }),
      makeApp({ name: "b", status: "hibernated" }),
      makeApp({ name: "c", status: "failed" }),
    ];
    expect(hasPendingApp(apps)).toBe(false);
  });

  it("is false for an empty list or undefined", () => {
    expect(hasPendingApp([])).toBe(false);
    expect(hasPendingApp(undefined)).toBe(false);
  });
});

describe("hasAppOnAnotherLauncher()", () => {
  it.each<AppStatus>(["pending", "ready", "hibernated", "failed"])(
    "counts a %s app on another launcher (only one app per project)",
    (status) => {
      const apps = [makeApp({ launcher_id: "other", status })];
      expect(hasAppOnAnotherLauncher(apps, "self")).toBe(true);
    },
  );

  it("ignores this launcher's own app, whatever its status", () => {
    for (const status of [
      "pending",
      "ready",
      "hibernated",
      "failed",
    ] as AppStatus[]) {
      const apps = [makeApp({ launcher_id: "self", status })];
      expect(hasAppOnAnotherLauncher(apps, "self")).toBe(false);
    }
  });

  it("is false for an empty list or undefined", () => {
    expect(hasAppOnAnotherLauncher([], "self")).toBe(false);
    expect(hasAppOnAnotherLauncher(undefined, "self")).toBe(false);
  });
});

describe("hasReachedAppTarget()", () => {
  describe("status target", () => {
    const target = { desiredStatus: ["ready", "failed"] as AppStatus[] };

    it("is reached when the app holds one of the desired statuses", () => {
      expect(hasReachedAppTarget(makeApp({ status: "ready" }), target)).toBe(
        true,
      );
      expect(hasReachedAppTarget(makeApp({ status: "failed" }), target)).toBe(
        true,
      );
    });

    it("is not reached while the app holds another status", () => {
      expect(hasReachedAppTarget(makeApp({ status: "pending" }), target)).toBe(
        false,
      );
      expect(
        hasReachedAppTarget(makeApp({ status: "hibernated" }), target),
      ).toBe(false);
    });

    it("is not reached when the app is absent (e.g. publish not registered yet)", () => {
      expect(hasReachedAppTarget(undefined, target)).toBe(false);
    });
  });

  describe("deletion target", () => {
    const target = { deletion: true as const };

    it("is reached only once the app is gone", () => {
      expect(hasReachedAppTarget(undefined, target)).toBe(true);
    });

    it("is not reached while the app is still present, whatever its status", () => {
      for (const status of [
        "pending",
        "ready",
        "failed",
        "hibernated",
      ] as AppStatus[]) {
        expect(hasReachedAppTarget(makeApp({ status }), target)).toBe(false);
      }
    });
  });
});

describe("toSecureAppUrl()", () => {
  it("upgrades an http scheme to https", () => {
    expect(toSecureAppUrl("http://app.renkulab.io/foo")).toBe(
      "https://app.renkulab.io/foo",
    );
  });

  it("upgrades the scheme case-insensitively", () => {
    expect(toSecureAppUrl("HTTP://app.renkulab.io")).toBe(
      "https://app.renkulab.io",
    );
  });

  it("leaves an https URL unchanged", () => {
    expect(toSecureAppUrl("https://app.renkulab.io")).toBe(
      "https://app.renkulab.io",
    );
  });

  it("only rewrites the leading scheme, not http elsewhere in the URL", () => {
    expect(toSecureAppUrl("https://app.renkulab.io/?next=http://x")).toBe(
      "https://app.renkulab.io/?next=http://x",
    );
  });

  it("passes values without a scheme through unchanged", () => {
    expect(toSecureAppUrl("app.renkulab.io/foo")).toBe("app.renkulab.io/foo");
  });
});
