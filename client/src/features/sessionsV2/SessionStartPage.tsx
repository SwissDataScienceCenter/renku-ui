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
import cx from "classnames";
import { useEffect, useMemo, useState } from "react";
import {
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";

import PageLoader from "../../components/PageLoader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  StepsProgressBar,
} from "../../components/progress/ProgressSteps";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetResourcePoolsQuery } from "../dataServices/dataServices.api";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetProjectsByNamespaceAndSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { useGetStoragesV2Query } from "../projectsV2/api/storagesV2.api.ts";
import {
  useGetDockerImageQuery,
  useStartRenku2SessionMutation,
} from "../session/sessions.api";
import { SESSION_CI_PIPELINE_POLLING_INTERVAL_MS } from "../session/startSessionOptions.constants";
import { DockerImageStatus } from "../session/startSessionOptions.types";
import {
  useGetProjectSessionLaunchersQuery,
  useGetSessionEnvironmentsQuery,
} from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants.ts";

export default function SessionStartPage() {
  const { launcherId, namespace, slug } = useParams<
    "launcherId" | "namespace" | "slug"
  >();
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectsByNamespaceAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id ?? "";

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

  return <StartSessionFromLauncher launcher={launcher} project={project} />;
}

interface StartSessionFromLauncherProps {
  launcher: SessionLauncher;
  project: Project;
}

function StartSessionFromLauncher({
  launcher,
  project,
}: StartSessionFromLauncherProps) {
  const { environment_kind, default_url } = launcher;

  const navigate = useNavigate();

  const [steps, setSteps] = useState<StepsProgressBar[]>([]);

  const { data: environments } = useGetSessionEnvironmentsQuery(
    environment_kind === "global_environment" ? undefined : skipToken
  );
  const environment = useMemo(
    () =>
      launcher.environment_kind === "global_environment" &&
      environments?.find((env) => env.id === launcher.environment_id),
    [environments, launcher]
  );
  const {
    data: storages,
    isFetching: isFetchingStorages,
    isLoading: isLoadingStorages,
  } = useGetStoragesV2Query({
    projectId: project.id,
  });

  const containerImage =
    environment_kind === "global_environment" && environment
      ? environment.container_image
      : environment_kind === "global_environment"
      ? "unknown"
      : launcher.container_image;

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
  const { data: resourcePools } = useGetResourcePoolsQuery({});

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
  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap(({ classes }) => classes)
        .find((c) => c.id === startSessionOptionsV2.sessionClass) ?? null,
    [resourcePools, startSessionOptionsV2.sessionClass]
  );

  const dispatch = useAppDispatch();

  const [
    startSession,
    { data: session, error, isLoading: isLoadingStartSession },
  ] = useStartRenku2SessionMutation();

  // Reset start session options slice when we navigate away
  useEffect(() => {
    return () => {
      dispatch(startSessionOptionsV2Slice.actions.reset());
    };
  }, [dispatch]);

  // Set the default URL
  useEffect(() => {
    const defaultUrl = default_url
      ? default_url
      : environment && environment.default_url
      ? environment.default_url
      : "/lab";

    if (startSessionOptionsV2.defaultUrl !== defaultUrl) {
      dispatch(startSessionOptionsV2Slice.actions.setDefaultUrl(defaultUrl));
    }
  }, [environment, default_url, dispatch, startSessionOptionsV2.defaultUrl]);

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

  // Select default session class
  useEffect(() => {
    if (resourcePools == null) {
      return;
    }

    const initialSessionClassId =
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id && c.matching)?.id ??
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.matching)?.id ??
      0;

    if (initialSessionClassId == 0) {
      // TODO: propagate error
      return;
    }

    dispatch(
      startSessionOptionsV2Slice.actions.setSessionClass(initialSessionClassId)
    );
  }, [defaultSessionClass?.id, dispatch, resourcePools]);

  // Select default storage
  useEffect(() => {
    if (currentSessionClass == null) {
      return;
    }
    dispatch(
      startSessionOptionsV2Slice.actions.setStorage(
        currentSessionClass.default_storage
      )
    );
  }, [currentSessionClass, dispatch]);

  // Request session
  useEffect(() => {
    if (
      startSessionOptionsV2.dockerImageStatus !== "available" ||
      resourcePools == null ||
      startSessionOptionsV2.sessionClass == 0 ||
      isLoadingStorages ||
      isFetchingStorages
    ) {
      return;
    }

    startSession({
      projectId: project.id,
      launcherId: launcher.id,
      repositories: startSessionOptionsV2.repositories,
      cloudStorage:
        storages?.map(
          // (storage) => storage.storage as unknown as SessionCloudStorage
          (storage) => storage.storage
        ) || [],
      defaultUrl: startSessionOptionsV2.defaultUrl,
      environmentVariables: {},
      image: containerImage,
      lfsAutoFetch: false,
      sessionClass: startSessionOptionsV2.sessionClass,
      storage: startSessionOptionsV2.storage,
    });
  }, [
    containerImage,
    isFetchingStorages,
    isLoadingStorages,
    launcher.id,
    project.id,
    resourcePools,
    startSession,
    startSessionOptionsV2,
    storages,
  ]);

  // Navigate to the session page when it is ready
  useEffect(() => {
    if (session != null) {
      const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
        namespace: project.namespace,
        slug: project.slug,
        session: session.name,
      });
      navigate(url, {
        state: { redirectFromStartServer: true, fromLanding: false },
      });
    }
  }, [navigate, project.namespace, project.slug, session]);

  // Update the loading steps UI
  useEffect(() => {
    if (
      startSessionOptionsV2.dockerImageStatus !== "available" ||
      resourcePools == null ||
      startSessionOptionsV2.sessionClass == 0
    ) {
      setSteps([
        {
          id: 0,
          status: StatusStepProgressBar.EXECUTING,
          step: "Loading session configuration",
        },
        {
          id: 1,
          status: StatusStepProgressBar.WAITING,
          step: "Requesting session",
        },
      ]);
      return;
    }

    setSteps([
      {
        id: 0,
        status: StatusStepProgressBar.READY,
        step: "Loading session configuration",
      },
      {
        id: 1,
        status: error
          ? StatusStepProgressBar.FAILED
          : isLoadingStartSession
          ? StatusStepProgressBar.EXECUTING
          : StatusStepProgressBar.READY,
        step: "Requesting session",
      },
    ]);
  }, [error, isLoadingStartSession, resourcePools, startSessionOptionsV2]);

  return (
    <div>
      {error && <RtkErrorAlert error={error} dismissible={false} />}

      <div className={cx("progress-box-small", "progress-box-small--steps")}>
        <ProgressStepsIndicator
          description="Preparing to start session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title={`Starting session ${launcher.name}`}
          status={steps}
        />
      </div>
    </div>
  );
}
