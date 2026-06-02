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
import cx from "classnames";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { SuccessAlert, WarnAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import { TimeCaption } from "~/components/TimeCaption";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import type { DataConnectorConfiguration } from "../../../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import type { SessionSecretSlotWithSecret } from "../../../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import { useGetResourcePoolsQuery } from "../../api/computeResources.api";
import {
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
  type SessionLauncher,
} from "../../api/sessionLaunchersV2.api";
import {
  useGetSessionsImagesQuery,
  useGetSessionsQuery,
  usePostSessionsMutation,
} from "../../api/sessionsV2.api";
import DataConnectorSecretsModal from "../../DataConnectorSecretsModal";
import SaveCloudStorageCredentials from "../../SaveCloudStorageCredentials";
import { SUBMISSION_ID_VALIDATION_MESSAGE } from "../../session.constants";
import {
  buildJobSessionPostRequest,
  generateSubmissionId,
  getJSONStringArray,
  getSubmitJobEnvironmentKindLabel,
  isSubmissionIdTaken,
  isValidJSONStringArray,
  validateSubmissionId,
} from "../../session.utils";
import {
  allSessionSecretsReady,
  dataConnectorsShouldSaveCredentials,
  doesCloudStorageNeedCredentials,
} from "../../sessionLaunchValidation.utils";
import SessionRepositoriesModal from "../../SessionRepositoriesModal";
import SessionSecretsModal from "../../SessionSecretsModal";
import type { SessionStartDataConnectorConfiguration } from "../../startSessionOptionsV2.types";
import useSessionLaunchPrerequisites from "../../useSessionLaunchPrerequisites.hook";
import { BuildStatusDescription } from "../BuildStatusComponents";
import SessionClassSelector from "../SessionClassSelector";
import { LauncherEnvironmentIcon } from "../SessionForm/LauncherEnvironmentIcon";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";
import {
  getSubmitJobDefaultValues,
  resolveDefaultResourceClass,
  useSubmitJobEnvironmentFlags,
  type SubmitJobForm,
} from "./useSubmitJobForm";

interface SubmitJobGates {
  repositoriesReady: boolean;
  userSecretsReady: boolean;
  dataConnectorsResolved: boolean;
  credentialsSaved: boolean;
}

const INITIAL_GATES: SubmitJobGates = {
  repositoriesReady: false,
  userSecretsReady: false,
  dataConnectorsResolved: false,
  credentialsSaved: false,
};

type ValidationStep =
  | "repositories"
  | "sessionSecrets"
  | "dataConnectors"
  | "saveCredentials"
  | "complete";

interface GetValidationStepArgs {
  isValidating: boolean;
  isLoadingPrerequisites: boolean;
  gates: SubmitJobGates;
  repositoriesNeedAttention: boolean;
  secretsNeedAttention: boolean;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null;
  needsCredentials: boolean;
  shouldSaveCredentials: boolean;
}

function isUserSecretsReadyForSubmit(
  gates: SubmitJobGates,
  isValidating: boolean,
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null
): boolean {
  return (
    gates.userSecretsReady ||
    (isValidating &&
      !!sessionSecretSlotsWithSecrets &&
      allSessionSecretsReady(sessionSecretSlotsWithSecrets))
  );
}

function getSubmitJobValidationStep({
  isValidating,
  isLoadingPrerequisites,
  gates,
  repositoriesNeedAttention,
  secretsNeedAttention,
  sessionSecretSlotsWithSecrets,
  needsCredentials,
  shouldSaveCredentials,
}: GetValidationStepArgs): ValidationStep | null {
  if (!isValidating || isLoadingPrerequisites) {
    return null;
  }
  if (!gates.repositoriesReady && repositoriesNeedAttention) {
    return "repositories";
  }
  if (
    !isUserSecretsReadyForSubmit(
      gates,
      isValidating,
      sessionSecretSlotsWithSecrets
    ) &&
    secretsNeedAttention &&
    sessionSecretSlotsWithSecrets
  ) {
    return "sessionSecrets";
  }
  if (!gates.dataConnectorsResolved && needsCredentials) {
    return "dataConnectors";
  }
  if (shouldSaveCredentials && !gates.credentialsSaved) {
    return "saveCredentials";
  }
  return "complete";
}

interface SubmitJobModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
  toggle: () => void;
}

