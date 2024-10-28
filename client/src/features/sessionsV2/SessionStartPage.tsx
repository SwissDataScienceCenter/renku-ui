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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import {
  generatePath,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom-v5-compat";
import { ErrorAlert } from "../../components/Alert";
import PageLoader from "../../components/PageLoader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  StepsProgressBar,
} from "../../components/progress/ProgressSteps";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";

import { usePatchDataConnectorsByDataConnectorIdSecretsMutation } from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import { resetFavicon, setFavicon } from "../display";
import {
  storageDefinitionAfterSavingCredentialsFromConfig,
  storageDefinitionFromConfig,
} from "../project/utils/projectCloudStorage.utils";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetProjectsByNamespaceAndSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { storageSecretNameToFieldName } from "../secrets/secrets.utils";
import DataConnectorSecretsModal from "./DataConnectorSecretsModal";
import { SelectResourceClassModal } from "./components/SessionModals/SelectResourceClass";
import {
  useGetDockerImageQuery,
  useGetProjectSessionLaunchersQuery,
  useLaunchSessionMutation,
} from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import {
  SessionStartDataConnectorConfiguration,
  StartSessionOptionsV2,
} from "./startSessionOptionsV2.types";
import useSessionLaunchState from "./useSessionLaunchState.hook";

interface SaveCloudStorageProps
  extends Omit<StartSessionFromLauncherProps, "containerImage" | "project"> {
  startSessionOptionsV2: StartSessionOptionsV2;
}

function SaveCloudStorage({
  launcher,
  startSessionOptionsV2,
}: SaveCloudStorageProps) {
  const dispatch = useAppDispatch();
  const [steps, setSteps] = useState<StepsProgressBar[]>([]);
  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();

  const credentialsToSave = useMemo(() => {
    return startSessionOptionsV2.cloudStorage
      .filter(shouldCloudStorageSaveCredentials)
      .map((cs) => ({
        storageName: cs.dataConnector.name,
        storageId: cs.dataConnector.id,
        secrets: cs.sensitiveFieldValues,
      }));
  }, [startSessionOptionsV2.cloudStorage]);

  const [results, setResults] = useState<StatusStepProgressBar[]>(
    credentialsToSave.map(() => StatusStepProgressBar.WAITING)
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const theSteps = credentialsToSave.map((cs, i) => ({
      id: i,
      status: results[i],
      step: `Saving credentials for ${cs.storageName}`,
    }));
    setSteps(theSteps);
  }, [credentialsToSave, results]);

  // Save all the credentials that need to be saved
  useEffect(() => {
    if (credentialsToSave.length < 1 || index >= credentialsToSave.length)
      return;
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = StatusStepProgressBar.EXECUTING;
      return newResults;
    });
    const storage = credentialsToSave[index];
    saveCredentials({
      dataConnectorId: storage.storageId,
      dataConnectorSecretPatchList: Object.entries(storage.secrets).map(
        ([key, value]) => ({
          name: key,
          value,
        })
      ),
    });
  }, [credentialsToSave, index, saveCredentials]);

  useEffect(() => {
    if (
      saveCredentialsResult.isUninitialized ||
      saveCredentialsResult.isLoading
    )
      return;
    if (saveCredentialsResult.data != null) {
      setResults((prev) => {
        const newResults = [...prev];
        newResults[index] = StatusStepProgressBar.READY;
        return newResults;
      });
    }
    if (saveCredentialsResult.error != null) {
      setResults((prev) => {
        const newResults = [...prev];
        newResults[index] = StatusStepProgressBar.FAILED;
        return newResults;
      });
    }
    saveCredentialsResult.reset();
    setIndex((prev) => prev + 1);
  }, [index, saveCredentialsResult]);

  useEffect(() => {
    if (saveCredentialsResult.isLoading) return;
    if (index >= credentialsToSave.length) {
      const cloudStorageConfigs = startSessionOptionsV2.cloudStorage.map((cs) =>
        storageDefinitionAfterSavingCredentialsFromConfig(cs)
      );
      dispatch(
        startSessionOptionsV2Slice.actions.setCloudStorage(cloudStorageConfigs)
      );
    }
  }, [
    dispatch,
    credentialsToSave,
    index,
    saveCredentialsResult,
    startSessionOptionsV2.cloudStorage,
  ]);

  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressStepsIndicator
        description="Saving credentials..."
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title={`Starting session ${launcher.name}`}
        status={steps}
      />
    </div>
  );
}

interface SessionStartingProps extends StartSessionFromLauncherProps {
  containerImage: string;
  startSessionOptionsV2: StartSessionOptionsV2;
}

