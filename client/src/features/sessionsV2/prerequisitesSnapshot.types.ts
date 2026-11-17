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

export interface PrerequisitesSnapshotItem {
  id: string;
  label: string;
  detail?: string;
}

export interface PrerequisitesSnapshotStep {
  id: string;
  items: PrerequisitesSnapshotItem[];
}

export interface PrerequisitesSnapshot {
  steps: PrerequisitesSnapshotStep[];
}

// Steps or items in the latest evaluation that are not in the open snapshot.
export interface PrerequisitesNewEntries {
  stepIds: string[];
  itemIdsByStep: Record<string, string[]>;
}

export type SessionWizardStepId =
  | "resourceClass"
  | "environmentImage"
  | "repositories"
  | "expiredDataConnectors"
  | "sessionSecrets"
  | "sshKey"
  | "storageCredentials";

export type JobWizardStepId =
  | "review"
  | "repositories"
  | "expiredDataConnectors"
  | "sessionSecrets"
  | "storageCredentials";

// Pending ids shared by session launch and job submit.
export interface PrerequisitesPendingIds {
  repositoryUrls: ReadonlySet<string>;
  expiredDataConnectorIds: ReadonlySet<string>;
  unreadySecretSlotIds: ReadonlySet<string>;
  dataConnectorIdsNeedingCredentials: ReadonlySet<string>;
}

export interface SessionWizardLiveData extends PrerequisitesPendingIds {
  sessionClass: number;
  imageAccessible: boolean;
  imageReady: boolean;
  repositoriesReady: boolean;
  dataConnectorsExpirationReady: boolean;
  userSecretsReady: boolean;
  sshKeysReady: boolean;
  hasSshKey: boolean;
}

export interface JobWizardLiveData extends PrerequisitesPendingIds {
  reviewReady: boolean;
  repositoriesReady: boolean;
  dataConnectorsExpirationReady: boolean;
  userSecretsReady: boolean;
  dataConnectorsResolved: boolean;
}

export interface SessionLaunchSkips {
  setImageReady: boolean;
  setRepositoriesReady: boolean;
  skipExpiredDataConnectorIds: string[];
  setDataConnectorsExpirationReady: boolean;
  setUserSecretsReady: boolean;
  setSshKeysReady: boolean;
  skipDataConnectorIdsNeedingCredentials: string[];
}

export interface JobSubmitSkips {
  setRepositoriesReady: boolean;
  skipExpiredDataConnectorIds: string[];
  setDataConnectorsExpirationReady: boolean;
  setUserSecretsReady: boolean;
  skipDataConnectorIdsNeedingCredentials: string[];
  setDataConnectorsResolved: boolean;
}
