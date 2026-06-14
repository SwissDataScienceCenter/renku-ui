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
import { useContext, useMemo } from "react";

import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import type { Build, SessionLauncher } from "./api/sessionLaunchersV2.api";
import { useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery } from "./api/sessionLaunchersV2.api";
import {
  useGetSessionsImagesQuery,
  type ImageCheckResponse,
} from "./api/sessionsV2.api";
import { getLauncherEnvironmentFlags } from "./launcherEnvironment.utils";

interface UseLauncherEnvironmentReadinessArgs {
  launcher: SessionLauncher;
  enabled?: boolean;
  lastBuild?: Build;
  lastSuccessfulBuild?: Build;
  useOldImage?: boolean;
}

export default function useLauncherEnvironmentReadiness({
  launcher,
  enabled = true,
  lastBuild: lastBuildProp,
  lastSuccessfulBuild: lastSuccessfulBuildProp,
  useOldImage: useOldImageProp,
}: UseLauncherEnvironmentReadinessArgs) {
  const { environment } = launcher;
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const {
    isCustomImageEnvironment,
    isCodeEnvironment,
    isExternalImageEnvironment,
  } = getLauncherEnvironmentFlags(launcher);

  const shouldFetchBuilds =
    enabled &&
    imageBuildersEnabled &&
    isCodeEnvironment &&
    lastBuildProp == null;

  const { data: builds, isLoading: isLoadingBuilds } = useGetBuildsQuery(
    shouldFetchBuilds ? { environmentId: environment.id } : skipToken,
  );

  const lastBuild = lastBuildProp ?? builds?.at(0);
  const lastSuccessfulBuild =
    lastSuccessfulBuildProp ??
    builds?.find(
      (build) => build.status === "succeeded" && build.id !== lastBuild?.id,
    );

  const useOldImage = useMemo(
    () =>
      useOldImageProp ??
      (isCodeEnvironment &&
        lastBuild?.status !== "succeeded" &&
        !!lastSuccessfulBuild),
    [
      isCodeEnvironment,
      lastBuild?.status,
      lastSuccessfulBuild,
      useOldImageProp,
    ],
  );

  const containerImageUrl =
    environment.environment_kind === "CUSTOM"
      ? environment.container_image
      : undefined;
  const shouldFetchContainerImage = enabled && containerImageUrl != null;

  const { data: containerImage, isLoading: isLoadingContainerImage } =
    useGetSessionsImagesQuery(
      shouldFetchContainerImage ? { imageUrl: containerImageUrl } : skipToken,
    );

  const hasSuccessfulBuild =
    lastBuild?.status === "succeeded" ||
    builds?.some((build) => build.status === "succeeded");

  const displayLaunchSession =
    !isCodeEnvironment ||
    lastBuild?.status === "succeeded" ||
    (isCodeEnvironment && containerImage?.accessible === true) ||
    useOldImage;

  const isBuildInProgress =
    isCodeEnvironment && lastBuild?.status === "in_progress";

  const isLastBuildRunning = lastBuild?.status === "in_progress";

  const hasValidImage =
    !isCodeEnvironment ||
    lastBuild?.status === "succeeded" ||
    containerImage?.accessible === true ||
    useOldImage;

  const showSubmitJob = !(isBuildInProgress && !hasValidImage && !useOldImage);

  const isLaunchButtonDisabled =
    isCodeEnvironment && !hasSuccessfulBuild && !useOldImage;

  const forceLaunch =
    isExternalImageEnvironment &&
    !isLoadingContainerImage &&
    containerImage?.accessible === false;

  return {
    containerImage: containerImage as ImageCheckResponse | undefined,
    displayLaunchSession,
    forceLaunch,
    hasSuccessfulBuild,
    hasValidImage,
    isBuildInProgress,
    isCodeEnvironment,
    isCustomImageEnvironment,
    isExternalImageEnvironment,
    isLastBuildRunning,
    isLaunchButtonDisabled,
    isLoadingBuilds: shouldFetchBuilds && isLoadingBuilds,
    isLoadingContainerImage:
      shouldFetchContainerImage && isLoadingContainerImage,
    lastBuild,
    lastSuccessfulBuild,
    showSubmitJob,
    useOldImage,
  };
}