function SessionStarting({
  containerImage,
  launcher,
  project,
  startSessionOptionsV2,
}: SessionStartingProps) {
  const [steps, setSteps] = useState<StepsProgressBar[]>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [
    startSessionV2,
    { data: session, error: error, isLoading: isLoadingStartSession, isError },
  ] = useLaunchSessionMutation();

  // Request session
  useEffect(() => {
    if (isLoadingStartSession || session != null || isError) return;
    startSessionV2({
      launcher_id: launcher.id,
      disk_storage: startSessionOptionsV2.storage,
      resource_class_id: startSessionOptionsV2.sessionClass,
      cloudstorage: startSessionOptionsV2.cloudStorage.map((cs) =>
        storageDefinitionFromConfig(cs)
      ),
    });
    dispatch(setFavicon("waiting"));
  }, [
    containerImage,
    isLoadingStartSession,
    launcher.id,
    project.id,
    startSessionV2,
    startSessionOptionsV2.storage,
    startSessionOptionsV2.sessionClass,
    startSessionOptionsV2.cloudStorage,
    dispatch,
    session,
    isError,
  ]);

  useEffect(() => {
    if (isError) dispatch(setFavicon("error"));
  }, [isError, dispatch]);

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
  }, [error, isLoadingStartSession, startSessionOptionsV2]);

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

function doesCloudStorageNeedCredentials(
  config: SessionStartDataConnectorConfiguration
) {
  if (config.active === false) return false;
  const sensitiveFields = Object.keys(config.sensitiveFieldValues);
  const credentialFieldDict = config.savedCredentialFields
    ? Object.fromEntries(
        config.savedCredentialFields?.map((field) => [
          storageSecretNameToFieldName({ name: field }),
          true,
        ])
      )
    : {};
  if (sensitiveFields.every((key) => credentialFieldDict[key] != null))
    return false;
  return Object.values(config.sensitiveFieldValues).some(
    (value) => value === ""
  );
}

function shouldCloudStorageSaveCredentials(
  config: SessionStartDataConnectorConfiguration
) {
  return config.saveCredentials;
}

interface StartSessionWithCloudStorageModalProps
  extends Omit<SessionStartingProps, "cloudStorages"> {
  cloudStorageConfigs: Omit<
    SessionStartDataConnectorConfiguration,
    "sensitiveFields"
  >[];
}

