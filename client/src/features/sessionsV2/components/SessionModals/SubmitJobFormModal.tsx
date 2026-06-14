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
import { useCallback, useEffect, useMemo, useRef } from "react";
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
import { useGetResourcePoolsQuery } from "../../api/computeResources.api";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import {
  useGetSessionsQuery,
  usePostSessionsMutation,
} from "../../api/sessionsV2.api";
import {
  ENVIRONMENT_VALUES_DESCRIPTION,
  SUBMISSION_ID_VALIDATION_MESSAGE,
} from "../../session.constants";
import {
  generateSubmissionId,
  isSubmissionIdTaken,
  validateSubmissionId,
} from "../../session.utils";
import useLauncherEnvironmentReadiness from "../../useLauncherEnvironmentReadiness.hook";
import { JsonField } from "../SessionForm/AdvancedSettingsFields";
import SubmitJobEnvironmentSummary from "./SubmitJobEnvironmentSummary";
import SubmitJobResourceClassField from "./SubmitJobResourceClassField";
import {
  getSubmitJobDefaultValues,
  resolveDefaultResourceClass,
  type SubmitJobForm,
} from "./useSubmitJobForm";

export interface SubmitJobFormModalProps {
  buildRequestError?: string | null;
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
  isCheckingLaunchPrerequisites: boolean;
  onSubmitJob: (data: SubmitJobForm) => void;
  postSessionResult: ReturnType<typeof usePostSessionsMutation>[1];
}

export default function SubmitJobFormModal({
  buildRequestError,
  isOpen,
  launcher,
  toggle,
  isCheckingLaunchPrerequisites,
  onSubmitJob,
  postSessionResult,
}: SubmitJobFormModalProps) {
  const submissionIdInputRef = useRef<HTMLInputElement>(null);
  const projectId = launcher.project_id;

  const {
    containerImage,
    displayLaunchSession,
    isCodeEnvironment,
    isCustomImageEnvironment,
    isExternalImageEnvironment,
    isLastBuildRunning,
    isLoadingBuilds,
    isLoadingContainerImage,
    lastBuild,
    lastSuccessfulBuild,
    useOldImage,
  } = useLauncherEnvironmentReadiness({
    launcher,
    enabled: isOpen,
  });

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

  const defaultValues = useMemo(
    () => getSubmitJobDefaultValues(launcher),
    [launcher],
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
    reset({
      ...defaultValues,
      submissionId: generateSubmissionId(),
    });
    submissionIdInputRef.current?.focus();
  }, [defaultValues, isOpen, reset]);

  useEffect(() => {
    if (!isOpen || watchResourceClass) {
      return;
    }
    const defaultResourceClass = resolveDefaultResourceClass({
      launcher,
      resourcePools,
    });
    if (!defaultResourceClass) {
      return;
    }
    setValue("resourceClass", defaultResourceClass);
    setValue(
      "diskStorage",
      defaultResourceClass.default_storage ??
        launcher.disk_storage ??
        undefined,
    );
  }, [isOpen, watchResourceClass, launcher, resourcePools, setValue]);

  const launcherSessions = useMemo(
    () =>
      sessions?.filter(
        (session) =>
          session.launcher_id === launcher.id &&
          session.project_id === projectId,
      ) ?? [],
    [launcher.id, projectId, sessions],
  );

  const onSubmit = useCallback(
    (data: SubmitJobForm) => {
      if (!data.resourceClass) {
        return;
      }
      onSubmitJob(data);
    },
    [onSubmitJob],
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

  return (
    <Modal
      backdrop="static"
      centered
      data-cy="submit-job-modal"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        <Send className={cx("bi", "me-1")} /> Review and submit Job
      </ModalHeader>
      <ModalBody>
        {postSessionResult.isSuccess ? (
          <SuccessAlert dismissible={false} timeout={0}>
            <p className={cx("fw-bold", "mb-1")}>
              Job{" "}
              {postSessionResult.data?.submission_id ??
                watch("submissionId")?.trim()}{" "}
              submitted successfully
            </p>
          </SuccessAlert>
        ) : (
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            {buildRequestError != null && (
              <WarnAlert className="mb-0" dismissible={false}>
                <p className="mb-0">{buildRequestError}</p>
              </WarnAlert>
            )}
            {Boolean(postSessionResult.error) && (
              <RtkOrDataServicesError
                dismissible={false}
                error={postSessionResult.error as never}
              />
            )}
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <SubmitJobEnvironmentSummary
                containerImageAccessible={containerImage?.accessible}
                isCodeEnvironment={isCodeEnvironment}
                isExternalImageEnvironment={isExternalImageEnvironment}
                isLastBuildRunning={isLastBuildRunning}
                isLoadingContainerImage={isLoadingContainerImage}
                lastBuild={lastBuild}
                lastSuccessfulBuild={lastSuccessfulBuild}
                launcher={launcher}
                useOldImage={useOldImage}
              />

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
                      ? 'Enter the command that will run as a job (JSON array format) e.g. ["python","my_repo/main.py"]'
                      : 'Enter a valid JSON array format e.g. ["python","my_repo/main.py"]'
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
                      : "Job args"
                  }
                  helpText='Please enter a valid JSON array format e.g. ["--arg1", "--arg2"]'
                  info={ENVIRONMENT_VALUES_DESCRIPTION.args}
                  errors={errors}
                  isOptional={isCustomImageEnvironment || isCodeEnvironment}
                  dataCy="submit-job-args-input"
                  disabled={isSubmitDisabled}
                />
              </div>
              <SubmitJobResourceClassField
                control={control}
                isErrorResourcePools={isErrorResourcePools}
                isLoadingResourcePools={isLoadingResourcePools}
                isSubmitDisabled={isSubmitDisabled}
                resourcePools={resourcePools}
                setValue={setValue}
              />
            </div>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          {postSessionResult.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!postSessionResult.isSuccess && (
          <Button
            color="primary"
            data-cy="submit-job-confirm-button"
            disabled={isSubmitDisabled}
            onClick={handleSubmit(onSubmit)}
            type="button"
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