function SubmitJobJsonField({
  control,
  name,
  label,
  helpText,
  info,
  isOptional,
  dataCy,
  id,
  rules,
}: {
  control: ReturnType<typeof useForm<SubmitJobForm>>["control"];
  name: "command" | "args";
  label: string;
  helpText: string;
  info: string;
  isOptional?: boolean;
  dataCy: string;
  id: string;
  rules?: Record<string, unknown>;
}) {
  return (
    <div>
      <Label className="form-label" for={id}>
        {label}
        {isOptional && (
          <span className={cx("small", "text-muted", "ms-1")}>(Optional)</span>
        )}
      </Label>
      <Controller
        control={control}
        name={name}
        rules={{
          validate: (value) => isValidJSONStringArray(value?.toString()),
          ...rules,
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <textarea
              className={cx("w-100 form-control", error && "is-invalid")}
              data-cy={dataCy}
              id={id}
              rows={2}
              {...field}
            />
            {error && (
              <div className="invalid-feedback mt-0 d-block">
                {error.message}
              </div>
            )}
          </>
        )}
      />
      <FormText tag="div">{helpText}</FormText>
      {info && <FormText tag="div">{info}</FormText>}
    </div>
  );
}

interface SubmitJobFormModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
  isCheckingLaunchPrerequisites: boolean;
  onSubmitJob: (data: SubmitJobForm) => void;
  postSessionResult: ReturnType<typeof usePostSessionsMutation>[1];
}

