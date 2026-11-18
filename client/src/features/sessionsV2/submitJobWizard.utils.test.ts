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

import type { JobWizardLiveData } from "./prerequisitesSnapshot.types";
import {
  buildJobSubmitSnapshot,
  getJobSubmitSkips,
  getJobWizardStepCounts,
  isJobWizardItemResolved,
} from "./submitJobWizard.utils";

function live(overrides: Partial<JobWizardLiveData> = {}): JobWizardLiveData {
  return {
    reviewReady: false,
    repositoriesReady: false,
    dataConnectorsExpirationReady: false,
    userSecretsReady: false,
    dataConnectorsResolved: false,
    repositoryUrls: new Set(),
    expiredDataConnectorIds: new Set(),
    unreadySecretSlotIds: new Set(),
    dataConnectorIdsNeedingCredentials: new Set(),
    ...overrides,
  };
}

describe("isJobWizardItemResolved()", () => {
  it("resolves review when the form is ready", () => {
    expect(
      isJobWizardItemResolved("review", "review", live({ reviewReady: true })),
    ).toBe(true);
    expect(isJobWizardItemResolved("review", "review", live())).toBe(false);
  });

  it("resolves shared steps from gates or live pending sets", () => {
    expect(
      isJobWizardItemResolved(
        "repositories",
        "repo-a",
        live({ repositoriesReady: true, repositoryUrls: new Set(["repo-a"]) }),
      ),
    ).toBe(true);
    expect(
      isJobWizardItemResolved(
        "expiredDataConnectors",
        "dc-1",
        live({ expiredDataConnectorIds: new Set() }),
      ),
    ).toBe(true);
    expect(
      isJobWizardItemResolved(
        "sessionSecrets",
        "slot-1",
        live({ unreadySecretSlotIds: new Set(["slot-1"]) }),
      ),
    ).toBe(false);
    expect(
      isJobWizardItemResolved(
        "storageCredentials",
        "dc-1",
        live({ dataConnectorsResolved: true }),
      ),
    ).toBe(true);
  });

  it("keeps a tested credential resolved when save fails", () => {
    expect(
      isJobWizardItemResolved(
        "storageCredentials",
        "dc-1",
        live({ dataConnectorIdsNeedingCredentials: new Set(["dc-2"]) }),
      ),
    ).toBe(true);
  });
});

describe("buildJobSubmitSnapshot()", () => {
  it("always includes review, then only steps that need attention", () => {
    expect(
      buildJobSubmitSnapshot({
        repositories: [{ id: "repo-a", label: "A" }],
        expiredDataConnectors: [],
        unreadySecrets: [{ id: "slot-1", label: "Token" }],
        credentials: [{ id: "dc-1", label: "Storage" }],
      }).steps.map((step) => step.id),
    ).toEqual([
      "review",
      "repositories",
      "sessionSecrets",
      "storageCredentials",
    ]);
  });
});

describe("getJobWizardStepCounts() and getJobSubmitSkips()", () => {
  it("updates counts from the snapshot against live data", () => {
    const snapshot = buildJobSubmitSnapshot({
      repositories: [
        { id: "repo-a", label: "A" },
        { id: "repo-b", label: "B" },
      ],
      expiredDataConnectors: [],
      unreadySecrets: [],
      credentials: [],
    });
    const repositoriesStep = snapshot.steps.find(
      (step) => step.id === "repositories",
    );
    expect(repositoriesStep).toBeDefined();
    expect(
      getJobWizardStepCounts(
        repositoriesStep!,
        live({ repositoryUrls: new Set(["repo-b"]) }),
      ),
    ).toEqual({ resolved: 1, total: 2 });
  });

  it("names the same gate updates Submit now still needs", () => {
    const snapshot = buildJobSubmitSnapshot({
      repositories: [{ id: "repo-a", label: "A" }],
      expiredDataConnectors: [{ id: "dc-expired", label: "Expired" }],
      unreadySecrets: [{ id: "slot-1", label: "Token" }],
      credentials: [
        { id: "dc-cred", label: "Storage" },
        { id: "dc-tested", label: "Tested" },
      ],
    });

    expect(
      getJobSubmitSkips(
        snapshot,
        live({
          reviewReady: true,
          repositoryUrls: new Set(["repo-a"]),
          expiredDataConnectorIds: new Set(["dc-expired"]),
          unreadySecretSlotIds: new Set(["slot-1"]),
          dataConnectorIdsNeedingCredentials: new Set(["dc-cred"]),
        }),
      ),
    ).toEqual({
      setRepositoriesReady: true,
      skipExpiredDataConnectorIds: ["dc-expired"],
      setDataConnectorsExpirationReady: true,
      setUserSecretsReady: true,
      skipDataConnectorIdsNeedingCredentials: ["dc-cred"],
      setDataConnectorsResolved: true,
    });
  });

  it("omits skips that are already satisfied", () => {
    const snapshot = buildJobSubmitSnapshot({
      repositories: [{ id: "repo-a", label: "A" }],
      expiredDataConnectors: [],
      unreadySecrets: [],
      credentials: [{ id: "dc-cred", label: "Storage" }],
    });

    expect(
      getJobSubmitSkips(
        snapshot,
        live({
          reviewReady: true,
          repositoriesReady: true,
          dataConnectorsResolved: true,
        }),
      ),
    ).toEqual({
      setRepositoriesReady: false,
      skipExpiredDataConnectorIds: [],
      setDataConnectorsExpirationReady: false,
      setUserSecretsReady: false,
      skipDataConnectorIdsNeedingCredentials: [],
      setDataConnectorsResolved: false,
    });
  });
});
