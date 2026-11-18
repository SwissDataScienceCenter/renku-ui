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
  JobSubmitSkips,
  JobWizardLiveData,
  JobWizardStepId,
  PrerequisitesSnapshot,
  PrerequisitesSnapshotItem,
  PrerequisitesSnapshotStep,
} from "./prerequisitesSnapshot.types";
import {
  findSnapshotStep,
  getSnapshotStepCounts,
  isPendingListItemResolved,
  unresolvedItemIds,
} from "./prerequisitesSnapshot.utils";

export const JOB_WIZARD_STEP_ORDER: JobWizardStepId[] = [
  "review",
  "repositories",
  "expiredDataConnectors",
  "sessionSecrets",
  "storageCredentials",
];

export function isJobWizardItemResolved(
  stepId: JobWizardStepId,
  itemId: string,
  live: JobWizardLiveData,
): boolean {
  switch (stepId) {
    case "review":
      return live.reviewReady;
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
    case "storageCredentials":
      return isPendingListItemResolved(
        itemId,
        live.dataConnectorsResolved,
        live.dataConnectorIdsNeedingCredentials,
      );
  }
}

export function getJobWizardStepCounts(
  step: PrerequisitesSnapshotStep,
  live: JobWizardLiveData,
): { resolved: number; total: number } {
  return getSnapshotStepCounts(step, (itemId) =>
    isJobWizardItemResolved(step.id as JobWizardStepId, itemId, live),
  );
}

export function getJobSubmitSkips(
  snapshot: PrerequisitesSnapshot,
  live: JobWizardLiveData,
): JobSubmitSkips {
  const unresolved = (stepId: JobWizardStepId) =>
    unresolvedItemIds(findSnapshotStep(snapshot, stepId), (itemId) =>
      isJobWizardItemResolved(stepId, itemId, live),
    );

  const expired = unresolved("expiredDataConnectors");
  const credentials = unresolved("storageCredentials");

  return {
    setRepositoriesReady: unresolved("repositories").length > 0,
    skipExpiredDataConnectorIds: expired,
    setDataConnectorsExpirationReady: expired.length > 0,
    setUserSecretsReady: unresolved("sessionSecrets").length > 0,
    skipDataConnectorIdsNeedingCredentials: credentials,
    setDataConnectorsResolved: credentials.length > 0,
  };
}

// Builds the job wizard snapshot
export function buildJobSubmitSnapshot(args: {
  repositories: PrerequisitesSnapshotItem[];
  expiredDataConnectors: PrerequisitesSnapshotItem[];
  unreadySecrets: PrerequisitesSnapshotItem[];
  credentials: PrerequisitesSnapshotItem[];
}): PrerequisitesSnapshot {
  const steps: PrerequisitesSnapshotStep[] = [
    {
      id: "review",
      items: [{ id: "review", label: "Review job" }],
    },
  ];

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
  if (args.credentials.length > 0) {
    steps.push({ id: "storageCredentials", items: args.credentials });
  }

  return { steps };
}
