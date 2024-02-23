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
import { useContext, useEffect, useMemo } from "react";
import {
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import PageLoader from "../../components/PageLoader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetResourcePoolsQuery } from "../dataServices/dataServices.api";
import { useGetAllRepositoryCommitsQuery } from "../project/projectGitLab.api";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdQuery } from "../projectsV2/api/projectV2.enhanced-api";
import useDefaultCommitOption from "../session/hooks/options/useDefaultCommitOption.hook";
import useDefaultSessionClassOption from "../session/hooks/options/useDefaultSessionClassOption.hook";
import {
  useGetDockerImageQuery,
  useStartSessionMutation,
} from "../session/sessions.api";
import { SESSION_CI_PIPELINE_POLLING_INTERVAL_MS } from "../session/startSessionOptions.constants";
import { DockerImageStatus } from "../session/startSessionOptions.types";
import {
  setBranch,
  setDefaultUrl,
  setDockerImageStatus,
  setPinnedDockerImage,
  setStorage,
  startSessionOptionsSlice,
} from "../session/startSessionOptionsSlice";
import ProjectSessionConfigContext, {
  ProjectSessionConfig,
  ProjectSessionConfigContextProvider,
} from "./ProjectSessionConfig.context";
import {
  useGetProjectSessionLaunchersQuery,
  useGetSessionEnvironmentsQuery,
} from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";

export default function SessionStartPage() {
  const { id: projectId, launcherId } = useParams<"id" | "launcherId">();

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectsByProjectIdQuery({
    projectId: projectId ?? "",
  });
  const {
    data: launchers,
    isLoading: isLoadingLaunchers,
    error: launchersError,
  } = useGetProjectSessionLaunchersQuery({ projectId: projectId ?? "" });

  const isLoading = isLoadingProject || isLoadingLaunchers;
  const error = projectError || launchersError;

  const launcher = useMemo(
    () => launchers?.find(({ id }) => id === launcherId),
    [launcherId, launchers]
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(startSessionOptionsSlice.actions.reset());
  }, [dispatch]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div>
        <RtkErrorAlert error={error} dismissible={false} />
      </div>
    );
  }

  if (launcher == null || project == null) {
    return (
      <div>
        <h1 className="fs-5">Error: session not found</h1>
        <p>This sessions configuration does not seem to exist.</p>
      </div>
    );
  }

  return (
    <ProjectSessionConfigContextProvider project={project}>
      <StartSessionFromLauncher launcher={launcher} project={project} />
    </ProjectSessionConfigContextProvider>
  );
}

interface StartSessionFromLauncherProps {
  launcher: SessionLauncher;
  project: Project;
}

