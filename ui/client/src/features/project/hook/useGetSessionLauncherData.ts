/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useEffect, useMemo } from "react";

import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { useGetResourcePoolsQuery } from "../../dataServices/computeResources.api";
import useDefaultBranchOption from "../../session/hooks/options/useDefaultBranchOption.hook";
import useDefaultCommitOption from "../../session/hooks/options/useDefaultCommitOption.hook";
import {
  projectCoreApi,
  ProjectMetadataParams,
  useGetConfigQuery,
} from "../projectCoreApi";
import projectGitLabApi, {
  useGetAllRepositoryBranchesQuery,
  useGetAllRepositoryCommitsQuery,
} from "../projectGitLab.api";
import { useCoreSupport } from "../useProjectCoreSupport";

export function useGetSessionLauncherData(
  defaultBranch: string,
  gitLabProjectId: number | null,
  projectRepositoryUrl: string
) {
  const { branch: currentBranch, commit } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );

  const { data: branches } = useGetAllRepositoryBranchesQuery(
    gitLabProjectId
      ? {
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
  );
  const { data: commits } = useGetAllRepositoryCommitsQuery(
    gitLabProjectId && currentBranch
      ? {
          branch: currentBranch,
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;

  const isSupported = coreSupportComputed && backendAvailable;

  const { data: projectConfig, isLoading: isLoadingProjectConfig } =
    useGetConfigQuery(
      backendAvailable && coreSupportComputed && currentBranch && commit
        ? {
            apiVersion,
            metadataVersion,
            projectRepositoryUrl,
            branch: currentBranch,
            commit,
          }
        : skipToken
    );

  const [projectMetadata, projectMetadataStatus] =
    projectCoreApi.endpoints.projectMetadata.useLazyQuery();

  const { data: resourcePools, isFetching: resourcePoolsIsFetching } =
    useGetResourcePoolsQuery(
      projectConfig
        ? {
            cpuRequest: projectConfig.config.sessions?.legacyConfig?.cpuRequest,
            gpuRequest: projectConfig.config.sessions?.legacyConfig?.gpuRequest,
            memoryRequest:
              projectConfig.config.sessions?.legacyConfig?.memoryRequest,
            storageRequest: projectConfig.config.sessions?.storage,
          }
        : skipToken
    );

  useEffect(() => {
    if (
      projectRepositoryUrl &&
      commit &&
      backendAvailable &&
      coreSupportComputed
    ) {
      const params: ProjectMetadataParams = {
        projectRepositoryUrl: `${projectRepositoryUrl}`,
        commitSha: commit,
        isDelayed: false,
        metadataVersion,
        apiVersion,
      };
      projectMetadata(params, /*preferCacheValue=*/ true);
    }
  }, [
    projectRepositoryUrl,
    commit,
    backendAvailable,
    coreSupportComputed,
    apiVersion,
    metadataVersion,
    projectMetadata,
  ]);

  const templateName: string | undefined = useMemo(() => {
    if (
      !projectMetadataStatus?.error &&
      !projectConfig?.config?.sessions?.dockerImage
    ) {
      const templateInfo =
        projectMetadataStatus.data?.result?.template_info ?? "";
      const templateParts = templateInfo.split(": ");
      return templateParts.pop() || undefined;
    }
    return undefined;
  }, [projectMetadataStatus, projectConfig]);

  useDefaultBranchOption({ branches, defaultBranch });
  useDefaultCommitOption({ commits });

  const tag = useMemo(() => commit.slice(0, 7), [commit]);

  const {
    currentData: registry,
    isFetching: renkuRegistryIsFetching,
    error: renkuRegistryError,
  } = projectGitLabApi.useGetRenkuRegistryQuery(
    gitLabProjectId
      ? {
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
  );

  const {
    currentData: registryTag,
    isFetching: registryTagIsFetching,
    error: renkuRegistryTagError,
  } = projectGitLabApi.useGetRegistryTagQuery(
    gitLabProjectId && registry && tag
      ? {
          projectId: gitLabProjectId,
          registryId: registry.id,
          tag,
        }
      : skipToken
  );

  return {
    registry,
    registryTag,
    isFetchingData:
      renkuRegistryIsFetching ||
      registryTagIsFetching ||
      backendAvailable === undefined ||
      coreSupportComputed === undefined ||
      resourcePoolsIsFetching ||
      isLoadingProjectConfig,
    error: renkuRegistryError || renkuRegistryTagError,
    projectConfig,
    commits,
    branch: defaultBranch,
    templateName,
    resourcePools,
    isProjectSupported: isSupported,
  };
}
