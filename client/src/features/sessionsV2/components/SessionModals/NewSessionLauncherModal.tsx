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
import { useParams } from "react-router-dom-v5-compat";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { SuccessAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import {
  DEFAULT_PORT,
  DEFAULT_URL,
  getFormattedEnvironmentValues,
} from "../../session.utils";
import {
  useAddSessionLauncherMutation,
  useGetSessionEnvironmentsQuery,
} from "../../sessionsV2.api";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { EnvironmentFields } from "../SessionForm/EnvironmentField";
import { LauncherDetailsFields } from "../SessionForm/LauncherDetailsFields";
import { SessionLauncherBreadcrumbNavbar } from "../SessionForm/SessionLauncherBreadcrumbNavbar";

interface NewSessionLauncherModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function NewSessionLauncherModal({
  isOpen,
  toggle,
}: NewSessionLauncherModalProps) {
  const [step, setStep] = useState<"environment" | "launcherDetails">(
    "environment"
  );
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: environments } = useGetSessionEnvironmentsQuery();
  const [addSessionLauncher, result] = useAddSessionLauncherMutation();
  const { data: project } = useGetProjectsByNamespaceAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id;

  const {
    control,
    formState: { errors, isDirty, touchedFields },
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<SessionLauncherForm>({
    defaultValues: {
      name: "",
      environment_kind: "GLOBAL",
      environment_id: "",
      container_image: "",
      default_url: DEFAULT_URL,
      port: DEFAULT_PORT,
    },
  });

  const watchEnvironmentId = watch("environment_id");
  const watchEnvironmentCustomImage = watch("container_image");
  const watchEnvironmentKind = watch("environment_kind");

  const isEnvironmentDefined = useMemo(() => {
    return (
      (watchEnvironmentKind === "GLOBAL" && !!watchEnvironmentId) ||
      (watchEnvironmentKind === "CUSTOM" &&
        watchEnvironmentCustomImage?.length > 0)
    );
  }, [watchEnvironmentId, watchEnvironmentCustomImage, watchEnvironmentKind]);

  const onNext = useCallback(() => {
    trigger(["environment_id", "container_image"]);

    if (isDirty && isEnvironmentDefined) setStep("launcherDetails");
  }, [isDirty, setStep, trigger, isEnvironmentDefined]);

  const onCancel = useCallback(() => {
    setStep("environment");
    reset();
    toggle();
  }, [reset, toggle, setStep]);

  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { name, resourceClass } = data;
      const environment = getFormattedEnvironmentValues(data);
      addSessionLauncher({
        project_id: projectId ?? "",
        resource_class_id: resourceClass.id,
        name,
        environment,
      });
    },
    [projectId, addSessionLauncher]
  );

  useEffect(() => {
    trigger(["container_image"]);
  }, [watchEnvironmentCustomImage, trigger]);

  useEffect(() => {
    trigger(["environment_id"]);
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
      setValue("environment_kind", "CUSTOM");
    }
  }, [environments, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setStep("environment");
      reset();
      result.reset();
    }
  }, [isOpen, reset, result, setStep]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
      scrollable
    >
      <ModalHeader toggle={toggle}>Add session launcher</ModalHeader>
      <ModalBody style={{ height: result.isSuccess ? "auto" : "600px" }}>
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
                <LauncherDetailsFields
                  setValue={setValue}
                  errors={errors}
                  control={control}
                />
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
              readyToGoNext={!!isEnvironmentDefined}
            />
          </div>
        )}
        <Button color="outline-primary" onClick={onCancel}>
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
            Next <ArrowRight />
          </Button>
        )}
        {!result.isSuccess && step === "launcherDetails" && (
          <Button
            color="primary"
            data-cy="edit-session-button"
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
    </Modal>
  );
}

const ConfirmationCreate = () => {
  return (
    <SuccessAlert dismissible={false} timeout={0}>
      <p className="mb-0">Session launcher was created successfully!</p>
    </SuccessAlert>
  );
};
