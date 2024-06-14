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
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../dataServices/dataServices.api";
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
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { XLg } from "react-bootstrap-icons";
import { Loader } from "../../components/Loader.tsx";
import { ResourceClass } from "../dataServices/dataServices.types.ts";
import { SingleValue } from "react-select";
import { ErrorAlert } from "../../components/Alert.jsx";
import { SessionClassSelector } from "../session/components/options/SessionClassOption.tsx";
import {
  SessionLauncherResources,
  SessionRowResourceRequests,
} from "../session/components/SessionsList.tsx";

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
  const [modalPendingInformation, setModalPendingInformation] =
    useState<boolean>(false);
  const [currentSessionClass, setCurrentSessionClass] =
    useState<ResourceClass>();

  const { data: environments } = useGetSessionEnvironmentsQuery(
    environment_kind === "global_environment" ? undefined : skipToken
  );
  // testing code
  const { data: launcherClass, isLoading: isLoadingLauncherClass } =
    useGetResourceClassByIdQuery(launcher?.resource_class_id ?? skipToken);
  const environment = useMemo(
    () =>
      launcher.environment_kind === "global_environment" &&
      environments?.find((env) => env.id === launcher.environment_id),
    [environments, launcher]
  );

  const cancelLaunchSession = () => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  };

  const onReadyPendingInformation = (envClass: ResourceClass) => {
    if (envClass) {
      setCurrentSessionClass(envClass);
    }
  };

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

  // set manual session class
  useEffect(() => {
    if (currentSessionClass)
      dispatch(
        startSessionOptionsV2Slice.actions.setSessionClass(
          currentSessionClass?.id
        )
      );
  }, [currentSessionClass, dispatch]);
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
    if (resourcePools == null || isLoadingLauncherClass) {
      return;
    }
    const initialSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id == launcherClass?.id && c.matching);

    if (!initialSessionClass && !currentSessionClass) {
      setModalPendingInformation(true);
      return;
    }
    if (initialSessionClass?.id == 0) {
      // TODO: propagate error
      return;
    }

    if (initialSessionClass) setCurrentSessionClass(initialSessionClass);
  }, [
    resourcePools,
    currentSessionClass,
    launcherClass,
    isLoadingLauncherClass,
  ]);

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
    setModalPendingInformation(false);
  }, [currentSessionClass, dispatch]);

  // Request session
  useEffect(() => {
    if (
      startSessionOptionsV2.dockerImageStatus !== "available" ||
      resourcePools == null ||
      startSessionOptionsV2.sessionClass == 0 ||
      isLoadingStorages ||
      isFetchingStorages ||
      !currentSessionClass
    ) {
      return;
    }

    startSession({
      projectId: project.id,
      launcherId: launcher.id,
      repositories: startSessionOptionsV2.repositories,
      cloudStorage: storages?.map((storage) => storage.storage) || [],
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
    currentSessionClass,
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

  // TODO: evaluate if user find useful see the resources of the launcher class
  const requiredValues: SessionLauncherResources | undefined =
    launcherClass && {
      name: launcherClass.name,
      cpu: launcherClass.cpu,
      memory: launcherClass.memory,
      gpu: launcherClass.gpu,
      storage: launcherClass.max_storage,
    };

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
        <PendingSessionDataModal
          isOpen={modalPendingInformation}
          onCancel={cancelLaunchSession}
          requiredValues={requiredValues}
          onContinue={onReadyPendingInformation}
        />
      </div>
    </div>
  );
}

interface PendingSessionDataModalProps {
  isOpen: boolean;
  onContinue: (env: ResourceClass) => void;
  onCancel: () => void;
  requiredValues?: SessionLauncherResources;
}
function PendingSessionDataModal({
  isOpen,
  onContinue,
  onCancel,
  requiredValues,
}: PendingSessionDataModalProps) {
  const {
    data: resourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery({});

  const [currentSessionClass, setCurrentSessionClass] = useState<
    ResourceClass | undefined
  >(undefined);

  const onChange = useCallback((newValue: SingleValue<ResourceClass>) => {
    if (newValue) {
      setCurrentSessionClass(newValue);
    }
  }, []);

  const onClick = useCallback(() => {
    if (currentSessionClass) {
      onContinue(currentSessionClass);
    }
  }, [currentSessionClass, onContinue]);

  const selector = isLoading ? (
    <div className="form-label">
      <Loader className="me-1" inline size={16} />
      Fetching available resource pools...
    </div>
  ) : !resourcePools || resourcePools.length == 0 || isError ? (
    <ErrorAlert dismissible={false}>
      <h3 className={cx("fs-6", "fw-bold")}>
        Error on loading available session resource pools
      </h3>
      <p className="mb-0">
        Modifying the session is not possible at the moment. You can try to{" "}
        <a
          className={cx("btn", "btn-sm", "btn-primary", "mx-1")}
          href={window.location.href}
          onClick={() => window.location.reload()}
        >
          reload the page
        </a>
        .
      </p>
    </ErrorAlert>
  ) : (
    <SessionClassSelector
      resourcePools={resourcePools}
      currentSessionClass={currentSessionClass}
      onChange={onChange}
    />
  );

  return (
    <Modal centered isOpen={isOpen} size="lg">
      <ModalHeader className={cx("fw-bold")}>
        Pending data to launch session
      </ModalHeader>
      <ModalBody className="pt-0">
        <p className={cx("mb-0", "pb-3")}>
          You do not have access to the resource pool class assigned to this
          session launcher. Please select one of your available resource pool
          classes to continue.
        </p>
        {currentSessionClass && (
          <p>
            <span className="fw-bold me-3">Original requested resources:</span>
            <span>
              <SessionRowResourceRequests resourceRequests={requiredValues} />
            </span>
          </p>
        )}
        <div className="field-group">{selector}</div>
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button className="ms-2 btn-outline-rk-green" onClick={onCancel}>
          <XLg className={cx("bi", "me-1")} />
          Cancel launch
        </Button>
        <Button
          className="ms-2 btn-rk-green"
          disabled={!currentSessionClass}
          onClick={onClick}
        >
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}
