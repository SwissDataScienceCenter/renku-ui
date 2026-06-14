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

import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import useAppSelector from "~/utils/customHooks/useAppSelector.hook";
import useProjectPermissions from "../ProjectPageV2/utils/useProjectPermissions.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetResourcePoolsQuery } from "./api/computeResources.api";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import { useGetSessionsImagesQuery } from "./api/sessionsV2.api";
import { DEFAULT_URL } from "./session.constants";
import { repositoriesNeedAttention } from "./sessionLaunchValidation.utils";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import useSessionLaunchPrerequisites from "./useSessionLaunchPrerequisites.hook";
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
    dataConnectorConfigs: initialDataConnectorConfigs,
    isFetchingOrLoadingDataConnectors: isFetchingOrLoadingStorages,
    isFetchingRepositories,
    isFetchingSessionSecrets,
    isReadyDataConnectorConfigs,
    repositories,
    sessionSecretSlotsWithSecrets,
  } = useSessionLaunchPrerequisites({
    project,
    enabled: true,
    autoMarkSecretsReady: true,
  });

  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const { isPendingResourceClass, setResourceClass } = useSessionResourceClass({
    launcher,
    isCustomLaunch,
    resourcePools,
  });

  const containerImage = launcher.environment?.container_image ?? "";
  const isExternalImageEnvironment =
    containerImage &&
    launcher.environment?.environment_kind === "CUSTOM" &&
    launcher.environment?.environment_image_source === "image";
  const { data: dataSessionImage, isLoading: isLoadingSessionImage } =
    useGetSessionsImagesQuery(
      isExternalImageEnvironment && containerImage
        ? { imageUrl: containerImage }
        : skipToken,
    );
  const sessionImage = useMemo(() => {
    if (isExternalImageEnvironment && containerImage) {
      return dataSessionImage;
    }
    return { accessible: true };
  }, [containerImage, dataSessionImage, isExternalImageEnvironment]);

  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2,
  );

  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      null,
    [resourcePools],
  );

  const dispatch = useAppDispatch();
  const projectPermissions = useProjectPermissions({ projectId: project.id });

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
    const projectRepositories = (project.repositories ?? []).map((url) => ({
      url,
    }));
    dispatch(
      startSessionOptionsV2Slice.actions.setRepositories(projectRepositories),
    );
  }, [dispatch, project.repositories]);

  useEffect(() => {
    if (
      !isFetchingOrLoadingStorages &&
      initialDataConnectorConfigs &&
      isReadyDataConnectorConfigs
    ) {
      dispatch(
        startSessionOptionsV2Slice.actions.setDataConnectorsOverrides(
          initialDataConnectorConfigs,
        ),
      );
    }
  }, [
    dispatch,
    initialDataConnectorConfigs,
    isFetchingOrLoadingStorages,
    isReadyDataConnectorConfigs,
  ]);

  // check session image availability -- it should block only for external images
  useEffect(() => {
    if (
      !isExternalImageEnvironment ||
      (!!sessionImage && sessionImage.accessible)
    ) {
      dispatch(startSessionOptionsV2Slice.actions.setImageReady(true));
    }
  }, [dispatch, isExternalImageEnvironment, sessionImage]);

  // Check for code repos availability -- it should only block if any repo requires it
  useEffect(() => {
    const interrupt = repositoriesNeedAttention(
      repositories,
      !!projectPermissions?.write,
    );
    if (!isFetchingRepositories && !interrupt) {
      dispatch(startSessionOptionsV2Slice.actions.setRepositoriesReady(true));
    }
  }, [
    dispatch,
    isFetchingRepositories,
    projectPermissions?.write,
    repositories,
  ]);

  return {
    containerImage,
    sessionImage,
    defaultSessionClass,
    isFetchingOrLoadingStorages,
    isFetchingRepositories,
    isFetchingSessionSecrets,
    isLoadingSessionImage,
    isPendingResourceClass,
    repositories,
    resourcePools,
    sessionSecretSlotsWithSecrets,
    setResourceClass,
  };
}
