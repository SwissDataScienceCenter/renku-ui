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
  useSearchParams,
} from "react-router";
import PageLoader from "../../components/PageLoader";
import {
  RtkErrorAlert,
  RtkOrNotebooksError,
} from "../../components/errors/RtkErrorAlert";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  StepsProgressBar,
} from "../../components/progress/ProgressSteps";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import { usePatchDataConnectorsByDataConnectorIdSecretsMutation } from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import { resetFavicon, setFavicon } from "../display";
import {
  storageDefinitionAfterSavingCredentialsFromConfig,
  storageDefinitionFromConfig,
} from "../project/utils/projectCloudStorage.utils";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { storageSecretNameToFieldName } from "../secretsV2/secrets.utils";
import DataConnectorSecretsModal from "./DataConnectorSecretsModal";
import SessionImageModal from "./SessionImageModal";
import SessionSecretsModal from "./SessionSecretsModal";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import { useGetProjectsByProjectIdSessionLaunchersQuery as useGetProjectSessionLaunchersQuery } from "./api/sessionLaunchersV2.api";
import { usePostSessionsMutation as useLaunchSessionMutation } from "./api/sessionsV2.api";
import { SelectResourceClassModal } from "./components/SessionModals/SelectResourceClass";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "./session.constants";
import { validateEnvVariableName } from "./session.utils";
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
      ? startSessionOptionsV2.cloudStorage
          .filter(shouldCloudStorageSaveCredentials)
          .map((cs) => ({
            storageName: cs.dataConnector.name,
            storageId: cs.dataConnector.id,
            secrets: cs.sensitiveFieldValues,
          }))
      : [];
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
    if (saveCredentialsResult.isLoading || !startSessionOptionsV2.cloudStorage)
      return;
    if (index >= credentialsToSave.length) {
      const cloudStorageConfigs = startSessionOptionsV2.cloudStorage?.map(
        (cs) => storageDefinitionAfterSavingCredentialsFromConfig(cs)
      );
      if (cloudStorageConfigs)
        dispatch(
          startSessionOptionsV2Slice.actions.setCloudStorage(
            cloudStorageConfigs
          )
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
        title={`Launching session ${launcher.name}`}
        status={steps}
      />
    </div>
  );
}

