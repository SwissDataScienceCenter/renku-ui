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

import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import {
  BUILDER_FRONTEND_COMBINATIONS,
  getCompatibleFrontends,
} from "./session.constants";
import {
  getFormattedEnvironmentValues,
  getLauncherApiType,
  getLauncherCategory,
  getLauncherChangeEffectMessage,
  getNewLauncherFormDefaultValues,
  isAppLauncher,
  isJobLauncher,
  sessionLauncherKindToCategory,
  showsSessionLauncherFields,
} from "./session.utils";
import { SESSION_LAUNCHER_KIND } from "./sessionsV2.types";
import type {
  LauncherApiType,
  LauncherCategory,
  SessionLauncherForm,
} from "./sessionsV2.types";

function makeLauncher(launcherType: LauncherApiType): SessionLauncher {
  return { launcher_type: launcherType } as SessionLauncher;
}

function makeCustomBuildForm(
  overrides: Partial<SessionLauncherForm> = {},
): SessionLauncherForm {
  return {
    environmentSelect: "custom + build",
    builder_variant: "python",
    frontend_variant: "custom",
    repository: "https://example.com/owner/repo.git",
    platform: "linux/amd64",
    ...overrides,
  } as SessionLauncherForm;
}

describe("sessionLauncherKindToCategory()", () => {
  it("maps the app kind to the app category", () => {
    expect(sessionLauncherKindToCategory(SESSION_LAUNCHER_KIND.APP)).toBe(
      "app",
    );
  });

  it("maps the non-interactive kind to the job category", () => {
    expect(
      sessionLauncherKindToCategory(SESSION_LAUNCHER_KIND.NON_INTERACTIVE),
    ).toBe("job");
  });

  it("maps the interactive kind to the session category", () => {
    expect(
      sessionLauncherKindToCategory(SESSION_LAUNCHER_KIND.INTERACTIVE),
    ).toBe("session");
  });
});

describe("isAppLauncher() / isJobLauncher()", () => {
  it("identifies an app launcher", () => {
    const launcher = makeLauncher(SESSION_LAUNCHER_KIND.APP);
    expect(isAppLauncher(launcher)).toBe(true);
    expect(isJobLauncher(launcher)).toBe(false);
    expect(getLauncherCategory(launcher)).toBe("app");
  });

  it("does not treat interactive/job launchers as apps", () => {
    expect(isAppLauncher(makeLauncher(SESSION_LAUNCHER_KIND.INTERACTIVE))).toBe(
      false,
    );
    expect(
      isAppLauncher(makeLauncher(SESSION_LAUNCHER_KIND.NON_INTERACTIVE)),
    ).toBe(false);
  });
});

describe("showsSessionLauncherFields()", () => {
  it("exposes session-style fields for sessions and apps", () => {
    expect(showsSessionLauncherFields("session")).toBe(true);
    expect(showsSessionLauncherFields("app")).toBe(true);
  });

  it("hides session-style fields for jobs", () => {
    expect(showsSessionLauncherFields("job")).toBe(false);
  });
});

describe("custom frontend (bring-your-own app)", () => {
  it("is offered for both python and r builders", () => {
    expect(BUILDER_FRONTEND_COMBINATIONS.python).toContain("custom");
    expect(BUILDER_FRONTEND_COMBINATIONS.r).toContain("custom");
    expect(getCompatibleFrontends("python")).toContain("custom");
    expect(getCompatibleFrontends("r")).toContain("custom");
  });

  it("preserves the custom frontend in the build payload", () => {
    const result = getFormattedEnvironmentValues(makeCustomBuildForm(), "app");
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      environment_image_source: "build",
      builder_variant: "python",
      frontend_variant: "custom",
    });
  });

  it("does not send command/args for a custom app launcher", () => {
    /* eslint-disable spellcheck/spell-checker */
    // Approach (a): the start command comes from the repository Procfile, not
    // from the form, so an app launcher must not serialize command/args.
    /* eslint-enable spellcheck/spell-checker */
    const result = getFormattedEnvironmentValues(
      makeCustomBuildForm({
        command: '["python", "app.py"]',
        args: '["--flag"]',
      }),
      "app",
    );
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("command");
    expect(result.data).not.toHaveProperty("args");
  });
});

describe("getNewLauncherFormDefaultValues() frontend default", () => {
  it("defaults an app launcher to the custom (bring-your-own) frontend", () => {
    expect(
      getNewLauncherFormDefaultValues("custom + build", "app").frontend_variant,
    ).toBe("custom");
  });

  it("keeps the interactive default for session and job launchers", () => {
    expect(
      getNewLauncherFormDefaultValues("custom + build", "session")
        .frontend_variant,
    ).toBe("jupyterlab"); // eslint-disable-line spellcheck/spell-checker
    expect(
      getNewLauncherFormDefaultValues("custom + build", "job").frontend_variant,
    ).toBe("jupyterlab"); // eslint-disable-line spellcheck/spell-checker
  });

  it("defaults to the session frontend when no category is given", () => {
    expect(
      getNewLauncherFormDefaultValues("custom + build").frontend_variant,
    ).toBe("jupyterlab"); // eslint-disable-line spellcheck/spell-checker
  });
});

describe("getLauncherApiType() round-trips the app category", () => {
  it.each<[LauncherCategory, LauncherApiType]>([
    ["app", SESSION_LAUNCHER_KIND.APP],
    ["job", SESSION_LAUNCHER_KIND.NON_INTERACTIVE],
    ["session", SESSION_LAUNCHER_KIND.INTERACTIVE],
  ])("maps %s -> %s and back", (category, apiType) => {
    expect(getLauncherApiType(category)).toBe(apiType);
    expect(sessionLauncherKindToCategory(apiType)).toBe(category);
  });
});

describe("getLauncherChangeEffectMessage()", () => {
  // A launcher has at most one app, so "next time you start a new app" is wrong
  // twice: there is no next one to start, and it reads as "already done" while
  // the live app still serves the old definition.
  it("does not promise app owners a next new app", () => {
    const message = getLauncherChangeEffectMessage("app");

    expect(message).toContain("the next time the app is started");
    expect(message).not.toContain("a new app");
  });

  // The restart is what actually applies the change to a live app, so it has to
  // be spelled out rather than left as "will not be affected".
  it("tells app owners how to apply the change to a running app", () => {
    const message = getLauncherChangeEffectMessage("app");

    expect(message).toContain("currently running");
    expect(message).toContain("stopped and started again");
  });

  it.each<[LauncherCategory, string]>([
    ["session", "the next time you launch a session with this launcher"],
    ["job", "the next time you submit a job with this launcher"],
  ])("tells %s owners the next run picks the change up", (category, phrase) => {
    expect(getLauncherChangeEffectMessage(category)).toContain(phrase);
  });

  // Every category has to produce something; a missing case would render the
  // literal "undefined" into a success alert.
  it.each<LauncherCategory>(["app", "job", "session"])(
    "returns a non-empty sentence for %s",
    (category) => {
      expect(getLauncherChangeEffectMessage(category)).toMatch(/\w.*\.$/);
    },
  );
});
