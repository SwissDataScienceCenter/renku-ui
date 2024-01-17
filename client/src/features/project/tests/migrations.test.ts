/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { MigrationStatus, RenkuMigrationLevel } from "../Project";
import { ProjectMigrationLevel } from "../projectEnums";
import {
  cleanVersion,
  getCompareUrl,
  getMigrationLevel,
  getReleaseUrl,
  getRenkuLevel,
  getTemplateLevel,
} from "../utils/migrations";

import * as jsonObjects from "./ProjectSettings.testData.json";

type ProjectMigrationLevelKeys = keyof typeof ProjectMigrationLevel;

describe("Test helper functions", () => {
  it("Test cleanVersion", () => {
    expect(cleanVersion("2.3.0")).toBe("2.3.0");
    expect(cleanVersion("2.3.0.dev22+g1262f766")).toBe("2.3.0-dev");
    expect(cleanVersion("2.3.0rc5")).toBe("2.3.0rc5"); // eslint-disable-line spellcheck/spell-checker
    expect(cleanVersion("2.3.0rc5", true)).toBe("2.3.0"); // eslint-disable-line spellcheck/spell-checker
  });

  it("Test getReleaseUrl", () => {
    expect(getReleaseUrl("2.3.0.dev22+g1262f766")).toBe(null);
    expect(getReleaseUrl("2.3.0")).not.toBe("2.3.0");
    expect(getReleaseUrl("2.3.0")).toContain("tag/v2.3.0");
  });

  it("Test getCompareUrl", () => {
    expect(getCompareUrl("2.3.0.dev22+g1262f766", "2.4.0")).toBe(null);
    expect(getCompareUrl("2.3.0", "2.4.0.dev22+g1262f766")).toBe(null);
    expect(getCompareUrl("2.3.0", "2.3.0")).toBe(null);
    expect(getCompareUrl("2.3.0", "2.4.0")).not.toBe("2.3.0");
    expect(getCompareUrl("2.3.0", "2.4.0")).toContain(
      "compare/v2.3.0...v2.4.0"
    );
  });
});

describe("Test migration level functions", () => {
  it("Test getMigrationLevel", () => {
    jsonObjects.results.forEach((object) => {
      const backendAvailable =
        object.expectedResult.level === "Level5" ? false : true;
      const level = getMigrationLevel(
        object.data as MigrationStatus,
        backendAvailable
      );
      const expectedLevel =
        ProjectMigrationLevel[
          object.expectedResult.level as ProjectMigrationLevelKeys
        ];
      expect(level).toBe(expectedLevel);
    });
  });

  it("Test getRenkuLevel", () => {
    jsonObjects.results.forEach((object) => {
      const backendAvailable =
        object.expectedResult.level === "Level5" ? false : true;
      const computedLevel = getRenkuLevel(
        object.data as MigrationStatus,
        backendAvailable
      );
      const expectedLevel = object.expectedResult
        .renku as unknown as RenkuMigrationLevel;
      const expectedLevelInverse =
        ProjectMigrationLevel[
          expectedLevel.level as unknown as ProjectMigrationLevelKeys
        ];
      expect(expectedLevel.automated).toBe(computedLevel?.automated);
      expect(expectedLevelInverse).toBe(computedLevel?.level);
    });
  });

  it("Test getTemplateLevel", () => {
    jsonObjects.results.forEach((object) => {
      const computedLevel = getTemplateLevel(object.data as MigrationStatus);
      const expectedLevel = object.expectedResult
        .template as unknown as RenkuMigrationLevel;
      const expectedLevelInverse =
        ProjectMigrationLevel[
          expectedLevel.level as unknown as ProjectMigrationLevelKeys
        ];
      expect(expectedLevel.automated).toBe(computedLevel?.automated);
      expect(expectedLevelInverse).toBe(computedLevel?.level);
    });
  });
});
