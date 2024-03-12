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
 * limitations under the License.
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { ReactNode, createContext, useEffect, useMemo, useState } from "react";

import type { GitlabProjectResponse } from "../project/GitLab.types";
import { useGetProjectByPathQuery } from "../project/projectGitLab.api";
import type { Project } from "../projectsV2/api/projectV2.api";

// TODO: support multi-repos

export type ProjectSessionConfig = {
  isUninitialized: boolean;
  isLoading: boolean;
} & (
  | {
      supportsSessions: false;
      hasRepositories?: undefined;
      sessionConfiguration?: undefined;
    }
  | {
      supportsSessions: true;
      hasRepositories: false;
      sessionConfiguration?: undefined;
    }
  | {
      supportsSessions: true;
      hasRepositories: true;
      sessionConfiguration: SessionConfig;
    }
);

interface SessionConfig {
  defaultBranch: string;
  namespace: string;
  projectName: string;
  repositoryMetadata: GitlabProjectResponse;
}

/**
 * Context which defines whether or not a Renku 1.0 project supports
 * launching sessions.
 */
const ProjectSessionConfigContext = createContext<ProjectSessionConfig>({
  isUninitialized: true,
  isLoading: false,
  supportsSessions: false,
});

export default ProjectSessionConfigContext;

interface ProjectSessionConfigContextProviderProps {
  project: Project;
  children?: ReactNode;
}

/**
 * Provides the correct project session config context.
 */
export function ProjectSessionConfigContextProvider({
  project,
  children,
}: ProjectSessionConfigContextProviderProps) {
  const [config, setConfig] = useState<ProjectSessionConfig>({
    isUninitialized: true,
    isLoading: false,
    supportsSessions: false,
  });

  const singleRepositoryRaw = useMemo(
    () =>
      project.repositories?.length != null && project.repositories.length > 0
        ? project.repositories[0]
        : null,
    [project.repositories]
  );

  const singleRepository = useMemo(
    () =>
      singleRepositoryRaw != null
        ? matchRepositoryUrl(singleRepositoryRaw)
        : null,
    [singleRepositoryRaw]
  );

  const { currentData, isFetching, isError } = useGetProjectByPathQuery(
    singleRepository ? singleRepository : skipToken
  );

  const matchedRepositoryMetadata = useMemo(
    () =>
      currentData != null
        ? matchRepositoryMetadata(project, currentData)
        : null,
    [currentData, project]
  );

  useEffect(() => {
    if (!singleRepository) {
      setConfig({
        isUninitialized: false,
        isLoading: false,
        supportsSessions: true,
        hasRepositories: false,
      });
    }
  }, [singleRepository]);

  useEffect(() => {
    if (isFetching) {
      setConfig({
        isUninitialized: false,
        isLoading: true,
        supportsSessions: false,
      });
    }
  }, [isFetching]);

  useEffect(() => {
    if (isError) {
      setConfig({
        isUninitialized: false,
        isLoading: false,
        supportsSessions: false,
      });
    }
  }, [isError]);

  useEffect(() => {
    if (currentData == null) {
      return;
    }

    if (matchedRepositoryMetadata) {
      const {
        default_branch: defaultBranch,
        namespace,
        path: projectName,
      } = matchedRepositoryMetadata;
      setConfig({
        isUninitialized: false,
        isLoading: false,
        supportsSessions: true,
        hasRepositories: true,
        sessionConfiguration: {
          defaultBranch,
          namespace: namespace.full_path,
          projectName,
          repositoryMetadata: matchedRepositoryMetadata,
        },
      });
    } else {
      setConfig({
        isUninitialized: false,
        isLoading: false,
        supportsSessions: false,
      });
    }
  }, [currentData, matchedRepositoryMetadata]);

  return (
    <ProjectSessionConfigContext.Provider value={config}>
      {children}
    </ProjectSessionConfigContext.Provider>
  );
}

function matchRepositoryUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const trimmedPath = url.pathname
      .replace(/^[/]/gi, "")
      .replace(/.git$/i, "");
    return trimmedPath ? trimmedPath : null;
  } catch (error) {
    return null;
  }
}

function matchRepositoryMetadata(
  project: Project,
  data: GitlabProjectResponse
) {
  if (
    project.repositories?.length == null ||
    project.repositories.length == 0
  ) {
    return null;
  }

  const repositoryUrl = `${project.repositories[0].replace(/.git$/i, "")}.git`;

  if (repositoryUrl !== data.http_url_to_repo) {
    return null;
  }
  return data;
}
