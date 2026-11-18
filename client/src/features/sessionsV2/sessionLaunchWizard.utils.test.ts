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

import type { SessionWizardLiveData } from "./prerequisitesSnapshot.types";
import {
  buildSessionLaunchSnapshot,
  getSessionLaunchSkips,
  getSessionWizardStepCounts,
  isSessionWizardItemResolved,
} from "./sessionLaunchWizard.utils";

function live(
  overrides: Partial<SessionWizardLiveData> = {},
): SessionWizardLiveData {
  return {
    sessionClass: 0,
    imageAccessible: false,
    imageReady: false,
    repositoriesReady: false,
    dataConnectorsExpirationReady: false,
    userSecretsReady: false,
    sshKeysReady: false,
    hasSshKey: false,
    repositoryUrls: new Set(),
    expiredDataConnectorIds: new Set(),
    unreadySecretSlotIds: new Set(),
    dataConnectorIdsNeedingCredentials: new Set(),
    ...overrides,
  };
}

describe("isSessionWizardItemResolved()", () => {
  it("resolves resource class when a class is chosen", () => {
    expect(
      isSessionWizardItemResolved(
        "resourceClass",
        "resourceClass",
        live({ sessionClass: 3 }),
      ),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved(
        "resourceClass",
        "resourceClass",
        live({ sessionClass: 0 }),
      ),
    ).toBe(false);
  });

  it("resolves the image when accessible or when Attempt launch set the flag", () => {
    expect(
      isSessionWizardItemResolved(
        "environmentImage",
        "environmentImage",
        live({ imageAccessible: true }),
      ),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved(
        "environmentImage",
        "environmentImage",
        live({ imageReady: true }),
      ),
    ).toBe(true);
  });

  it("keeps a fixed repository visible and resolved after it leaves the live list", () => {
    const afterFix = live({ repositoryUrls: new Set(["repo-b"]) });
    expect(
      isSessionWizardItemResolved("repositories", "repo-a", afterFix),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved("repositories", "repo-b", afterFix),
    ).toBe(false);
  });

  it("resolves every repository when Launch anyway set the flag", () => {
    const afterSkip = live({
      repositoriesReady: true,
      repositoryUrls: new Set(["repo-a", "repo-b"]),
    });
    expect(
      isSessionWizardItemResolved("repositories", "repo-a", afterSkip),
    ).toBe(true);
  });

  it("resolves secrets, SSH, expired connectors, and credentials from flags or live sets", () => {
    expect(
      isSessionWizardItemResolved(
        "sessionSecrets",
        "slot-1",
        live({
          userSecretsReady: true,
          unreadySecretSlotIds: new Set(["slot-1"]),
        }),
      ),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved(
        "sshKey",
        "sshKey",
        live({ hasSshKey: true }),
      ),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved(
        "expiredDataConnectors",
        "dc-1",
        live({ expiredDataConnectorIds: new Set() }),
      ),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved(
        "storageCredentials",
        "dc-1",
        live({ dataConnectorIdsNeedingCredentials: new Set() }),
      ),
    ).toBe(true);
  });

  it("keeps a tested credential resolved when save fails", () => {
    expect(
      isSessionWizardItemResolved(
        "storageCredentials",
        "dc-1",
        live({ dataConnectorIdsNeedingCredentials: new Set(["dc-2"]) }),
      ),
    ).toBe(true);
  });

  it("treats a credential skip as reversible when the id needs credentials again", () => {
    expect(
      isSessionWizardItemResolved(
        "storageCredentials",
        "dc-1",
        live({ dataConnectorIdsNeedingCredentials: new Set() }),
      ),
    ).toBe(true);
    expect(
      isSessionWizardItemResolved(
        "storageCredentials",
        "dc-1",
        live({ dataConnectorIdsNeedingCredentials: new Set(["dc-1"]) }),
      ),
    ).toBe(false);
  });
});

describe("getSessionWizardStepCounts() and getSessionLaunchSkips()", () => {
  it("updates counts from the snapshot against live data", () => {
    const snapshot = buildSessionLaunchSnapshot({
      needsResourceClass: false,
      imageNeedsAttention: false,
      repositories: [
        { id: "repo-a", label: "A" },
        { id: "repo-b", label: "B" },
      ],
      expiredDataConnectors: [],
      unreadySecrets: [],
      sshNeedsAttention: false,
      credentials: [],
    });
    expect(
      getSessionWizardStepCounts(
        snapshot.steps[0],
        live({ repositoryUrls: new Set(["repo-b"]) }),
      ),
    ).toEqual({ resolved: 1, total: 2 });
  });

  it("names the same flags the current buttons set for unresolved items", () => {
    const snapshot = buildSessionLaunchSnapshot({
      needsResourceClass: true,
      imageNeedsAttention: true,
      repositories: [
        { id: "repo-a", label: "A" },
        { id: "repo-b", label: "B" },
      ],
      expiredDataConnectors: [{ id: "dc-expired", label: "Expired" }],
      unreadySecrets: [{ id: "slot-1", label: "Token" }],
      sshNeedsAttention: true,
      credentials: [
        { id: "dc-cred", label: "Storage" },
        { id: "dc-tested", label: "Tested" },
      ],
    });

    expect(
      getSessionLaunchSkips(
        snapshot,
        live({
          sessionClass: 2,
          repositoryUrls: new Set(["repo-a", "repo-b"]),
          expiredDataConnectorIds: new Set(["dc-expired"]),
          unreadySecretSlotIds: new Set(["slot-1"]),
          dataConnectorIdsNeedingCredentials: new Set(["dc-cred"]),
        }),
      ),
    ).toEqual({
      setImageReady: true,
      setRepositoriesReady: true,
      skipExpiredDataConnectorIds: ["dc-expired"],
      setDataConnectorsExpirationReady: true,
      setUserSecretsReady: true,
      setSshKeysReady: true,
      skipDataConnectorIdsNeedingCredentials: ["dc-cred"],
    });
  });

  it("omits skips that are already satisfied", () => {
    const snapshot = buildSessionLaunchSnapshot({
      needsResourceClass: false,
      imageNeedsAttention: true,
      repositories: [{ id: "repo-a", label: "A" }],
      expiredDataConnectors: [],
      unreadySecrets: [],
      sshNeedsAttention: false,
      credentials: [{ id: "dc-cred", label: "Storage" }],
    });

    expect(
      getSessionLaunchSkips(
        snapshot,
        live({
          imageReady: true,
          repositoriesReady: true,
          dataConnectorIdsNeedingCredentials: new Set(),
        }),
      ),
    ).toEqual({
      setImageReady: false,
      setRepositoriesReady: false,
      skipExpiredDataConnectorIds: [],
      setDataConnectorsExpirationReady: false,
      setUserSecretsReady: false,
      setSshKeysReady: false,
      skipDataConnectorIdsNeedingCredentials: [],
    });
  });
});

describe("buildSessionLaunchSnapshot()", () => {
  it("includes only steps that need attention, in session order", () => {
    expect(
      buildSessionLaunchSnapshot({
        needsResourceClass: true,
        imageNeedsAttention: true,
        repositories: [{ id: "repo-a", label: "A" }],
        expiredDataConnectors: [],
        unreadySecrets: [],
        sshNeedsAttention: true,
        credentials: [{ id: "dc-1", label: "Storage" }],
      }).steps.map((step) => step.id),
    ).toEqual([
      "resourceClass",
      "environmentImage",
      "repositories",
      "sshKey",
      "storageCredentials",
    ]);
  });
});
