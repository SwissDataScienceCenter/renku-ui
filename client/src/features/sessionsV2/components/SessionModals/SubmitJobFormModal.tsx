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
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Send } from "react-bootstrap-icons";
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
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
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
import {
  ENVIRONMENT_VALUES_DESCRIPTION,
  SUBMISSION_ID_VALIDATION_MESSAGE,
} from "../../session.constants";
import {
  generateSubmissionId,
  getSubmitJobEnvironmentKindLabel,
  isSubmissionIdTaken,
  validateSubmissionId,
} from "../../session.utils";
import { BuildStatusDescription } from "../BuildStatusComponents";
import SessionClassSelector from "../SessionClassSelector";
import { JsonField } from "../SessionForm/AdvancedSettingsFields";
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

export interface SubmitJobFormModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
  isCheckingLaunchPrerequisites: boolean;
  onSubmitJob: (data: SubmitJobForm) => void;
  postSessionResult: ReturnType<typeof usePostSessionsMutation>[1];
}

export default function SubmitJobFormModal({
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
    useOldImage;

  const defaultValues = useMemo(
    () => getSubmitJobDefaultValues(launcher),
    [launcher]
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<SubmitJobForm>({
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
            disabled={isSubmitDisabled}
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
        <Send className={cx("bi", "me-1")} /> Review and submit Job
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
                <Label className="form-label" for="submitJobSubmissionId">
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
                        data-cy="submit-job-submission-id-input"
                        id="submitJobSubmissionId"
                        innerRef={submissionIdInputRef}
                        type="text"
                        disabled={isSubmitDisabled}
                      />
                      <div className="invalid-feedback">{error?.message}</div>
                    </>
                  )}
                />
                <FormText>{SUBMISSION_ID_VALIDATION_MESSAGE.helpText}</FormText>
              </div>
              <div>
                <JsonField<SubmitJobForm>
                  control={control}
                  name="command"
                  label={
                    isCustomImageEnvironment ? "Command CMD" : "Job command"
                  }
                  helpText={
                    isCodeEnvironment
                      ? "Enter the command that will run as a job (JSON array format)."
                      : 'Please enter a valid JSON array format e.g. ["npm", "build"]'
                  }
                  info={ENVIRONMENT_VALUES_DESCRIPTION.command}
                  errors={errors}
                  isOptional={!isCodeEnvironment}
                  dataCy="submit-job-command-input"
                  disabled={isSubmitDisabled}
                />
              </div>
              <div>
                <JsonField<SubmitJobForm>
                  control={control}
                  name="args"
                  label={
                    isCustomImageEnvironment
                      ? "Command Arguments CMD"
                      : "Job arg"
                  }
                  helpText='Please enter a valid JSON array format e.g. ["--arg1", "--arg2"]'
                  info={ENVIRONMENT_VALUES_DESCRIPTION.args}
                  errors={errors}
                  isOptional={isCustomImageEnvironment || isCodeEnvironment}
                  dataCy="submit-job-args-input"
                  disabled={isSubmitDisabled}
                />
              </div>
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
            ) : (
              <Send className={cx("bi", "me-1")} />
            )}
            Submit job
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