function SessionStarting({ launcher, project }: StartSessionFromLauncherProps) {
  const [steps, setSteps] = useState<StepsProgressBar[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );

  const [
    startSessionV2,
    { data: session, error: error, isLoading: isLoadingStartSession, isError },
  ] = useLaunchSessionMutation();

  const launcherToStart = useMemo(() => {
    return {
      launcher_id: launcher.id,
      disk_storage: startSessionOptionsV2.storage,
      resource_class_id: startSessionOptionsV2.sessionClass,
      cloudstorage: startSessionOptionsV2.cloudStorage
        ?.filter(({ active }) => active)
        .map((cs) => storageDefinitionFromConfig(cs)),
      env_variable_overrides: Array.from(searchParams)
        .filter(([name]) => validateEnvVariableName(name) === true)
        .map(([name, value]) => ({
          name,
          value,
        })),
    };
  }, [
    launcher.id,
    startSessionOptionsV2.storage,
    startSessionOptionsV2.sessionClass,
    startSessionOptionsV2.cloudStorage,
    searchParams,
  ]);

  // Request session
  useEffect(() => {
    if (isLoadingStartSession || session != null || isError) return;
    startSessionV2({
      sessionPostRequest: launcherToStart,
    });
    dispatch(setFavicon("waiting"));
  }, [
    isLoadingStartSession,
    startSessionV2,
    dispatch,
    session,
    isError,
    launcherToStart,
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
          title={`Launching session ${launcher.name}`}
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
  extends Omit<StartSessionFromLauncherProps, "cloudStorages"> {
  cloudStorageConfigs: Omit<
    SessionStartDataConnectorConfiguration,
    "sensitiveFields"
  >[];
}

function StartSessionWithCloudStorageModal({
  launcher,
  project,
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

  return (
    <div>
      <div className={cx("progress-box-small", "progress-box-small--steps")}>
        <ProgressStepsIndicator
          description="Preparing to start session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title={`Launching session ${launcher.name}`}
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
  const hasCustomQuery = !!+(
    searchParams.get(CUSTOM_LAUNCH_SEARCH_PARAM) ?? ""
  );
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSaveCredentials, setShowSaveCredentials] = useState(false);
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
    isFetchingSessionSecrets,
    sessionSecretSlotsWithSecrets,
    isLoadingSessionImage,
    sessionImage,
  } = useSessionLaunchState({
    launcher,
    project,
    isCustomLaunch: hasCustomQuery,
  });

  const needsCredentials = startSessionOptionsV2.cloudStorage?.some(
    doesCloudStorageNeedCredentials
  );

  const shouldSaveCredentials = startSessionOptionsV2.cloudStorage?.some(
    shouldCloudStorageSaveCredentials
  );

  const allDataFetched =
    containerImage &&
    startSessionOptionsV2.sessionClass !== 0 &&
    startSessionOptionsV2.cloudStorage != null &&
    !isFetchingOrLoadingStorages &&
    !isFetchingSessionSecrets &&
    !isLoadingSessionImage;

  const fetchingApi =
    isFetchingOrLoadingStorages ||
    isFetchingSessionSecrets ||
    isLoadingSessionImage;

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

  useEffect(() => {
    // Handle all data fetched and no credentials needed
    if (
      allDataFetched &&
      !needsCredentials &&
      startSessionOptionsV2.cloudStorage &&
      shouldSaveCredentials
    )
      setShowSaveCredentials(shouldSaveCredentials);
    else setShowSaveCredentials(false);

    if (
      allDataFetched &&
      !needsCredentials &&
      startSessionOptionsV2.cloudStorage &&
      !shouldSaveCredentials &&
      startSessionOptionsV2.userSecretsReady &&
      startSessionOptionsV2.imageReady &&
      !sessionStarted
    )
      setSessionStarted(true);
  }, [
    allDataFetched,
    needsCredentials,
    sessionStarted,
    shouldSaveCredentials,
    startSessionOptionsV2.cloudStorage,
    startSessionOptionsV2.imageReady,
    startSessionOptionsV2.userSecretsReady,
  ]);

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

  if (showSaveCredentials)
    return (
      <SaveCloudStorage
        launcher={launcher}
        startSessionOptionsV2={startSessionOptionsV2}
      />
    );

  if (sessionStarted)
    return <SessionStarting launcher={launcher} project={project} />;

  if (
    !fetchingApi &&
    !sessionImage?.accessible &&
    !startSessionOptionsV2.imageReady
  ) {
    return <StartSessionImageModal launcher={launcher} project={project} />;
  }

  if (
    !fetchingApi &&
    sessionSecretSlotsWithSecrets &&
    !startSessionOptionsV2.userSecretsReady
  ) {
    return (
      <StartSessionWithSessionSecretsModal
        launcher={launcher}
        project={project}
        sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
      />
    );
  }

  // Handle all data fetched and credentials needed
  if (
    allDataFetched &&
    needsCredentials &&
    startSessionOptionsV2.cloudStorage
  ) {
    return (
      <StartSessionWithCloudStorageModal
        cloudStorageConfigs={startSessionOptionsV2.cloudStorage}
        launcher={launcher}
        project={project}
      />
    );
  }

  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressStepsIndicator
        description="Preparing to start session"
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title={`Launching session ${launcher.name}`}
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
  } = useGetNamespacesByNamespaceProjectsAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id ?? "";

  const {
    data: launchers,
    isLoading: isLoadingLaunchers,
    error: launchersError,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);

  const isLoading = isLoadingProject || isLoadingLaunchers;
  const error = projectError ?? launchersError;

  const launcher = useMemo(
    () => launchers?.find(({ id }) => id === launcherId),
    [launcherId, launchers]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || launcher == null || project == null) {
    return (
      <div>
        <h1 className="fs-5">Error: could not load session</h1>
        {error && <RtkOrNotebooksError error={error} dismissible={false} />}
      </div>
    );
  }

  return <StartSessionFromLauncher launcher={launcher} project={project} />;
}

interface StartSessionWithSessionSecretsModalProps
  extends StartSessionFromLauncherProps {
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

function StartSessionWithSessionSecretsModal({
  launcher,
  project,
  sessionSecretSlotsWithSecrets,
}: StartSessionWithSessionSecretsModalProps) {
  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );

  const showModal = !startSessionOptionsV2.userSecretsReady;

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

  return (
    <div>
      <div className={cx("progress-box-small", "progress-box-small--steps")}>
        <ProgressStepsIndicator
          description="Preparing to start session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title={`Launching session ${launcher.name}`}
          status={steps}
        />
        <SessionSecretsModal
          isOpen={showModal}
          project={project}
          sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
        />
      </div>
    </div>
  );
}

function StartSessionImageModal({
  launcher,
  project,
}: StartSessionFromLauncherProps) {
  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );

  const showModal = !startSessionOptionsV2.imageReady;

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

  return (
    <div>
      <div className={cx("progress-box-small", "progress-box-small--steps")}>
        <ProgressStepsIndicator
          description="Preparing to start session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title={`Launching session ${launcher.name}`}
          status={steps}
        />
        <SessionImageModal
          isOpen={showModal}
          launcher={launcher}
          project={project}
        />
      </div>
    </div>
  );
}
