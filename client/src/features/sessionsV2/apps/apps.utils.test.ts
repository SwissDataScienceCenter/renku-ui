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
  getAppLobbyPath,
  getAppLobbyUrl,
  getAppTransition,
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

describe("getAppTransition()", () => {
  it("returns null when no app exists and nothing is in flight", () => {
    expect(getAppTransition(undefined)).toBeNull();
  });

  it("returns null for a settled app", () => {
    expect(getAppTransition(makeApp({ status: "ready" }))).toBeNull();
    expect(getAppTransition(makeApp({ status: "failed" }))).toBeNull();
  });

  it("reports starting for a pending app with no local mutation", () => {
    expect(getAppTransition(makeApp({ status: "pending" }))).toBe("starting");
  });

  it("reports starting before the deployment appears", () => {
    expect(getAppTransition(undefined, { isStarting: true })).toBe("starting");
  });

  it("reports stopping while a delete is in flight", () => {
    expect(
      getAppTransition(makeApp({ status: "ready" }), { isStopping: true }),
    ).toBe("stopping");
  });

  it("reports stopping once the app is already gone", () => {
    expect(getAppTransition(undefined, { isStopping: true })).toBe("stopping");
  });

  it("prefers stopping over a pending status, which a teardown also produces", () => {
    expect(
      getAppTransition(makeApp({ status: "pending" }), { isStopping: true }),
    ).toBe("stopping");
  });

  it("prefers stopping when both flags are set", () => {
    expect(
      getAppTransition(undefined, { isStarting: true, isStopping: true }),
    ).toBe("stopping");
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
      makeApp({ name: "b", status: "failed" }),
    ];
    expect(hasPendingApp(apps)).toBe(false);
  });

  it("is false for an empty list or undefined", () => {
    expect(hasPendingApp([])).toBe(false);
    expect(hasPendingApp(undefined)).toBe(false);
  });
});

describe("hasAppOnAnotherLauncher()", () => {
  it.each<AppStatus>(["pending", "ready", "failed"])(
    "counts a %s app on another launcher (only one app per project)",
    (status) => {
      const apps = [makeApp({ launcher_id: "other", status })];
      expect(hasAppOnAnotherLauncher(apps, "self")).toBe(true);
    },
  );

  it("ignores this launcher's own app, whatever its status", () => {
    for (const status of ["pending", "ready", "failed"] as AppStatus[]) {
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
      for (const status of ["pending", "ready", "failed"] as AppStatus[]) {
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

describe("getAppLobbyPath()", () => {
  const location = {
    namespace: "my-group",
    slug: "my-project",
    launcherId: "01AN4Z79ZS5XN0F25N3DB94T4R",
  };

  it("addresses the lobby by launcher, not by app", () => {
    expect(getAppLobbyPath(location)).toBe(
      "/p/my-group/my-project/apps/01AN4Z79ZS5XN0F25N3DB94T4R",
    );
  });

  it("does not depend on an app existing", () => {
    expect(getAppLobbyPath({ ...location, launcherId: "other" })).toBe(
      "/p/my-group/my-project/apps/other",
    );
  });
});

describe("getAppLobbyUrl()", () => {
  const location = {
    namespace: "my-group",
    slug: "my-project",
    launcherId: "01AN4Z79ZS5XN0F25N3DB94T4R",
  };

  it("prefixes the lobby path with the given origin", () => {
    expect(getAppLobbyUrl({ ...location, origin: "https://renkulab.io" })).toBe(
      "https://renkulab.io/p/my-group/my-project/apps/01AN4Z79ZS5XN0F25N3DB94T4R",
    );
  });

  it("does not double the separator when the origin has a trailing slash", () => {
    expect(
      getAppLobbyUrl({ ...location, origin: "https://renkulab.io/" }),
    ).toBe(
      "https://renkulab.io/p/my-group/my-project/apps/01AN4Z79ZS5XN0F25N3DB94T4R",
    );
  });

  it("keeps a port and a non-default scheme intact", () => {
    expect(
      getAppLobbyUrl({ ...location, origin: "http://localhost:3000" }),
    ).toBe(
      "http://localhost:3000/p/my-group/my-project/apps/01AN4Z79ZS5XN0F25N3DB94T4R",
    );
  });
});
