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
import { useGetResourcePoolsQuery } from "../dataServices/computeResources.api";
import useDataSourceConfiguration from "../ProjectPageV2/ProjectPageContent/DataSources/useDataSourceConfiguration.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetStoragesV2Query } from "../projectsV2/api/storagesV2.api";
import { useGetDockerImageQuery } from "../session/sessions.api";
import { SESSION_CI_PIPELINE_POLLING_INTERVAL_MS } from "../session/startSessionOptions.constants";
import { DockerImageStatus } from "../session/startSessionOptions.types";
import { DEFAULT_URL } from "./session.utils";
import { SessionLauncher } from "./sessionsV2.types";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import useSessionResourceClass from "./useSessionResourceClass.hook";

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
    data: storages,
    isFetching: isFetchingStorages,
    isLoading: isLoadingStorages,
  } = useGetStoragesV2Query({
    storageV2Params: {
      project_id: project.id,
    },
  });
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
            image: containerImage,
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

  const { cloudStorageConfigs: initialCloudStorages } =
    useDataSourceConfiguration({
      storages,
    });
  useEffect(() => {
    if (initialCloudStorages == null) return;
    dispatch(
      startSessionOptionsV2Slice.actions.setCloudStorage(initialCloudStorages)
    );
  }, [dispatch, initialCloudStorages]);

  return {
    containerImage,
    defaultSessionClass,
    isFetchingOrLoadingStorages: isFetchingStorages || isLoadingStorages,
    resourcePools,
    startSessionOptionsV2,
    isPendingResourceClass,
    setResourceClass,
  };
}
