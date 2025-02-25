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
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import useDefaultBranchOption from "../../session/hooks/options/useDefaultBranchOption.hook";
import useDefaultCommitOption from "../../session/hooks/options/useDefaultCommitOption.hook";
import {
  ProjectMetadataParams,
  useGetConfigQuery,
  useProjectMetadataMutation,
} from "../projectCoreApi";
import projectGitLabApi, {
  useGetAllRepositoryBranchesQuery,
  useGetAllRepositoryCommitsQuery,
} from "../projectGitLab.api";
import { useCoreSupport } from "../useProjectCoreSupport";

export function useGetDockerImage() {
  const defaultBranch = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const projectRepositoryUrl = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
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

  const { data: projectConfig } = useGetConfigQuery(
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

  const [projectMetadata, projectMetadataStatus] = useProjectMetadataMutation();

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
      projectMetadata(params);
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
      !backendAvailable ||
      !coreSupportComputed,
    error: renkuRegistryError || renkuRegistryTagError,
    projectConfig,
    commits,
    branch: defaultBranch,
    templateName,
  };
}
