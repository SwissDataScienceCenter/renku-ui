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

import type { PrerequisitesSnapshot } from "./prerequisitesSnapshot.types";
import {
  getNewSnapshotEntries,
  getSnapshotStepCounts,
  mergeSnapshotOnRefresh,
} from "./prerequisitesSnapshot.utils";

const STEP_ORDER = ["review", "repositories", "sessionSecrets"];

describe("mergeSnapshotOnRefresh()", () => {
  it("appends a new item, keeps an omitted id, and updates labels", () => {
    const current: PrerequisitesSnapshot = {
      steps: [
        {
          id: "repositories",
          items: [
            { id: "repo-a", label: "A", detail: "https://a.example/a" },
            { id: "repo-b", label: "B", detail: "https://b.example/b" },
          ],
        },
      ],
    };
    const next: PrerequisitesSnapshot = {
      steps: [
        {
          id: "repositories",
          items: [
            { id: "repo-a", label: "A renamed", detail: "https://a.example/a" },
            { id: "repo-c", label: "C", detail: "https://c.example/c" },
          ],
        },
      ],
    };

    expect(mergeSnapshotOnRefresh(current, next, STEP_ORDER)).toEqual({
      steps: [
        {
          id: "repositories",
          items: [
            { id: "repo-a", label: "A renamed", detail: "https://a.example/a" },
            { id: "repo-b", label: "B", detail: "https://b.example/b" },
            { id: "repo-c", label: "C", detail: "https://c.example/c" },
          ],
        },
      ],
    });
  });

  it("appends a new step in the given order", () => {
    const current: PrerequisitesSnapshot = {
      steps: [{ id: "repositories", items: [{ id: "repo-a", label: "A" }] }],
    };
    const next: PrerequisitesSnapshot = {
      steps: [
        { id: "sessionSecrets", items: [{ id: "secret-1", label: "Token" }] },
        { id: "repositories", items: [{ id: "repo-a", label: "A" }] },
      ],
    };

    expect(
      mergeSnapshotOnRefresh(current, next, STEP_ORDER).steps.map(
        (step) => step.id,
      ),
    ).toEqual(["repositories", "sessionSecrets"]);
  });
});

describe("getNewSnapshotEntries()", () => {
  const openSnapshot: PrerequisitesSnapshot = {
    steps: [{ id: "repositories", items: [{ id: "repo-a", label: "A" }] }],
  };

  it("returns null while fetching", () => {
    expect(
      getNewSnapshotEntries(
        openSnapshot,
        {
          steps: [
            {
              id: "repositories",
              items: [
                { id: "repo-a", label: "A" },
                { id: "repo-b", label: "B" },
              ],
            },
          ],
        },
        true,
      ),
    ).toBeNull();
  });

  it("reports a new item without changing the open snapshot", () => {
    expect(
      getNewSnapshotEntries(
        openSnapshot,
        {
          steps: [
            {
              id: "repositories",
              items: [
                { id: "repo-a", label: "A" },
                { id: "repo-b", label: "B" },
              ],
            },
          ],
        },
        false,
      ),
    ).toEqual({
      stepIds: [],
      itemIdsByStep: { repositories: ["repo-b"] },
    });
    expect(openSnapshot.steps[0].items.map((item) => item.id)).toEqual([
      "repo-a",
    ]);
  });

  it("reports a new step", () => {
    expect(
      getNewSnapshotEntries(
        openSnapshot,
        {
          steps: [
            { id: "repositories", items: [{ id: "repo-a", label: "A" }] },
            { id: "sessionSecrets", items: [{ id: "slot-1", label: "Token" }] },
          ],
        },
        false,
      ),
    ).toEqual({
      stepIds: ["sessionSecrets"],
      itemIdsByStep: {},
    });
  });

  it("returns null when nothing is new", () => {
    expect(
      getNewSnapshotEntries(
        openSnapshot,
        {
          steps: [
            { id: "repositories", items: [{ id: "repo-a", label: "A" }] },
          ],
        },
        false,
      ),
    ).toBeNull();
  });
});

describe("getSnapshotStepCounts()", () => {
  it("counts resolved items with the provided resolver", () => {
    const step = {
      id: "repositories",
      items: [
        { id: "repo-a", label: "A" },
        { id: "repo-b", label: "B" },
        { id: "repo-c", label: "C" },
      ],
    };
    expect(getSnapshotStepCounts(step, (id) => id !== "repo-b")).toEqual({
      resolved: 2,
      total: 3,
    });
  });
});
