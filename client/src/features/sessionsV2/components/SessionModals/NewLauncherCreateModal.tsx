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
import { ArrowLeft, ArrowRight, CheckLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { SuccessAlert } from "../../../../components/Alert";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../../components/Loader";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import {
  usePostSessionLaunchersMutation as useAddSessionLauncherMutation,
  useGetEnvironmentsQuery as useGetSessionEnvironmentsQuery,
} from "../../api/sessionLaunchersV2.api";
import {
  getFormattedEnvironmentValues,
  getLauncherApiType,
  getLauncherCategoryDefinition,
  getNewLauncherFormDefaultValues,
  isGlobalEnvironmentIncluded,
} from "../../session.utils";
import type { LauncherCategory } from "../../sessionsV2.types";
import { LauncherStep, SessionLauncherForm } from "../../sessionsV2.types";
import { EnvironmentFields } from "../SessionForm/EnvironmentField";
import { LauncherDetailsFields } from "../SessionForm/LauncherDetailsFields";

import scrollableModalStyles from "~/components/modal/ScrollableModal.module.scss";

interface NewLauncherCreateModalProps {
  isOpen: boolean;
  launcherCategory: LauncherCategory;
  toggle: () => void;
  goBack: () => void;
}

export default function NewLauncherCreateModal({
  isOpen,
  launcherCategory,
  toggle,
  goBack,
}: NewLauncherCreateModalProps) {
  const categoryDefinition = getLauncherCategoryDefinition(launcherCategory);
  const HeaderIcon = categoryDefinition.icon;

  const [step, setStep] = useState<LauncherStep>(LauncherStep.Environment);
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: environments } = useGetSessionEnvironmentsQuery({});
  const [addSessionLauncher, result] = useAddSessionLauncherMutation();
  const { data: project } = useGetNamespacesByNamespaceProjectsAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id;

  const defaultEnvironmentSelect =
    categoryDefinition.allowedEnvironmentSelects[0];

  const defaultFormValues = useMemo(
    () => getNewLauncherFormDefaultValues(defaultEnvironmentSelect),
    [defaultEnvironmentSelect]
  );

  const useFormResult = useForm<SessionLauncherForm>({
    defaultValues: defaultFormValues,
  });
  const {
    control,
    formState: { errors, touchedFields },
    getValues,
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
  const watchBuilderVariant = watch("builder_variant");

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

  const touchFields = useCallback(
    (fieldNames: (keyof SessionLauncherForm)[]) => {
      fieldNames.forEach((fieldName) => {
        setValue(fieldName, getValues(fieldName), {
          shouldDirty: true,
          shouldTouch: true,
        });
      });
    },
    [getValues, setValue]
  );

  const onNext = useCallback(async () => {
    const fieldsToValidate: (keyof SessionLauncherForm)[] = [
      "builder_variant",
      "container_image",
      "environmentId",
      "frontend_variant",
      "repository",
    ];

    if (watchEnvironmentSelect === "custom + image") {
      fieldsToValidate.push("command", "args");
    }

    if (
      launcherCategory === "job" &&
      watchEnvironmentSelect === "custom + build"
    ) {
      fieldsToValidate.push("command", "args");
    }

    touchFields(fieldsToValidate);
    const isValidStep = await trigger(fieldsToValidate, { shouldFocus: true });

    if (isEnvironmentDefined && isValidStep) {
      setStep(LauncherStep.LauncherDetails);
    }
  }, [
    isEnvironmentDefined,
    launcherCategory,
    touchFields,
    trigger,
    watchEnvironmentSelect,
  ]);

  const onCancel = useCallback(() => {
    setStep(LauncherStep.Environment);
    reset(defaultFormValues);
    toggle();
  }, [defaultFormValues, reset, toggle]);

  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { name, resourceClass, description } = data;
      const environment = getFormattedEnvironmentValues(data, launcherCategory);
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
            description: description?.trim() ? description : undefined,
            launcher_type: getLauncherApiType(launcherCategory),
            environment: environment.data,
          },
        });
    },
    [addSessionLauncher, launcherCategory, projectId]
  );

  useEffect(() => {
    trigger(["container_image"]);
  }, [watchEnvironmentCustomImage, trigger]);

  useEffect(() => {
    if (
      !isGlobalEnvironmentIncluded(categoryDefinition.allowedEnvironmentSelects)
    ) {
      return;
    }
    trigger(["environmentId"]);
    if (environments?.length) {
      const environmentSelected = environments.find(
        (env) => env.id === watchEnvironmentId
      );
      setValue("name", environmentSelected?.name ?? "");
    }
  }, [
    categoryDefinition.allowedEnvironmentSelects,
    watchEnvironmentId,
    setValue,
    environments,
    trigger,
  ]);

  useEffect(() => {
    if (watchEnvironmentSelect === "custom + build" && watchBuilderVariant) {
      setValue(
        "name",
        `${
          watchBuilderVariant.charAt(0).toUpperCase() +
          watchBuilderVariant.slice(1)
        } environment`
      );
    }
  }, [watchEnvironmentSelect, watchBuilderVariant, setValue]);

  useEffect(() => {
    if (
      !isGlobalEnvironmentIncluded(categoryDefinition.allowedEnvironmentSelects)
    ) {
      return;
    }
    if (environments == null) {
      return;
    }
    if (environments.length == 0) {
      setValue("environmentSelect", "custom + image");
    }
  }, [categoryDefinition.allowedEnvironmentSelects, environments, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setStep(LauncherStep.Environment);
      reset(defaultFormValues);
      result.reset();
    }
  }, [defaultFormValues, isOpen, reset, result]);

  return (
    <Modal
      backdrop="static"
      centered
      className={cx(
        step !== LauncherStep.LauncherDetails && scrollableModalStyles.modal
      )}
      fullscreen="lg"
      isOpen={isOpen}
      scrollable={step !== LauncherStep.LauncherDetails}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        <HeaderIcon className={cx("bi", "me-1")} />
        Create a new launcher - {categoryDefinition.text.display}
      </ModalHeader>
      <ModalBody>
        {result.isSuccess ? (
          <ConfirmationCreate
            launcherCategoryTitle={categoryDefinition.text.display}
          />
        ) : (
          <div className={cx("d-flex", "flex-column", "gap-3")}>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              {result.error && <RtkOrDataServicesError error={result.error} />}
              {step === LauncherStep.Environment && (
                <EnvironmentFields
                  control={control}
                  errors={errors}
                  launcherCategory={launcherCategory}
                  setValue={setValue}
                  touchedFields={touchedFields}
                  watch={watch}
                />
              )}
              {step === LauncherStep.LauncherDetails && (
                <LauncherDetailsFields
                  control={control}
                  launcherCategory={launcherCategory}
                />
              )}
            </Form>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="close-cancel-button"
          color="outline-primary"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          {result.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!result.isSuccess && step === LauncherStep.LauncherDetails && (
          <Button
            color="outline-primary"
            data-cy="back-environment-button"
            onClick={() => setStep(LauncherStep.Environment)}
          >
            <ArrowLeft className={cx("bi", "me-1")} />
            Back
          </Button>
        )}
        {!result.isSuccess && step === LauncherStep.Environment && (
          <Button
            color="outline-primary"
            data-cy="back-launcher-type-button"
            onClick={() => goBack()}
          >
            <ArrowLeft className={cx("bi", "me-1")} />
            Back
          </Button>
        )}
        {!result.isSuccess && step === LauncherStep.Environment && (
          <Button
            color="primary"
            data-cy="next-launcher-button"
            onClick={onNext}
            type="button"
          >
            Next
            <ArrowRight className={cx("bi", "ms-1")} />
          </Button>
        )}
        {!result.isSuccess && step === LauncherStep.LauncherDetails && (
          <Button
            color="primary"
            data-cy="add-launcher-button"
            disabled={result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Add {categoryDefinition.text.inline} launcher
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

function ConfirmationCreate({
  launcherCategoryTitle,
}: {
  launcherCategoryTitle: string;
}) {
  return (
    <SuccessAlert
      data-cy="session-launcher-creation-success"
      dismissible={false}
      timeout={0}
    >
      <p className="mb-0">
        {launcherCategoryTitle} launcher was created successfully!
      </p>
    </SuccessAlert>
  );
}
