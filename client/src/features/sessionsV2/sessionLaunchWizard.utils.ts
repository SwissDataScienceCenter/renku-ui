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

import { getRepositoryName } from "../ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import type { GetRepositoriesApiResponse } from "../repositories/api/repositories.api";
import type { SshKey } from "../usersV2/api/users.api";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import {
  doesCloudStorageNeedCredentials,
  isDataConnectorExpired,
  repositoriesNeedAttention,
  sshKeyNeedsAttention,
} from "./sessionLaunchValidation.utils";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

export type SessionLaunchStepId =
  | "resourceClass"
  | "image"
  | "repositories"
  | "expiredDataConnectors"
  | "sessionSecrets"
  | "sshKey"
  | "storageCredentials";

export interface SessionLaunchSnapshotItem {
  id: string;
  label: string;
}

export interface SessionLaunchSnapshotStep {
  id: SessionLaunchStepId;
  items: SessionLaunchSnapshotItem[];
}

export interface SessionLaunchSnapshot {
  steps: SessionLaunchSnapshotStep[];
}

export interface SessionLaunchSnapshotInput {
  resourceClassRequired: boolean;
  imageRequired: boolean;
  imageLabel: string;
  repositories: SessionLaunchSnapshotItem[];
  expiredConnectors: SessionLaunchSnapshotItem[];
  secrets: SessionLaunchSnapshotItem[];
  sshRequired: boolean;
  credentials: SessionLaunchSnapshotItem[];
}

const STEP_ORDER: SessionLaunchStepId[] = [
  "resourceClass",
  "image",
  "repositories",
  "expiredDataConnectors",
  "sessionSecrets",
  "sshKey",
  "storageCredentials",
];

export function buildSessionLaunchSnapshot(
  input: SessionLaunchSnapshotInput,
): SessionLaunchSnapshot {
  const itemsByStep: Record<SessionLaunchStepId, SessionLaunchSnapshotItem[]> =
    {
      resourceClass: input.resourceClassRequired
        ? [{ id: "resource-class", label: "Resource class" }]
        : [],
      image: input.imageRequired
        ? [{ id: "environment-image", label: input.imageLabel }]
        : [],
      repositories: input.repositories,
      expiredDataConnectors: input.expiredConnectors,
      sessionSecrets: input.secrets,
      sshKey: input.sshRequired ? [{ id: "ssh-key", label: "SSH key" }] : [],
      storageCredentials: input.credentials,
    };
  return {
    steps: STEP_ORDER.flatMap((id) => {
      const items = itemsByStep[id];
      return items.length > 0 ? [{ id, items }] : [];
    }),
  };
}

export function withCredentialsSkipped(
  configs: SessionStartDataConnectorConfiguration[],
): SessionStartDataConnectorConfiguration[] {
  return configs.map((config) =>
    doesCloudStorageNeedCredentials(config)
      ? { ...config, active: false, saveCredentials: false, skip: true }
      : config,
  );
}

export function applyLaunchSkips(
  configs: SessionStartDataConnectorConfiguration[],
  stepIds: SessionLaunchStepId[],
): SessionStartDataConnectorConfiguration[] {
  const withExpired = stepIds.includes("expiredDataConnectors")
    ? withExpiredConnectorsSkipped(configs)
    : configs;
  return stepIds.includes("storageCredentials")
    ? withCredentialsSkipped(withExpired)
    : withExpired;
}

export interface SessionLaunchSnapshotSource {
  containerImage: string;
  dataConnectors: SessionStartDataConnectorConfiguration[] | undefined;
  hasWritePermission: boolean;
  isCustomLaunch: boolean;
  isExternalImageEnvironment: boolean;
  launcher: SessionLauncher;
  launcherClassAvailable: boolean;
  launcherResourcesError: unknown;
  repositories: GetRepositoriesApiResponse[] | undefined;
  sessionImageAccessible: boolean | undefined;
  sessionSecretSlotsWithSecrets:
    | SessionSecretSlotWithSecret[]
    | null
    | undefined;
  settled: boolean;
  sshKeys: SshKey[] | undefined;
}

export function sessionLaunchSnapshotInput(
  source: SessionLaunchSnapshotSource,
): SessionLaunchSnapshotInput | null {
  if (
    !source.settled ||
    source.dataConnectors == null ||
    source.launcherResourcesError != null
  ) {
    return null;
  }
  const dataConnectors = source.dataConnectors;
  return {
    resourceClassRequired:
      source.isCustomLaunch || !source.launcherClassAvailable,
    imageRequired:
      source.isExternalImageEnvironment &&
      source.sessionImageAccessible !== true,
    imageLabel: source.containerImage || "Environment image",
    repositories: repositoryItems(
      source.repositories,
      source.hasWritePermission,
    ),
    expiredConnectors: connectorItems(dataConnectors, isDataConnectorExpired),
    secrets: secretItems(source.sessionSecretSlotsWithSecrets),
    sshRequired: sshKeyNeedsAttention(source.launcher, source.sshKeys),
    credentials: connectorItems(
      dataConnectors,
      doesCloudStorageNeedCredentials,
    ),
  };
}

function repositoryItems(
  repositories: GetRepositoriesApiResponse[] | undefined,
  hasWritePermission: boolean,
): SessionLaunchSnapshotItem[] {
  return (repositories ?? [])
    .filter((repository) =>
      repositoriesNeedAttention([repository], hasWritePermission),
    )
    .map((repository) => ({
      id: repository.url,
      label: getRepositoryName(repository.url),
    }));
}

function connectorItems(
  configs: SessionStartDataConnectorConfiguration[],
  needsAttention: (config: SessionStartDataConnectorConfiguration) => boolean,
): SessionLaunchSnapshotItem[] {
  return configs.filter(needsAttention).map((config) => ({
    id: config.dataConnector.id,
    label: config.dataConnector.name,
  }));
}

function secretItems(
  slots: SessionSecretSlotWithSecret[] | null | undefined,
): SessionLaunchSnapshotItem[] {
  return (slots ?? [])
    .filter((slot) => slot.secretId == null)
    .map((slot) => ({
      id: slot.secretSlot.id,
      label: slot.secretSlot.name,
    }));
}

export function withExpiredConnectorsSkipped(
  configs: SessionStartDataConnectorConfiguration[],
): SessionStartDataConnectorConfiguration[] {
  return configs.map((config) =>
    isDataConnectorExpired(config)
      ? { ...config, active: false, skip: true }
      : config,
  );
}
