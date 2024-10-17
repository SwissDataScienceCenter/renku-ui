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

import { useEffect, useMemo } from "react";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetResourcePoolsQuery } from "../dataServices/computeResources.api";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import useDataConnectorConfiguration from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { SESSION_CI_PIPELINE_POLLING_INTERVAL_MS } from "../session/startSessionOptions.constants";
import { DockerImageStatus } from "../session/startSessionOptions.types";
import { SessionLauncher } from "./sessionsV2.types";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import useSessionResourceClass from "./useSessionResourceClass.hook";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetDockerImageQuery } from "./sessionsV2.api";
import { DEFAULT_URL } from "./session.constants";

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

  const containerImage = launcher.environment?.container_image ?? "";

  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );

  const { data: dockerImageStatus, isLoading: isLoadingDockerImageStatus } =
    useGetDockerImageQuery(
      containerImage !== "unknown"
        ? {
            image_url: containerImage,
          }
        : skipToken,
      {
        pollingInterval:
          startSessionOptionsV2.dockerImageStatus === "not-available"
            ? SESSION_CI_PIPELINE_POLLING_INTERVAL_MS
            : 0,
      }
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

  // Set the image status
  useEffect(() => {
    const newStatus: DockerImageStatus = isLoadingDockerImageStatus
      ? "unknown"
      : dockerImageStatus == null
      ? "not-available"
      : dockerImageStatus.available
      ? "available"
      : "not-available";
    if (newStatus !== startSessionOptionsV2.dockerImageStatus) {
      dispatch(
        startSessionOptionsV2Slice.actions.setDockerImageStatus(newStatus)
      );
    }
    dispatch(
      startSessionOptionsV2Slice.actions.setDockerImageStatus("available")
    );
  }, [
    dispatch,
    dockerImageStatus,
    isLoadingDockerImageStatus,
    startSessionOptionsV2.dockerImageStatus,
  ]);

  useEffect(() => {
    const repositories = (project.repositories ?? []).map((url) => ({ url }));
    dispatch(startSessionOptionsV2Slice.actions.setRepositories(repositories));
  }, [dispatch, project.repositories]);

  const dataConnectors = useMemo(
    () => Object.values(dataConnectorsMap ?? {}),
    [dataConnectorsMap]
  );
  const { dataConnectorConfigs: initialDataConnectorConfigs } =
    useDataConnectorConfiguration({
      dataConnectors,
    });
  useEffect(() => {
    if (initialDataConnectorConfigs == null) return;
    dispatch(
      startSessionOptionsV2Slice.actions.setCloudStorage(
        initialDataConnectorConfigs
      )
    );
  }, [dispatch, initialDataConnectorConfigs, project.id]);

  return {
    containerImage,
    defaultSessionClass,
    isFetchingOrLoadingStorages:
      isFetchingDataConnectorLinks ||
      isLoadingDataConnectorLinks ||
      isLoadingDataConnectors ||
      isFetchingDataConnectors,
    resourcePools,
    startSessionOptionsV2,
    isPendingResourceClass,
    setResourceClass,
  };
}
