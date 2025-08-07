/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo } from "react";

import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import useDataConnectorConfiguration from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import { useGetResourcePoolsQuery } from "../dataServices/computeResources.api";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "../projectsV2/api/projectV2.enhanced-api";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import { DEFAULT_URL } from "./session.constants";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import useSessionResourceClass from "./useSessionResourceClass.hook";
import useSessionSecrets from "./useSessionSecrets.hook";

interface StartSessionFromLauncherProps {
  launcher: SessionLauncher;
  project: Project;
  isCustomLaunch: boolean;
}

export default function useSessionLauncherState({
  launcher,
  project,
  isCustomLaunch,
}: StartSessionFromLauncherProps) {
  const default_url = launcher.environment?.default_url ?? "";

  const {
    data: dataConnectorLinks,
    isFetching: isFetchingDataConnectorLinks,
    isLoading: isLoadingDataConnectorLinks,
  } = useGetProjectsByProjectIdDataConnectorLinksQuery({
    projectId: project.id,
  });
  const dataConnectorIds = useMemo(
    () => dataConnectorLinks?.map((link) => link.data_connector_id),
    [dataConnectorLinks]
  );
  const {
    data: dataConnectorsMap,
    isFetching: isFetchingDataConnectors,
    isLoading: isLoadingDataConnectors,
  } = useGetDataConnectorsListByDataConnectorIdsQuery(
    dataConnectorIds ? { dataConnectorIds } : skipToken
  );
  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const { isPendingResourceClass, setResourceClass } = useSessionResourceClass({
    launcher,
    isCustomLaunch,
    resourcePools,
  });
  const {
    isFetching: isFetchingSessionSecrets,
    sessionSecretSlotsWithSecrets,
  } = useSessionSecrets({ projectId: project.id });

  const containerImage = launcher.environment?.container_image ?? "";

  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );

  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      null,
    [resourcePools]
  );

  const dispatch = useAppDispatch();

  // Reset start session options slice when we navigate away
  useEffect(() => {
    return () => {
      dispatch(startSessionOptionsV2Slice.actions.reset());
    };
  }, [dispatch]);

  // Set the default URL
  useEffect(() => {
    const defaultUrl = default_url ?? DEFAULT_URL;
    if (startSessionOptionsV2.defaultUrl !== defaultUrl) {
      dispatch(startSessionOptionsV2Slice.actions.setDefaultUrl(defaultUrl));
    }
  }, [default_url, dispatch, startSessionOptionsV2.defaultUrl]);

  useEffect(() => {
    const repositories = (project.repositories ?? []).map((url) => ({ url }));
    dispatch(startSessionOptionsV2Slice.actions.setRepositories(repositories));
  }, [dispatch, project.repositories]);

  const dataConnectors = useMemo(
    () => Object.values(dataConnectorsMap ?? {}),
    [dataConnectorsMap]
  );
  const {
    dataConnectorConfigs: initialDataConnectorConfigs,
    isReadyDataConnectorConfigs,
  } = useDataConnectorConfiguration({ dataConnectors });

  const isFetchingOrLoadingStorages =
    isFetchingDataConnectorLinks ||
    isLoadingDataConnectorLinks ||
    isLoadingDataConnectors ||
    isFetchingDataConnectors ||
    !isReadyDataConnectorConfigs;

  useEffect(() => {
    if (
      !isFetchingOrLoadingStorages &&
      initialDataConnectorConfigs &&
      isReadyDataConnectorConfigs
    ) {
      dispatch(
        startSessionOptionsV2Slice.actions.setCloudStorage(
          initialDataConnectorConfigs
        )
      );
    }
  }, [
    dispatch,
    initialDataConnectorConfigs,
    isFetchingOrLoadingStorages,
    isReadyDataConnectorConfigs,
  ]);

  return {
    containerImage,
    defaultSessionClass,
    isFetchingOrLoadingStorages,
    resourcePools,
    isPendingResourceClass,
    setResourceClass,
    isFetchingSessionSecrets,
    sessionSecretSlotsWithSecrets,
  };
}
