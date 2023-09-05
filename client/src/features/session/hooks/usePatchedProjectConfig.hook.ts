/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useMemo } from "react";
import { ProjectConfig } from "../../project/Project";
import { useGetConfigQuery } from "../../project/projectCoreApi";
import { useGetConfigFromRepositoryQuery } from "../../project/projectGitLab.api";

interface UsePatchedProjectConfigArgs {
  apiVersion: string | undefined;
  commit: string;
  gitLabProjectId: number;
  metadataVersion: number | undefined;
  projectRepositoryUrl: string;
  skip?: boolean;
}

// For starting new sessions, we need to read the configuration file directly
// from GitLab until renku-core is capable of providing the "config.show" API
// endpoint at a requested commit
export default function usePatchedProjectConfig({
  apiVersion,
  commit,
  gitLabProjectId,
  metadataVersion,
  projectRepositoryUrl,
  skip,
}: UsePatchedProjectConfigArgs) {
  const getConfigResult = useGetConfigQuery(
    {
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
    },
    { skip: skip || !commit }
  );
  const getConfigFromRepositoryResult = useGetConfigFromRepositoryQuery(
    { commit, projectId: gitLabProjectId ?? 0 },
    {
      skip: skip || !commit || !gitLabProjectId,
    }
  );

  const patchedData = useMemo(() => {
    if (!getConfigResult.data || !getConfigFromRepositoryResult.data) {
      return undefined;
    }

    const defaultUrl =
      getConfigFromRepositoryResult.data.config.sessions?.defaultUrl ??
      getConfigResult.data.config.sessions?.defaultUrl;
    const dockerImage =
      getConfigFromRepositoryResult.data.config.sessions?.dockerImage ??
      getConfigResult.data.config.sessions?.dockerImage;
    const lfsAutoFetch =
      getConfigFromRepositoryResult.data.config.sessions?.lfsAutoFetch ??
      getConfigResult.data.config.sessions?.lfsAutoFetch;
    const storage =
      getConfigFromRepositoryResult.data.config.sessions?.storage ??
      getConfigResult.data.config.sessions?.storage;

    const cpuRequest =
      getConfigFromRepositoryResult.data.config.sessions?.legacyConfig
        ?.cpuRequest ??
      getConfigResult.data.config.sessions?.legacyConfig?.cpuRequest;
    const gpuRequest =
      getConfigFromRepositoryResult.data.config.sessions?.legacyConfig
        ?.gpuRequest ??
      getConfigResult.data.config.sessions?.legacyConfig?.gpuRequest;
    const memoryRequest =
      getConfigFromRepositoryResult.data.config.sessions?.legacyConfig
        ?.memoryRequest ??
      getConfigResult.data.config.sessions?.legacyConfig?.memoryRequest;

    const patchedData: ProjectConfig = {
      ...getConfigResult.data,
      config: {
        sessions: {
          defaultUrl,
          dockerImage,
          lfsAutoFetch,
          storage,
          legacyConfig: {
            cpuRequest,
            gpuRequest,
            memoryRequest,
          },
        },
      },
    };
    return patchedData;
  }, [getConfigResult.data, getConfigFromRepositoryResult.data]);

  return {
    data: patchedData,
    error: getConfigResult.error ?? getConfigFromRepositoryResult.error,
    isError: getConfigResult.isError || getConfigFromRepositoryResult.isError,
    isFetching:
      getConfigResult.isFetching || getConfigFromRepositoryResult.isFetching,
    isLoading:
      getConfigResult.isLoading || getConfigFromRepositoryResult.isLoading,
    isSuccess:
      getConfigResult.isSuccess || getConfigFromRepositoryResult.isSuccess,
    isUninitialized:
      getConfigResult.isUninitialized ||
      getConfigFromRepositoryResult.isUninitialized,
  };
}
