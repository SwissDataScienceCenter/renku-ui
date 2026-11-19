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

import type {
  WizardMultiStep,
  WizardSingleStep,
} from "./prerequisitesWizard.types";
import {
  createInitialNavigationState,
  getContinueLabel,
  getRemainingItemCount,
  getResolvedSummary,
  getSkipAllNote,
  getStepAccessibleName,
  getStepItemCounts,
  getStepStatus,
  getSubmitBlock,
  getSubmitLabel,
  goToStep,
  resolveCurrentStepId,
  toInlineLabel,
} from "./prerequisitesWizard.utils";

function multiStep(
  id: string,
  resolved: number,
  total: number,
  overrides: Partial<WizardMultiStep> = {},
): WizardMultiStep {
  return {
    id,
    label: id,
    kind: "multi",
    resolved,
    total,
    content: null,
    ...overrides,
  };
}

function singleStep(
  id: string,
  isSatisfied: boolean,
  overrides: Partial<WizardSingleStep> = {},
): WizardSingleStep {
  return {
    id,
    label: id,
    kind: "single",
    isSatisfied,
    pendingText: "Not set up",
    content: null,
    ...overrides,
  };
}

describe("getStepStatus()", () => {
  const base = { currentStepId: "a", visitedStepIds: ["b"] };

  it("returns current for the current step, even when it is complete", () => {
    expect(getStepStatus({ ...base, stepId: "a", resolved: 3, total: 3 })).toBe(
      "current",
    );
  });

  it("returns done when every item is resolved", () => {
    expect(getStepStatus({ ...base, stepId: "c", resolved: 2, total: 2 })).toBe(
      "done",
    );
  });

  it("returns in progress for a visited step with pending items", () => {
    expect(getStepStatus({ ...base, stepId: "b", resolved: 1, total: 3 })).toBe(
      "inProgress",
    );
  });

  it("returns not visited for a step the user has not opened", () => {
    expect(getStepStatus({ ...base, stepId: "c", resolved: 0, total: 3 })).toBe(
      "notVisited",
    );
  });
});

describe("item counts", () => {
  const steps = [
    singleStep("resource", true),
    multiStep("repositories", 3, 3),
    multiStep("connectors", 1, 2),
    multiStep("secrets", 0, 3),
    singleStep("ssh", false),
    multiStep("storage", 0, 3),
  ];

  it("leaves required steps out of the remaining count", () => {
    const withRequired = [
      singleStep("review", false, { isRequired: true }),
      ...steps.slice(1),
    ];
    expect(getRemainingItemCount(withRequired)).toBe(8);
  });

  it("describes how many items are resolved", () => {
    expect(getResolvedSummary(multiStep("a", 1, 3))).toBe("1 of 3 resolved");
    expect(getResolvedSummary(multiStep("a", 3, 3))).toBe("All 3 resolved");
    expect(getResolvedSummary(multiStep("a", 5, 3))).toBe("All 3 resolved");
  });

  it("uses a multi step's own total", () => {
    expect(getStepItemCounts(multiStep("a", 1, 4))).toEqual({
      resolved: 1,
      total: 4,
    });
  });
});

