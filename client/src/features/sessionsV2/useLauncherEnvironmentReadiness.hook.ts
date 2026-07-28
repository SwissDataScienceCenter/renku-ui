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
import { useContext } from "react";

import { ImageStatus } from "~/features/sessionsV2/sessionsV2.types";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import type { Build, SessionLauncher } from "./api/sessionLaunchersV2.api";
import { useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery } from "./api/sessionLaunchersV2.api";
import { useGetSessionsImagesQuery } from "./api/sessionsV2.api";
import { getLauncherEnvironmentFlags } from "./launcherEnvironment.utils";

interface UseLauncherEnvironmentReadinessArgs {
  launcher?: SessionLauncher;
  builds?: Build[];
  lastBuild?: Build;
}

const DEFAULT_ENVIRONMENT_FLAGS = {
  isCustomImageEnvironment: false,
  isCodeEnvironment: false,
  isGlobalEnvironment: false,
};

function getImageStatus({
  hasCustomImageAccessible,
  isGlobalEnvironment,
  lastBuild,
  useOldImage,
}: {
  hasCustomImageAccessible: boolean;
  isGlobalEnvironment: boolean;
  lastBuild?: Build;
  useOldImage: boolean;
}): ImageStatus {
  if (useOldImage) {
    return "only-old-image-available";
  }
  if (
    isGlobalEnvironment ||
    hasCustomImageAccessible ||
    lastBuild?.status === "succeeded"
  ) {
    return "available";
  }
  return "no-available";
}

export default function useLauncherEnvironmentReadiness({
  launcher,
  builds: buildsProp,
  lastBuild: lastBuildProp,
}: UseLauncherEnvironmentReadinessArgs) {
  const environment = launcher?.environment;
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const { isCustomImageEnvironment, isCodeEnvironment, isGlobalEnvironment } =
    launcher
      ? getLauncherEnvironmentFlags(launcher)
      : DEFAULT_ENVIRONMENT_FLAGS;

  // custom + build cases
  const shouldFetchBuilds =
    launcher != null &&
    imageBuildersEnabled &&
    isCodeEnvironment &&
    buildsProp == null;

  const { data: fetchedBuilds, isLoading: isLoadingBuilds } = useGetBuildsQuery(
    shouldFetchBuilds && environment
      ? { environmentId: environment.id }
      : skipToken,
  );
  const builds = buildsProp ?? fetchedBuilds;
  const lastBuild = lastBuildProp ?? builds?.at(0);
  const lastSuccessfulBuild = builds?.find(
    (build) => build.status === "succeeded" && build.id !== lastBuild?.id,
  );
  const hasSuccessfulBuild = Boolean(
    lastBuild?.status === "succeeded" || lastSuccessfulBuild,
  );
  const useOldImage =
    isCodeEnvironment &&
    lastBuild?.status !== "succeeded" &&
    !!lastSuccessfulBuild;

  const containerImageUrl = environment?.container_image;

  const shouldFetchContainerImage = containerImageUrl != null;
  const { data: containerImage, isLoading: isLoadingContainerImage } =
    useGetSessionsImagesQuery(
      shouldFetchContainerImage ? { imageUrl: containerImageUrl } : skipToken,
    );

  const hasCustomImageAccessible = containerImage?.accessible === true;
  const displayLaunchSession =
    !isCodeEnvironment ||
    lastBuild?.status === "succeeded" ||
    (isCodeEnvironment && containerImage?.accessible === true) ||
    useOldImage;

  const isBuildInProgress =
    isCodeEnvironment && lastBuild?.status === "in_progress";

  const isLastBuildRunning = lastBuild?.status === "in_progress";
  const hasValidImage =
    isGlobalEnvironment || hasSuccessfulBuild || hasCustomImageAccessible;

  const imageStatus = getImageStatus({
    hasCustomImageAccessible,
    isGlobalEnvironment,
    lastBuild,
    useOldImage,
  });

  const forceLaunch =
    isCustomImageEnvironment &&
    !isLoadingContainerImage &&
    !containerImage?.accessible;

  return {
    builds,
    containerImage,
    forceLaunch,
    hasSuccessfulBuild,
    hasValidImage,
    isLastBuildRunning,
    isBuildInProgress,
    isCodeEnvironment,
    isCustomImageEnvironment,
    displayLaunchSession,
    isGlobalEnvironment,
    isLoadingBuilds: shouldFetchBuilds && isLoadingBuilds,
    isLoadingContainerImage:
      shouldFetchContainerImage && isLoadingContainerImage,
    lastBuild,
    lastSuccessfulBuild,
    useOldImage,
    imageStatus,
  };
}