function SubmitJobFormModal({
  isOpen,
  launcher,
  toggle,
  isCheckingLaunchPrerequisites,
  onSubmitJob,
  postSessionResult,
}: SubmitJobFormModalProps) {
  const submissionIdInputRef = useRef<HTMLInputElement>(null);
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;
  const { environment } = launcher;
  const projectId = launcher.project_id;

  const {
    isCustomImageEnvironment,
    isCodeEnvironment,
    isExternalImageEnvironment,
  } = useSubmitJobEnvironmentFlags(launcher);

  const permissions = useProjectPermissions({ projectId });
  const canWrite = permissions?.write === true;

  const {
    data: resourcePools,
    isLoading: isLoadingResourcePools,
    isError: isErrorResourcePools,
  } = useGetResourcePoolsQuery({});

  const {
    data: sessions,
    isLoading: isLoadingSessions,
    isFetching: isFetchingSessions,
  } = useGetSessionsQuery(isOpen ? {} : skipToken);

  const { data: builds, isLoading: isLoadingBuilds } = useGetBuildsQuery(
    isOpen && imageBuildersEnabled && isCodeEnvironment
      ? { environmentId: environment.id }
      : skipToken
  );

  const lastBuild = builds?.at(0);
  const isLastBuildRunning = lastBuild?.status === "in_progress";
  const lastSuccessfulBuild = builds?.find(
    (build) => build.status === "succeeded" && build.id !== lastBuild?.id
  );
  const useOldImage =
    isCodeEnvironment &&
    lastBuild?.status !== "succeeded" &&
    !!lastSuccessfulBuild;

  const { data: containerImage, isLoading: isLoadingContainerImage } =
    useGetSessionsImagesQuery(
      isOpen &&
        isExternalImageEnvironment &&
        environment.container_image != null
        ? { imageUrl: environment.container_image }
        : skipToken
    );

  const displayLaunchSession =
    !isCodeEnvironment ||
    (isCodeEnvironment && lastBuild?.status === "succeeded") ||
    (isCodeEnvironment && containerImage?.accessible) ||
    useOldImage;

  const defaultValues = useMemo(
    () => getSubmitJobDefaultValues(launcher),
    [launcher]
  );

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<SubmitJobForm>({
      defaultValues,
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchResourceClass = watch("resourceClass");

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
      return;
    }
    const defaultResourceClass = resolveDefaultResourceClass({
      launcher,
      resourcePools,
    });
    reset({
      ...defaultValues,
      resourceClass: defaultResourceClass,
      diskStorage:
        defaultResourceClass?.default_storage ??
        launcher.disk_storage ??
        undefined,
      submissionId: generateSubmissionId(),
    });
    submissionIdInputRef.current?.focus();
  }, [defaultValues, isOpen, launcher, reset, resourcePools]);

  const launcherSessions = useMemo(
    () =>
      sessions?.filter(
        (session) =>
          session.launcher_id === launcher.id &&
          session.project_id === projectId
      ) ?? [],
    [launcher.id, projectId, sessions]
  );

  const onSubmit = useCallback(
    (data: SubmitJobForm) => {
      if (!data.resourceClass) {
        return;
      }
      onSubmitJob(data);
    },
    [onSubmitJob]
  );

  const isLoadingPrerequisites =
    isLoadingResourcePools ||
    isLoadingSessions ||
    isFetchingSessions ||
    (isCodeEnvironment && isLoadingBuilds) ||
    (isExternalImageEnvironment && isLoadingContainerImage);

  const isSubmitDisabled =
    !canWrite ||
    !displayLaunchSession ||
    isLoadingPrerequisites ||
    isCheckingLaunchPrerequisites ||
    !watchResourceClass ||
    postSessionResult.isLoading;

  const handleToggle = useCallback(() => {
    toggle();
  }, [toggle]);

  const resourceClassSelector = isLoadingResourcePools ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length === 0 || isErrorResourcePools ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <Controller
      control={control}
      name="resourceClass"
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <SessionClassSelector
            id="submitJobResourceClass"
            currentSessionClass={value}
            resourcePools={resourcePools}
            onChange={(resourceClass) => {
              onChange(resourceClass);
              if (resourceClass) {
                setValue("diskStorage", resourceClass.default_storage);
              }
            }}
          />
          {error && (
            <div className={cx("small", "text-danger")}>
              {error.message || "Please provide a valid resource class."}
            </div>
          )}
        </>
      )}
      rules={{ required: "Please provide a valid resource class." }}
    />
  );

  return (
    <Modal
      backdrop="static"
      centered
      data-cy="submit-job-modal"
      isOpen={isOpen}
      size="lg"
      toggle={handleToggle}
    >
      <ModalHeader tag="h2" toggle={handleToggle}>
        Review and submit Job
      </ModalHeader>
      <ModalBody>
        {postSessionResult.isSuccess ? (
          <SuccessAlert dismissible={false} timeout={0}>
            <p className="fw-bold mb-1">
              Job{" "}
              {postSessionResult.data?.submission_id ??
                watch("submissionId")?.trim()}{" "}
              submitted successfully
            </p>
          </SuccessAlert>
        ) : (
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            {Boolean(postSessionResult.error) && (
              <RtkOrDataServicesError
                dismissible={false}
                error={postSessionResult.error as never}
              />
            )}
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <div>
                <h3
                  className="fs-2 fw-bold mb-0"
                  data-cy="submit-job-launcher-name"
                >
                  {launcher.name}
                </h3>
              </div>

              <div
                className={cx(
                  "d-flex",
                  "flex-wrap",
                  "align-items-center",
                  "gap-4"
                )}
                data-cy="submit-job-environment"
              >
                <span className={cx("text-muted", "small")}>
                  <LauncherEnvironmentIcon launcher={launcher} />
                  {getSubmitJobEnvironmentKindLabel(launcher)}
                </span>
                {isCodeEnvironment && (
                  <BuildStatusDescription
                    status={lastBuild?.status ?? lastSuccessfulBuild?.status}
                    createdAt={
                      lastBuild?.created_at ?? lastSuccessfulBuild?.created_at
                    }
                    completedAt={
                      lastBuild?.status === "succeeded"
                        ? lastBuild?.result?.completed_at
                        : lastSuccessfulBuild?.status === "succeeded"
                        ? lastSuccessfulBuild?.result?.completed_at
                        : undefined
                    }
                  />
                )}
              </div>

              {useOldImage && lastSuccessfulBuild && (
                <WarnAlert
                  className="mb-0"
                  data-cy="submit-job-old-image-warning"
                  dismissible={false}
                >
                  {isLastBuildRunning ? (
                    <p className="mb-1">
                      The environment for this launcher is currently rebuilding
                      and not yet complete. This job will use the last
                      successfully built environment from{" "}
                      <TimeCaption
                        datetime={lastSuccessfulBuild.created_at}
                        enableTooltip
                        noCaption
                      />
                    </p>
                  ) : (
                    <p className="mb-1">
                      The most recent build for this environment failed, so this
                      job will use the last successfully built environment from{" "}
                      <TimeCaption
                        datetime={lastSuccessfulBuild.created_at}
                        enableTooltip
                        noCaption
                      />
                    </p>
                  )}
                </WarnAlert>
              )}

              {isExternalImageEnvironment &&
                !isLoadingContainerImage &&
                containerImage?.accessible === false && (
                  <WarnAlert className="mb-0" dismissible={false}>
                    <p className="mb-0">
                      Image accessibility could not be verified. You may still
                      submit if your integration provides access at runtime.
                    </p>
                  </WarnAlert>
                )}

              <div className="mt-3">
                <Label className="form-label" for="submitJobNickname">
                  Submission ID
                </Label>
                <Controller
                  control={control}
                  name="submissionId"
                  rules={{
                    required: SUBMISSION_ID_VALIDATION_MESSAGE.required,
                    validate: {
                      format: (value) => validateSubmissionId(value),
                      unique: (value) => {
                        const formatResult = validateSubmissionId(value);
                        if (formatResult !== true) {
                          return formatResult;
                        }
                        if (
                          isSubmissionIdTaken({
                            sessions: launcherSessions,
                            launcherId: launcher.id,
                            projectId,
                            submissionId: value,
                          })
                        ) {
                          return SUBMISSION_ID_VALIDATION_MESSAGE.taken;
                        }
                        return true;
                      },
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        autoFocus
                        className={cx(error && "is-invalid")}
                        data-cy="submit-job-nickname-input"
                        id="submitJobNickname"
                        innerRef={submissionIdInputRef}
                        type="text"
                      />
                      <div className="invalid-feedback">{error?.message}</div>
                    </>
                  )}
                />
                <FormText>
                  Customize the identifier for your job (letters and numbers
                  only, min 4 characters).
                </FormText>
              </div>

              <div>
                <Label className={cx("form-label", "me-2")}>Command:</Label>
                <code className="user-select-all">
                  {getJSONStringArray(launcher.environment?.command)}
                </code>
              </div>
              <SubmitJobJsonField
                control={control}
                name="args"
                label={
                  isCustomImageEnvironment ? "Command Arguments CMD" : "Job Arg"
                }
                helpText='Please enter a valid JSON array format e.g. ["--arg1", "--arg2"]'
                info=""
                isOptional={isCustomImageEnvironment}
                dataCy="submit-job-args-input"
                id="submitJobArgs"
              />
              <div>
                <Label className="form-label" for="submitJobResourceClass">
                  Compute resources
                </Label>
                <div className="field-group">{resourceClassSelector}</div>
              </div>
            </div>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={handleToggle}>
          {postSessionResult.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!postSessionResult.isSuccess && (
          <Button
            color="primary"
            data-cy="submit-job-confirm-button"
            disabled={isSubmitDisabled}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {postSessionResult.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : null}
            Submit job
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

function SubmitJobModalContent({
  launcher,
  project,
  toggle,
}: Omit<SubmitJobModalProps, "isOpen">) {
  const prerequisites = useSessionLaunchPrerequisites({
    project,
    enabled: true,
  });

  const [postSession, postSessionResult] = usePostSessionsMutation();
  const hasSubmittedRef = useRef(false);
  const [gates, setGates] = useState<SubmitJobGates>(INITIAL_GATES);
  const [dataConnectorConfigs, setDataConnectorConfigs] = useState<
    SessionStartDataConnectorConfiguration[] | undefined
  >();
  const [pendingSubmit, setPendingSubmit] = useState<SubmitJobForm | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);

  const configsWithCredentials = useMemo(
    () =>
      (prerequisites.dataConnectorConfigs ?? []).filter(
        (config) => !doesCloudStorageNeedCredentials(config)
      ),
    [prerequisites.dataConnectorConfigs]
  );

  const configsNeedingCredentials = prerequisites.configsNeedingCredentials;

  const shouldSaveCredentials =
    dataConnectorConfigs != null &&
    dataConnectorsShouldSaveCredentials(dataConnectorConfigs);

  const validationStep = useMemo(
    (): ValidationStep | null =>
      getSubmitJobValidationStep({
        isValidating,
        isLoadingPrerequisites: prerequisites.isLoading,
        gates,
        repositoriesNeedAttention: prerequisites.repositoriesNeedAttention,
        secretsNeedAttention: prerequisites.secretsNeedAttention,
        sessionSecretSlotsWithSecrets:
          prerequisites.sessionSecretSlotsWithSecrets,
        needsCredentials: prerequisites.needsCredentials,
        shouldSaveCredentials,
      }),
    [
      gates,
      isValidating,
      prerequisites.isLoading,
      prerequisites.needsCredentials,
      prerequisites.repositoriesNeedAttention,
      prerequisites.secretsNeedAttention,
      prerequisites.sessionSecretSlotsWithSecrets,
      shouldSaveCredentials,
    ]
  );

  useEffect(() => {
    if (validationStep !== "complete") {
      hasSubmittedRef.current = false;
      return;
    }
    if (!pendingSubmit?.resourceClass) {
      return;
    }
    if (postSessionResult.isLoading || postSessionResult.isSuccess) {
      return;
    }
    if (hasSubmittedRef.current) {
      return;
    }
    hasSubmittedRef.current = true;
    postSession({
      sessionPostRequest: buildJobSessionPostRequest({
        launcher,
        submissionId: pendingSubmit.submissionId,
        resourceClass: pendingSubmit.resourceClass,
        diskStorage: pendingSubmit.diskStorage,
        args: pendingSubmit.args,
        dataConnectors: dataConnectorConfigs,
      }),
    });
  }, [
    dataConnectorConfigs,
    launcher,
    pendingSubmit,
    postSession,
    postSessionResult.isLoading,
    postSessionResult.isSuccess,
    validationStep,
  ]);

  const cancelValidation = useCallback(() => {
    setIsValidating(false);
  }, []);

  const handleSubmitAttempt = useCallback(
    (data: SubmitJobForm) => {
      if (prerequisites.isLoading) {
        return;
      }
      setPendingSubmit(data);
      setIsValidating(true);
      setGates({
        repositoriesReady: !prerequisites.repositoriesNeedAttention,
        userSecretsReady: !prerequisites.secretsNeedAttention,
        dataConnectorsResolved: !prerequisites.needsCredentials,
        credentialsSaved: false,
      });
      if (
        !prerequisites.needsCredentials &&
        prerequisites.dataConnectorConfigs
      ) {
        setDataConnectorConfigs(prerequisites.dataConnectorConfigs);
      } else {
        setDataConnectorConfigs(undefined);
      }
    },
    [
      prerequisites.dataConnectorConfigs,
      prerequisites.isLoading,
      prerequisites.needsCredentials,
      prerequisites.repositoriesNeedAttention,
      prerequisites.secretsNeedAttention,
    ]
  );

  const onDataConnectorsComplete = useCallback(
    (configs: DataConnectorConfiguration[]) => {
      const cloudStorageConfigs = [
        ...configsWithCredentials,
        ...configs,
      ] as SessionStartDataConnectorConfiguration[];
      setDataConnectorConfigs(cloudStorageConfigs);
      setGates((prev) => ({
        ...prev,
        dataConnectorsResolved: true,
        credentialsSaved:
          !dataConnectorsShouldSaveCredentials(cloudStorageConfigs),
      }));
    },
    [configsWithCredentials]
  );

  const onSaveCredentialsComplete = useCallback(
    (configs: SessionStartDataConnectorConfiguration[]) => {
      setDataConnectorConfigs(configs);
      setGates((prev) => ({ ...prev, credentialsSaved: true }));
    },
    []
  );

  const onRepositoriesSkip = useCallback(() => {
    setGates((prev) => ({ ...prev, repositoriesReady: true }));
  }, []);

  const onSecretsSkip = useCallback(() => {
    setGates((prev) => ({ ...prev, userSecretsReady: true }));
  }, []);

  return (
    <>
      <SubmitJobFormModal
        isCheckingLaunchPrerequisites={prerequisites.isLoading}
        isOpen
        launcher={launcher}
        onSubmitJob={handleSubmitAttempt}
        postSessionResult={postSessionResult}
        toggle={toggle}
      />

      {validationStep === "repositories" && (
        <SessionRepositoriesModal
          continueLabel="Submit anyway"
          isOpen
          onCancel={cancelValidation}
          onSkip={onRepositoriesSkip}
          project={project}
          title="Project repositories not accessible"
          warningIntro="your attention before submitting the job"
        />
      )}

      {validationStep === "sessionSecrets" &&
        prerequisites.sessionSecretSlotsWithSecrets && (
          <SessionSecretsModal
            isOpen
            onCancel={cancelValidation}
            onSkip={onSecretsSkip}
            project={project}
            sessionSecretSlotsWithSecrets={
              prerequisites.sessionSecretSlotsWithSecrets
            }
            title="Session secrets"
          />
        )}

      {validationStep === "dataConnectors" && (
        <DataConnectorSecretsModal
          context="job"
          dataConnectorConfigs={configsNeedingCredentials}
          isOpen
          onCancel={cancelValidation}
          onStart={onDataConnectorsComplete}
        />
      )}

      {validationStep === "saveCredentials" && dataConnectorConfigs && (
        <Modal
          backdrop="static"
          centered
          data-cy="submit-job-save-credentials-modal"
          isOpen
          toggle={cancelValidation}
        >
          <ModalHeader tag="h2">Saving credentials</ModalHeader>
          <ModalBody>
            <SaveCloudStorageCredentials
              dataConnectors={dataConnectorConfigs}
              onComplete={onSaveCredentialsComplete}
              title={`Submitting job ${launcher.name}`}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
}

export default function SubmitJobModal({
  isOpen,
  launcher,
  project,
  toggle,
}: SubmitJobModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <SubmitJobModalContent
      launcher={launcher}
      project={project}
      toggle={toggle}
    />
  );
}

export type { SubmitJobForm };
