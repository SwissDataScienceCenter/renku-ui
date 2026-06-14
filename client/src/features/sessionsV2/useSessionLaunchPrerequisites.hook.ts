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

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

import {
  useGetDataConnectorsListByDataConnectorIdsQuery,
  useGetProjectsByProjectIdDataConnectorLinksQuery,
} from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import useDataConnectorConfiguration from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import useProjectPermissions from "../ProjectPageV2/utils/useProjectPermissions.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetRepositoriesQuery } from "../repositories/api/repositories.api";
import {
  dataConnectorsNeedCredentials,
  doesCloudStorageNeedCredentials,
  repositoriesNeedAttention,
  secretsNeedAttention,
} from "./sessionLaunchValidation.utils";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";
import useSessionSecrets from "./useSessionSecrets.hook";

interface UseSessionLaunchPrerequisitesArgs {
  project: Project;
  enabled?: boolean;
  autoMarkSecretsReady?: boolean;
}

export default function useSessionLaunchPrerequisites({
  project,
  enabled = true,
  autoMarkSecretsReady = false,
}: UseSessionLaunchPrerequisitesArgs) {
  const projectId = project.id;
  const repositoryUrls = project.repositories ?? [];

  const {
    data: dataConnectorLinks,
    isFetching: isFetchingDataConnectorLinks,
    isLoading: isLoadingDataConnectorLinks,
  } = useGetProjectsByProjectIdDataConnectorLinksQuery(
    enabled ? { projectId } : skipToken,
  );
  const dataConnectorIds = useMemo(
    () => dataConnectorLinks?.map((link) => link.data_connector_id),
    [dataConnectorLinks],
  );
  const {
    data: dataConnectorsMap,
    isFetching: isFetchingDataConnectors,
    isLoading: isLoadingDataConnectors,
  } = useGetDataConnectorsListByDataConnectorIdsQuery(
    enabled && dataConnectorIds ? { dataConnectorIds } : skipToken,
  );

  const dataConnectors = useMemo(
    () => Object.values(dataConnectorsMap ?? {}),
    [dataConnectorsMap],
  );
  const { dataConnectorConfigs, isReadyDataConnectorConfigs } =
    useDataConnectorConfiguration({
      dataConnectors: enabled ? dataConnectors : undefined,
    });

  const { data: repositories, isFetching: isFetchingRepositories } =
    useGetRepositoriesQuery(enabled ? repositoryUrls : skipToken);

  const projectPermissions = useProjectPermissions({ projectId });

  const {
    isFetching: isFetchingSessionSecrets,
    sessionSecretSlotsWithSecrets,
  } = useSessionSecrets({
    projectId,
    autoMarkReady: autoMarkSecretsReady,
    enabled,
  });

  const isFetchingOrLoadingDataConnectors =
    isFetchingDataConnectorLinks ||
    isLoadingDataConnectorLinks ||
    isLoadingDataConnectors ||
    isFetchingDataConnectors ||
    !isReadyDataConnectorConfigs;

  const isLoading =
    !enabled ||
    !projectPermissions.arePermissionsResolved ||
    isFetchingOrLoadingDataConnectors ||
    isFetchingRepositories ||
    isFetchingSessionSecrets;

  const hasWritePermission =
    projectPermissions.arePermissionsResolved &&
    projectPermissions.write === true;

  const repositoriesNeedAttentionFlag = repositoriesNeedAttention(
    repositories,
    hasWritePermission,
  );

  const secretsNeedAttentionFlag = secretsNeedAttention(
    sessionSecretSlotsWithSecrets,
  );

  const configsNeedingCredentials = useMemo(
    () =>
      dataConnectorConfigs?.filter((config) =>
        doesCloudStorageNeedCredentials(config),
      ) ?? [],
    [dataConnectorConfigs],
  );

  const needsCredentials = dataConnectorsNeedCredentials(dataConnectorConfigs);

  return {
    dataConnectorConfigs: dataConnectorConfigs as
      | SessionStartDataConnectorConfiguration[]
      | undefined,
    configsNeedingCredentials,
    isFetchingOrLoadingDataConnectors,
    isFetchingRepositories,
    isFetchingSessionSecrets,
    isLoading,
    isReadyDataConnectorConfigs,
    needsCredentials,
    repositories,
    repositoriesNeedAttention: repositoriesNeedAttentionFlag,
    secretsNeedAttention: secretsNeedAttentionFlag,
    sessionSecretSlotsWithSecrets,
  };
}
