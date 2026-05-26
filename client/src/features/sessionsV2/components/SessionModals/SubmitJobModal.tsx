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
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
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

interface SubmitJobModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
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

export default function SubmitJobModal({
  isOpen,
  launcher,
  toggle,
}: SubmitJobModalProps) {
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

  const [postSession, postSessionResult] = usePostSessionsMutation();

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchResourceClass = watch("resourceClass");

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
      postSessionResult.reset();
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
  }, [
    defaultValues,
    isOpen,
    launcher,
    postSessionResult,
    reset,
    resourcePools,
  ]);

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
      const sessionPostRequest = buildJobSessionPostRequest({
        launcher,
        submissionId: data.submissionId,
        resourceClass: data.resourceClass,
        diskStorage: data.diskStorage,
        args: data.args,
      });
      postSession({ sessionPostRequest });
    },
    [launcher, postSession]
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
      rules={{ required: "Please provide a resource class." }}
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
            {postSessionResult.error && (
              <RtkOrDataServicesError
                dismissible={false}
                error={postSessionResult.error}
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
                  <p className="mb-1">
                    The latest build failed or is not ready yet. This job will
                    run using the last successfully built image.
                  </p>
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

export type { SubmitJobForm };
