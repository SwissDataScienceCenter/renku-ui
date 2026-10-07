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
  useGetSessionLaunchersByLauncherIdDataConnectorsQuery,
  useGetSessionLaunchersByLauncherIdSecretsQuery,
} from "./api/sessionLaunchersV2.api";
import {
  dataConnectorsNeedCredentials,
  doesCloudStorageNeedCredentials,
  isDataConnectorExpired,
  repositoriesNeedAttention,
  secretsNeedAttention,
} from "./sessionLaunchValidation.utils";
import {
  getExcludedSecretSlotIds,
  getIncludedDataConnectorIds,
} from "./SessionView/launcherResources.constants";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";
import useSessionSecrets from "./useSessionSecrets.hook";

interface UseSessionLaunchPrerequisitesArgs {
  launcherId: string;
  project: Project;
  autoMarkSecretsReady?: boolean;
}

export default function useSessionLaunchPrerequisites({
  launcherId,
  project,
  autoMarkSecretsReady = false,
}: UseSessionLaunchPrerequisitesArgs) {
  const projectId = project.id;
  const repositoryUrls = project.repositories ?? [];

  const {
    data: dataConnectorLinks,
    isFetching: isFetchingDataConnectorLinks,
    isLoading: isLoadingDataConnectorLinks,
  } = useGetProjectsByProjectIdDataConnectorLinksQuery(
    projectId ? { projectId } : skipToken,
  );
  const {
    data: launcherDataConnectors,
    isFetching: isFetchingLauncherDataConnectors,
    isLoading: isLoadingLauncherDataConnectors,
  } = useGetSessionLaunchersByLauncherIdDataConnectorsQuery(
    launcherId ? { launcherId } : skipToken,
  );
  const {
    data: launcherSecrets,
    isFetching: isFetchingLauncherSecrets,
    isLoading: isLoadingLauncherSecrets,
  } = useGetSessionLaunchersByLauncherIdSecretsQuery(
    launcherId ? { launcherId } : skipToken,
  );
  const includedDataConnectorIds = useMemo(
    () =>
      getIncludedDataConnectorIds(dataConnectorLinks, launcherDataConnectors),
    [dataConnectorLinks, launcherDataConnectors],
  );
  const excludedSecretSlotIds = useMemo(
    () => getExcludedSecretSlotIds(launcherSecrets),
    [launcherSecrets],
  );
  const {
    data: dataConnectorsMap,
    isFetching: isFetchingDataConnectors,
    isLoading: isLoadingDataConnectors,
  } = useGetDataConnectorsListByDataConnectorIdsQuery(
    includedDataConnectorIds != undefined
      ? { dataConnectorIds: includedDataConnectorIds }
      : skipToken,
  );

  const dataConnectors = useMemo(() => {
    if (includedDataConnectorIds == null || dataConnectorsMap == null) {
      return undefined;
    }
    return Object.values(dataConnectorsMap);
  }, [dataConnectorsMap, includedDataConnectorIds]);
  const { dataConnectorConfigs, isReadyDataConnectorConfigs } =
    useDataConnectorConfiguration({ dataConnectors });

  const { data: repositories, isFetching: isFetchingRepositories } =
    useGetRepositoriesQuery(repositoryUrls ? repositoryUrls : skipToken);

  const projectPermissions = useProjectPermissions({ projectId });

  const {
    isFetching: isFetchingSessionSecrets,
    sessionSecretSlotsWithSecrets,
  } = useSessionSecrets({
    projectId,
    autoMarkReady: autoMarkSecretsReady,
    excludedSecretSlotIds,
  });

  const isFetchingOrLoadingDataConnectors =
    isFetchingDataConnectorLinks ||
    isLoadingDataConnectorLinks ||
    isFetchingLauncherDataConnectors ||
    isLoadingLauncherDataConnectors ||
    launcherDataConnectors == null ||
    (includedDataConnectorIds != null &&
      (isLoadingDataConnectors ||
        isFetchingDataConnectors ||
        dataConnectorsMap == null)) ||
    !isReadyDataConnectorConfigs;

  const isInitialLoading =
    projectPermissions.isLoadingPermissions ||
    launcherDataConnectors == null ||
    launcherSecrets == null ||
    dataConnectorLinks == null ||
    (includedDataConnectorIds != null && dataConnectorsMap == null) ||
    (repositoryUrls.length > 0 && repositories == null) ||
    sessionSecretSlotsWithSecrets == null;

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

  const expiredDataConnectorConfigs = useMemo(
    () => dataConnectorConfigs?.filter(isDataConnectorExpired) ?? [],
    [dataConnectorConfigs],
  );
  const hasExpiredDataConnectors = expiredDataConnectorConfigs.length > 0;

  return {
    dataConnectorConfigs: dataConnectorConfigs as
      | SessionStartDataConnectorConfiguration[]
      | undefined,
    configsNeedingCredentials,
    expiredDataConnectorConfigs,
    hasExpiredDataConnectors,
    hasWritePermission,
    isFetchingOrLoadingDataConnectors,
    isFetchingRepositories,
    isFetchingSessionSecrets:
      isFetchingSessionSecrets ||
      isFetchingLauncherSecrets ||
      isLoadingLauncherSecrets ||
      launcherSecrets == null,
    isInitialLoading,
    isPermissionsError: projectPermissions.isPermissionsError,
    isReadyDataConnectorConfigs,
    needsCredentials,
    permissionsError: projectPermissions.permissionsError,
    repositories,
    repositoriesNeedAttention: repositoriesNeedAttentionFlag,
    secretsNeedAttention: secretsNeedAttentionFlag,
    sessionSecretSlotsWithSecrets,
  };
}