function StartSessionFromLauncher({
  launcher,
  project,
}: StartSessionFromLauncherProps) {
  const { isLoading, supportsSessions, sessionConfiguration } = useContext(
    ProjectSessionConfigContext
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (!supportsSessions) {
    return <p>boo</p>;
  }

  return (
    <SessionStartWithConfiguration
      launcher={launcher}
      project={project}
      sessionConfiguration={sessionConfiguration}
    />
  );
}

interface SessionStartWithConfigurationProps {
  launcher: SessionLauncher;
  project: Project;
  sessionConfiguration: Exclude<
    ProjectSessionConfig["sessionConfiguration"],
    undefined | null
  >;
}

function SessionStartWithConfiguration({
  launcher,
  sessionConfiguration,
}: SessionStartWithConfigurationProps) {
  const { environment_kind } = launcher;

  const { defaultBranch, namespace, projectName, repositoryMetadata } =
    sessionConfiguration;
  const gitLabProjectId = repositoryMetadata.id;

  const navigate = useNavigate();

  const {
    data: environments,
    //  isLoading
  } = useGetSessionEnvironmentsQuery(
    environment_kind === "global_environment" ? undefined : skipToken
  );
  const environment = useMemo(
    () =>
      launcher.environment_kind === "global_environment" &&
      environments?.find((env) => env.id === launcher.environment_id),
    [environments, launcher]
  );

  const containerImage =
    environment_kind === "global_environment" && environment
      ? environment.container_image
      : environment_kind === "global_environment"
      ? "unknown"
      : launcher.container_image;

  const startSessionOptions = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );

  const {
    data: commits,
    // isFetching: commitsIsFetching
  } = useGetAllRepositoryCommitsQuery(
    startSessionOptions.branch
      ? {
          branch: defaultBranch,
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
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
          startSessionOptions.dockerImageStatus === "not-available"
            ? SESSION_CI_PIPELINE_POLLING_INTERVAL_MS
            : 0,
      }
    );
  const {
    data: resourcePools,
    // isFetching: resourcePoolsIsFetching
  } = useGetResourcePoolsQuery({});

  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap(({ classes }) => classes)
        .find((c) => c.id === startSessionOptions.sessionClass) ?? null,
    [resourcePools, startSessionOptions.sessionClass]
  );

  const dispatch = useAppDispatch();

  const [
    startSession,
    {
      data: session,
      error,
      //  isLoading: isLoadingStartSession
    },
  ] = useStartSessionMutation();

  // Reset start session options slice when we navigate away
  useEffect(() => {
    return () => {
      dispatch(startSessionOptionsSlice.actions.reset());
    };
  }, [dispatch]);

  // Select default options
  useDefaultCommitOption({ commits });
  useDefaultSessionClassOption({ resourcePools });

  useEffect(() => {
    dispatch(setBranch(defaultBranch));
  }, [defaultBranch, dispatch]);

  // TODO: support other URLs?
  useEffect(() => {
    dispatch(setDefaultUrl("/lab"));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setPinnedDockerImage(containerImage));
  }, [containerImage, dispatch]);

  useEffect(() => {
    if (currentSessionClass == null) {
      return;
    }
    dispatch(setStorage(currentSessionClass.default_storage));
  }, [currentSessionClass, dispatch]);

  // Set the image status
  useEffect(() => {
    const newStatus: DockerImageStatus = isLoadingDockerImageStatus
      ? "unknown"
      : dockerImageStatus == null
      ? "not-available"
      : dockerImageStatus.available
      ? "available"
      : "not-available";
    if (newStatus !== startSessionOptions.dockerImageStatus) {
      dispatch(setDockerImageStatus(newStatus));
    }
  }, [
    dispatch,
    dockerImageStatus,
    isLoadingDockerImageStatus,
    startSessionOptions.dockerImageStatus,
  ]);

  // Request session
  useEffect(() => {
    if (
      commits == null ||
      startSessionOptions.dockerImageStatus !== "available" ||
      resourcePools == null ||
      startSessionOptions.sessionClass == 0
    ) {
      return;
    }
    startSession({
      branch: defaultBranch,
      cloudStorage: [],
      commit: startSessionOptions.commit,
      defaultUrl: startSessionOptions.defaultUrl,
      environmentVariables: {},
      image: startSessionOptions.pinnedDockerImage,
      lfsAutoFetch: false,
      namespace,
      project: projectName,
      sessionClass: startSessionOptions.sessionClass,
      storage: startSessionOptions.storage,
    });
  }, [
    commits,
    defaultBranch,
    namespace,
    projectName,
    resourcePools,
    startSession,
    startSessionOptions,
  ]);

  // Navigate to the session page when it is ready
  useEffect(() => {
    if (session != null) {
      const url = generatePath(
        "/projects/:namespace/:projectName/sessions/show/:session",
        {
          namespace,
          projectName,
          session: session.name,
        }
      );
      navigate(url, {
        state: { redirectFromStartServer: true, fromLanding: false },
      });
    }
  }, [namespace, navigate, projectName, session]);

  return (
    <div>
      {error && <RtkErrorAlert error={error} dismissible={false} />}

      <pre>{JSON.stringify(startSessionOptions, null, 2)}</pre>
    </div>
  );
}