describe("labels", () => {
  it("makes the first letter lowercase but keeps acronyms", () => {
    expect(toInlineLabel("Storage credentials")).toBe("storage credentials");
    expect(toInlineLabel("SSH key")).toBe("SSH key");
  });

  it("names the next step on the continue button", () => {
    const next = multiStep("x", 0, 1, { label: "SSH key" });
    expect(
      getContinueLabel(
        singleStep("resource", false, { isRequired: true }),
        next,
      ),
    ).toBe("Continue to SSH key");
    expect(getContinueLabel(multiStep("repos", 2, 2), next)).toBe(
      "Continue to SSH key",
    );
  });

  it("says skip and continue while the current step still has pending items", () => {
    expect(
      getContinueLabel(
        multiStep("repos", 1, 3, { label: "Repositories" }),
        multiStep("secrets", 0, 1, { label: "Session secrets" }),
      ),
    ).toBe("Skip all and continue to session secrets");
  });

  it("says skip all on submit while optional items are still pending", () => {
    const steps = [multiStep("repos", 1, 3), singleStep("ssh", true)];
    expect(getSubmitLabel(steps, "Launch session")).toBe(
      "Skip all and launch session",
    );
    expect(getSubmitLabel([singleStep("ssh", true)], "Launch session")).toBe(
      "Launch session",
    );
  });

  it("states the remaining count in the skip-all note", () => {
    expect(getSkipAllNote(8, "launches the session")).toBe(
      "Skips the 8 remaining items and launches the session.",
    );
    expect(getSkipAllNote(1, "submits the job")).toBe(
      "Skips the 1 remaining item and submits the job.",
    );
    expect(getSkipAllNote(2)).toBe("Skips the 2 remaining items.");
    expect(getSkipAllNote(0)).toBe("All items are resolved.");
    expect(getSkipAllNote(0, "launches the session")).toBe(
      "All items are resolved.",
    );
  });

  it("includes the status in the accessible name", () => {
    const repositories = multiStep("r", 1, 3, { label: "Repositories" });
    expect(getStepAccessibleName(repositories, "current")).toBe(
      "Repositories, 2 pending",
    );
    expect(getStepAccessibleName(repositories, "notVisited")).toBe(
      "Repositories, 2 pending, not visited",
    );
    const resourceClass = singleStep("rc", false, {
      label: "Resource class",
      pendingText: "Required",
    });
    expect(getStepAccessibleName(resourceClass, "current")).toBe(
      "Resource class, required",
    );
    const connectors = multiStep("c", 2, 2, {
      label: "Expired data connectors",
    });
    expect(getStepAccessibleName(connectors, "done")).toBe(
      "Expired data connectors, done",
    );
  });
});

describe("goToStep()", () => {
  const steps = [
    multiStep("a", 0, 1),
    multiStep("b", 0, 1),
    multiStep("c", 0, 1),
  ];

  it("opens on the first step", () => {
    expect(createInitialNavigationState({ steps })).toEqual({
      currentStepId: "a",
      visitedStepIds: [],
    });
  });

  it("opens on the requested step", () => {
    expect(
      createInitialNavigationState({ steps, initialStepId: "b" }).currentStepId,
    ).toBe("b");
  });

  it("opens on the first step when the initial id is not in the list", () => {
    expect(
      createInitialNavigationState({ steps, initialStepId: "missing" })
        .currentStepId,
    ).toBe("a");
  });

  it("marks the step it leaves as visited", () => {
    const state = createInitialNavigationState({ steps });
    expect(goToStep(state, "a", "c")).toEqual({
      currentStepId: "c",
      visitedStepIds: ["a"],
    });
  });

  it("does not record a step twice", () => {
    const state = { currentStepId: "a", visitedStepIds: ["a", "c"] };
    expect(goToStep(state, "a", "c").visitedStepIds).toEqual(["a", "c"]);
  });

  it("keeps the state when going to the current step", () => {
    const state = createInitialNavigationState({ steps });
    expect(goToStep(state, "a", "a")).toBe(state);
  });
});

describe("getSubmitBlock()", () => {
  const review = singleStep("review", false, {
    isRequired: true,
    label: "Review job",
  });

  it("blocks submit while a required step is open", () => {
    expect(getSubmitBlock([review, multiStep("repos", 0, 1)], false)).toEqual({
      blocked: true,
      reason: "Finish review job first.",
    });
  });

  it("keeps a caller-provided reason", () => {
    expect(
      getSubmitBlock([review], true, "Choose a resource class first."),
    ).toEqual({
      blocked: true,
      reason: "Choose a resource class first.",
    });
  });

  it("leaves submit available when the required step is complete", () => {
    expect(
      getSubmitBlock([singleStep("review", true, { isRequired: true })], false),
    ).toEqual({ blocked: false });
  });
});

describe("resolveCurrentStepId()", () => {
  it("keeps the current step", () => {
    expect(resolveCurrentStepId([multiStep("a", 0, 1)], "a")).toBe("a");
  });

  it("falls back to the first step when the current id is missing", () => {
    const steps = [multiStep("b", 0, 1), multiStep("c", 0, 1)];
    expect(resolveCurrentStepId(steps, "a")).toBe("b");
  });

  it("returns undefined when there are no steps", () => {
    expect(resolveCurrentStepId([], "a")).toBeUndefined();
  });
});