function StartSessionWithCloudStorageModal({
  containerImage,
  launcher,
  project,
  startSessionOptionsV2,
  cloudStorageConfigs,
}: StartSessionWithCloudStorageModalProps) {
  const [showDataConnectorSecretsModal, setShowDataConnectorSecretsModal] =
    useState<boolean>(false);
  const dispatch = useAppDispatch();

  const configsWithCredentials = useMemo(
    () =>
      cloudStorageConfigs.filter(
        (config) => !doesCloudStorageNeedCredentials(config)
      ),
    [cloudStorageConfigs]
  );

  const configsNeedingCredentials = useMemo(
    () =>
      cloudStorageConfigs.filter((config) =>
        doesCloudStorageNeedCredentials(config)
      ),
    [cloudStorageConfigs]
  );

  useEffect(() => {
    if (configsNeedingCredentials.length > 0)
      setShowDataConnectorSecretsModal(true);
  }, [configsNeedingCredentials]);

  const onStart = useCallback(
    (configs: DataConnectorConfiguration[]) => {
      setShowDataConnectorSecretsModal(false);
      const changedCloudStorageConfigs = configs;
      const cloudStorageConfigs = [
        ...configsWithCredentials,
        ...changedCloudStorageConfigs,
      ];
      dispatch(
        startSessionOptionsV2Slice.actions.setCloudStorage(cloudStorageConfigs)
      );
    },
    [dispatch, configsWithCredentials]
  );

  const steps = [
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
  ];

  const navigate = useNavigate();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);

  if (configsNeedingCredentials.length === 0) {
    return (
      <SessionStarting
        containerImage={containerImage}
        launcher={launcher}
        project={project}
        startSessionOptionsV2={startSessionOptionsV2}
      />
    );
  }

  return (
    <div>
      <div className={cx("progress-box-small", "progress-box-small--steps")}>
        <ProgressStepsIndicator
          description="Preparing to start session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title={`Starting session ${launcher.name}`}
          status={steps}
        />
        <DataConnectorSecretsModal
          isOpen={showDataConnectorSecretsModal}
          onCancel={onCancel}
          onStart={onStart}
          dataConnectorConfigs={configsNeedingCredentials}
        />
      </div>
    </div>
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
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const hasCustomQuery = searchParams.has("custom");
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: project.namespace,
    slug: project.slug,
  });
  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );
  const {
    containerImage,
    isFetchingOrLoadingStorages,
    isPendingResourceClass,
    setResourceClass,
  } = useSessionLaunchState({
    launcher,
    project,
    isCustomLaunch: hasCustomQuery,
  });

  const {
    isLoading: isLoadingDockerImageStatus,
    isFetching: isFetchingDockerImageStatus,
    isError: isErrorDockerImageStatus,
    error: errorDockerImageStatus,
  } = useGetDockerImageQuery(
    { image_url: containerImage },
    { skip: !containerImage }
  );

  const needsCredentials = startSessionOptionsV2.cloudStorage?.some(
    doesCloudStorageNeedCredentials
  );

  const shouldSaveCredentials = startSessionOptionsV2.cloudStorage?.some(
    shouldCloudStorageSaveCredentials
  );

  const allDataFetched =
    !isLoadingDockerImageStatus &&
    !isFetchingDockerImageStatus &&
    !isErrorDockerImageStatus &&
    containerImage &&
    startSessionOptionsV2.sessionClass !== 0 &&
    !isFetchingOrLoadingStorages;

  // set favicon during session launch
  useEffect(() => {
    if (!allDataFetched || needsCredentials) {
      dispatch(setFavicon("waiting"));
    }
    return () => {
      // cleanup and set favicon to default
      dispatch(resetFavicon());
    };
  }, [allDataFetched, needsCredentials, dispatch]);

  const steps = [
    {
      id: 0,
      status: isErrorDockerImageStatus
        ? StatusStepProgressBar.FAILED
        : StatusStepProgressBar.EXECUTING,
      step: "Loading session configuration",
    },
    {
      id: 1,
      status: isErrorDockerImageStatus
        ? StatusStepProgressBar.CANCELED
        : StatusStepProgressBar.WAITING,
      step: "Requesting session",
    },
  ];

  // Handle docker image error
  if (isErrorDockerImageStatus) {
    return (
      <ShowContainerImageError
        error={errorDockerImageStatus}
        launcherName={launcher.name}
        steps={steps}
        containerImage={containerImage}
        projectUrl={projectUrl}
      />
    );
  }

  // Handle all data fetched and no credentials needed
  if (allDataFetched && !needsCredentials) {
    return shouldSaveCredentials ? (
      <SaveCloudStorage
        launcher={launcher}
        startSessionOptionsV2={startSessionOptionsV2}
      />
    ) : (
      <SessionStarting
        containerImage={containerImage}
        launcher={launcher}
        project={project}
        startSessionOptionsV2={startSessionOptionsV2}
      />
    );
  }

  // Handle all data fetched and credentials needed
  if (allDataFetched && needsCredentials) {
    return (
      <StartSessionWithCloudStorageModal
        cloudStorageConfigs={startSessionOptionsV2.cloudStorage}
        containerImage={containerImage}
        launcher={launcher}
        project={project}
        startSessionOptionsV2={startSessionOptionsV2}
      />
    );
  }

  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressStepsIndicator
        description="Preparing to start session"
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title={`Starting session ${launcher.name}`}
        status={steps}
      />
      <SelectResourceClassModal
        isOpen={isPendingResourceClass}
        resourceClassId={launcher.resource_class_id}
        onContinue={setResourceClass}
        isCustom={hasCustomQuery}
        projectUrl={projectUrl}
      />
    </div>
  );
}

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

function ShowContainerImageError({
  error,
  launcherName,
  steps,
  containerImage,
  projectUrl,
}: {
  error: FetchBaseQueryError | SerializedError;
  launcherName: string;
  steps: StepsProgressBar[];
  containerImage: string;
  projectUrl: string;
}) {
  if (!("status" in error)) {
    return false;
  }

  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressStepsIndicator
        description="Preparing to start session"
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title={`Starting session ${launcherName}`}
        status={steps}
      />
      <ErrorAlert dismissible={false}>
        <h5>Error loading container image</h5>
        <p className="mb-0">
          Error retrieving container image <code>{containerImage}</code>.
          {error?.status === 404
            ? " The image may not exist or is still being built."
            : " Please verify the container image and try again."}
        </p>
      </ErrorAlert>
      <Link to={projectUrl} className={cx("btn", "btn-primary")}>
        <ArrowLeft className={cx("me-2", "text-icon")} />
        Return to project page
      </Link>
    </div>
  );
}
