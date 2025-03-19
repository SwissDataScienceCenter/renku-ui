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
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { Button, Form, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { SuccessAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import {
  usePostSessionLaunchersMutation as useAddSessionLauncherMutation,
  useGetEnvironmentsQuery as useGetSessionEnvironmentsQuery,
} from "../../api/sessionLaunchersV2.api";
import { DEFAULT_PORT, DEFAULT_URL } from "../../session.constants";
import { getFormattedEnvironmentValues } from "../../session.utils";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { EnvironmentFields } from "../SessionForm/EnvironmentField";
import { LauncherDetailsFields } from "../SessionForm/LauncherDetailsFields";
import {
  LauncherStep,
  SessionLauncherBreadcrumbNavbar,
} from "../SessionForm/SessionLauncherBreadcrumbNavbar";

interface NewSessionLauncherModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function NewSessionLauncherModal({
  isOpen,
  toggle,
}: NewSessionLauncherModalProps) {
  const [step, setStep] = useState<LauncherStep>(LauncherStep.Environment);
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: environments } = useGetSessionEnvironmentsQuery({});
  const [addSessionLauncher, result] = useAddSessionLauncherMutation();
  const { data: project } = useGetNamespacesByNamespaceProjectsAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id;

  const useFormResult = useForm<SessionLauncherForm>({
    defaultValues: {
      name: "",
      environmentSelect: "global",
      environmentId: "",
      container_image: "",
      default_url: DEFAULT_URL,
      port: DEFAULT_PORT,
      repository: "",
    },
  });
  const {
    control,
    formState: { errors, isDirty, touchedFields, isValid },
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
  } = useFormResult;

  const watchEnvironmentId = watch("environmentId");
  const watchEnvironmentCustomImage = watch("container_image");
  const watchEnvironmentSelect = watch("environmentSelect");
  const watchCodeRepository = watch("repository");

  const isEnvironmentDefined = useMemo(() => {
    return (
      (watchEnvironmentSelect === "global" && !!watchEnvironmentId) ||
      (watchEnvironmentSelect === "custom + image" &&
        watchEnvironmentCustomImage?.length > 0) ||
      (watchEnvironmentSelect === "custom + build" && !!watchCodeRepository)
    );
  }, [
    watchCodeRepository,
    watchEnvironmentCustomImage,
    watchEnvironmentId,
    watchEnvironmentSelect,
  ]);

  const onNext = useCallback(() => {
    trigger([
      "args",
      "builder_variant",
      "command",
      "container_image",
      "environmentId",
      "frontend_variant",
      "repository",
    ]);

    if (isDirty && isEnvironmentDefined && isValid)
      setStep(LauncherStep.LauncherDetails);
  }, [isDirty, setStep, trigger, isEnvironmentDefined, isValid]);

  const onCancel = useCallback(() => {
    setStep(LauncherStep.Environment);
    reset();
    toggle();
  }, [reset, toggle, setStep]);

  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { name, resourceClass } = data;
      const environment = getFormattedEnvironmentValues(data);
      const diskStorage =
        data.disk_storage && data.disk_storage != resourceClass.default_storage
          ? data.disk_storage
          : undefined;
      if (environment.success && environment.data)
        addSessionLauncher({
          sessionLauncherPost: {
            project_id: projectId ?? "",
            resource_class_id: resourceClass.id,
            disk_storage: diskStorage,
            name,
            // TODO: fix types for this session environment
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            environment: environment.data,
          },
        });
    },
    [projectId, addSessionLauncher]
  );

  useEffect(() => {
    trigger(["container_image"]);
  }, [watchEnvironmentCustomImage, trigger]);

  useEffect(() => {
    trigger(["environmentId"]);
    if (environments?.length) {
      const environmentSelected = environments.find(
        (env) => env.id === watchEnvironmentId
      );
      setValue("name", environmentSelected?.name ?? "");
    }
  }, [watchEnvironmentId, setValue, environments, trigger]);

  useEffect(() => {
    if (environments == null) {
      return;
    }
    if (environments.length == 0) {
      setValue("environmentSelect", "custom + image");
    }
  }, [environments, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setStep(LauncherStep.Environment);
      reset();
      result.reset();
    }
  }, [isOpen, reset, result, setStep]);

  return (
    <ScrollableModal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Add session launcher</ModalHeader>
      <ModalBody>
        {result.isSuccess ? (
          <ConfirmationCreate />
        ) : (
          <div className={cx("d-flex", "flex-column", "gap-3")}>
            {step === "environment" && (
              <>
                <p className="mb-0">
                  Define an interactive environment in which to do your work and
                  share it with others.
                </p>
              </>
            )}
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              {result.error && <RtkErrorAlert error={result.error} />}
              {step === "environment" && (
                <EnvironmentFields
                  errors={errors}
                  touchedFields={touchedFields}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                />
              )}
              {step === "launcherDetails" && (
                <LauncherDetailsFields control={control} />
              )}
            </Form>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {!result.isSuccess && (
          <div className={cx("d-flex", "flex-grow-1")}>
            <SessionLauncherBreadcrumbNavbar
              step={step}
              setStep={setStep}
              readyToGoNext={isEnvironmentDefined}
            />
          </div>
        )}
        <Button
          data-cy="close-cancel-button"
          color="outline-primary"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          {result.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!result.isSuccess && step === "environment" && (
          <Button
            color="primary"
            data-cy="next-session-button"
            onClick={onNext}
            type="submit"
          >
            Next
            <ArrowRight className={cx("bi", "ms-1")} />
          </Button>
        )}
        {!result.isSuccess && step === "launcherDetails" && (
          <Button
            color="primary"
            data-cy="add-session-button"
            disabled={result.isLoading || !isDirty}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Add session launcher
          </Button>
        )}
      </ModalFooter>
    </ScrollableModal>
  );
}

const ConfirmationCreate = () => {
  return (
    <SuccessAlert
      data-cy="session-launcher-creation-success"
      dismissible={false}
      timeout={0}
    >
      <p className="mb-0">Session launcher was created successfully!</p>
    </SuccessAlert>
  );
};
