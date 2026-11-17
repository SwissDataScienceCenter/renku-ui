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

import type {
  PrerequisitesSnapshot,
  PrerequisitesSnapshotItem,
  PrerequisitesSnapshotStep,
  SessionLaunchSkips,
  SessionWizardLiveData,
  SessionWizardStepId,
} from "./prerequisitesSnapshot.types";
import {
  findSnapshotStep,
  getSnapshotStepCounts,
  isPendingListItemResolved,
  unresolvedItemIds,
} from "./prerequisitesSnapshot.utils";

export const SESSION_WIZARD_STEP_ORDER: SessionWizardStepId[] = [
  "resourceClass",
  "environmentImage",
  "repositories",
  "expiredDataConnectors",
  "sessionSecrets",
  "sshKey",
  "storageCredentials",
];

export function isSessionWizardItemResolved(
  stepId: SessionWizardStepId,
  itemId: string,
  live: SessionWizardLiveData,
): boolean {
  switch (stepId) {
    case "resourceClass":
      return live.sessionClass !== 0;
    case "environmentImage":
      return live.imageAccessible || live.imageReady;
    case "repositories":
      return isPendingListItemResolved(
        itemId,
        live.repositoriesReady,
        live.repositoryUrls,
      );
    case "expiredDataConnectors":
      return isPendingListItemResolved(
        itemId,
        live.dataConnectorsExpirationReady,
        live.expiredDataConnectorIds,
      );
    case "sessionSecrets":
      return isPendingListItemResolved(
        itemId,
        live.userSecretsReady,
        live.unreadySecretSlotIds,
      );
    case "sshKey":
      return live.hasSshKey || live.sshKeysReady;
    case "storageCredentials":
      return !live.dataConnectorIdsNeedingCredentials.has(itemId);
  }
}

export function getSessionWizardStepCounts(
  step: PrerequisitesSnapshotStep,
  live: SessionWizardLiveData,
): { resolved: number; total: number } {
  return getSnapshotStepCounts(step, (itemId) =>
    isSessionWizardItemResolved(step.id as SessionWizardStepId, itemId, live),
  );
}

// Skips Launch now still needs. Tested credentials are omitted, even if save failed.
export function getSessionLaunchSkips(
  snapshot: PrerequisitesSnapshot,
  live: SessionWizardLiveData,
): SessionLaunchSkips {
  const unresolved = (stepId: SessionWizardStepId) =>
    unresolvedItemIds(findSnapshotStep(snapshot, stepId), (itemId) =>
      isSessionWizardItemResolved(stepId, itemId, live),
    );

  const expired = unresolved("expiredDataConnectors");
  const credentials = unresolved("storageCredentials");

  return {
    setImageReady: unresolved("environmentImage").length > 0,
    setRepositoriesReady: unresolved("repositories").length > 0,
    skipExpiredDataConnectorIds: expired,
    setDataConnectorsExpirationReady: expired.length > 0,
    setUserSecretsReady: unresolved("sessionSecrets").length > 0,
    setSshKeysReady: unresolved("sshKey").length > 0,
    skipDataConnectorIdsNeedingCredentials: credentials,
  };
}

export function buildSessionLaunchSnapshot(args: {
  needsResourceClass: boolean;
  imageNeedsAttention: boolean;
  imageLabel?: string;
  repositories: PrerequisitesSnapshotItem[];
  expiredDataConnectors: PrerequisitesSnapshotItem[];
  unreadySecrets: PrerequisitesSnapshotItem[];
  sshNeedsAttention: boolean;
  credentials: PrerequisitesSnapshotItem[];
}): PrerequisitesSnapshot {
  const steps: PrerequisitesSnapshotStep[] = [];

  if (args.needsResourceClass) {
    steps.push({
      id: "resourceClass",
      items: [{ id: "resourceClass", label: "Resource class" }],
    });
  }
  if (args.imageNeedsAttention) {
    steps.push({
      id: "environmentImage",
      items: [
        {
          id: "environmentImage",
          label: args.imageLabel ?? "Environment image",
        },
      ],
    });
  }
  if (args.repositories.length > 0) {
    steps.push({ id: "repositories", items: args.repositories });
  }
  if (args.expiredDataConnectors.length > 0) {
    steps.push({
      id: "expiredDataConnectors",
      items: args.expiredDataConnectors,
    });
  }
  if (args.unreadySecrets.length > 0) {
    steps.push({ id: "sessionSecrets", items: args.unreadySecrets });
  }
  if (args.sshNeedsAttention) {
    steps.push({
      id: "sshKey",
      items: [{ id: "sshKey", label: "SSH key" }],
    });
  }
  if (args.credentials.length > 0) {
    steps.push({ id: "storageCredentials", items: args.credentials });
  }

  return { steps };
}
