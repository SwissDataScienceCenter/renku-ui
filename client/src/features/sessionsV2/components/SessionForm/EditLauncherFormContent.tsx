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
import { useEffect, useMemo } from "react";
import { ExclamationTriangle } from "react-bootstrap-icons";
import {
  Control,
  Controller,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormWatch,
} from "react-hook-form";
import { Input, Label, ListGroup } from "reactstrap";
import useDebouncedState from "~/utils/customHooks/useDebouncedState.hook";
import { InfoAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { Links } from "../../../../utils/constants/Docs";
import { useGetEnvironmentsQuery as useGetSessionEnvironmentsQuery } from "../../api/sessionLaunchersV2.api";
import { useGetSessionsImagesQuery } from "../../api/sessionsV2.api";
import { CONTAINER_IMAGE_PATTERN } from "../../session.constants";
import { prioritizeSelectedEnvironment } from "../../session.utils";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { AdvancedSettingsFields } from "./AdvancedSettingsFields";
import BuilderEnvironmentFields from "./BuilderEnvironmentFields";
import EnvironmentKindField from "./EnvironmentKindField";
import InputOverlayLoader from "./InputOverlayLoader";
import { SessionEnvironmentItem } from "./SessionEnvironmentItem";

interface SessionLauncherFormContentProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
  watch: UseFormWatch<SessionLauncherForm>;
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<SessionLauncherForm>>
  >;
}

interface EditLauncherFormContentProps extends SessionLauncherFormContentProps {
  environmentId?: string;
}
export default function EditLauncherFormContent({
  control,
  errors,
  watch,
  touchedFields,
  environmentId,
}: EditLauncherFormContentProps) {
  const watchEnvironmentSelect = watch("environmentSelect");
  const watchContainerImage = watch("container_image");

  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery({});

  const [debouncedContainerImage, setDebouncedContainerImage] =
    useDebouncedState<string>(watchContainerImage ?? "", 1_000);
  useEffect(() => {
    setDebouncedContainerImage(watchContainerImage ?? "");
  }, [watchContainerImage, setDebouncedContainerImage]);

  const inputModified = watchContainerImage !== debouncedContainerImage;

  const { data, isFetching } = useGetSessionsImagesQuery(
    watchEnvironmentSelect === "custom + image" && debouncedContainerImage
      ? { imageUrl: debouncedContainerImage }
      : skipToken
  );

  const orderedEnvironment = useMemo(
    () => prioritizeSelectedEnvironment(environments, environmentId),
    [environments, environmentId]
  );

  const renderEnvironmentList = () => {
    if (isLoading) {
      return (
        <p>
          <Loader inline size={16} className="me-1" />
          Loading environments...
        </p>
      );
    }
    if (error) {
      return (
        <>
          <p>Cannot load environments</p>
          <RtkErrorAlert dismissible={false} error={error} />
        </>
      );
    }
    if (orderedEnvironment && orderedEnvironment.length > 0) {
      return (
        <Controller
          control={control}
          name="environmentId"
          rules={{ required: watchEnvironmentSelect === "global" }}
          render={({ field }) => (
            <>
              <ListGroup>
                {orderedEnvironment.map((env) => (
                  <SessionEnvironmentItem
                    key={env.id}
                    environment={env}
                    field={field}
                    touchedFields={touchedFields}
                    errors={errors}
                    control={control}
                  />
                ))}
              </ListGroup>
              <Input
                type="hidden"
                {...field}
                className={cx(errors.environmentId && "is-invalid")}
              />
              <div className="invalid-feedback">
                Please choose an environment
              </div>
            </>
          )}
        />
      );
    }
    return null;
  };

  const renderCustomEnvironmentFields = () => (
    <>
      <Label className="form-label" htmlFor="addSessionLauncherContainerImage">
        Container Image
      </Label>
      <Controller
        control={control}
        name="container_image"
        render={({ field }) => (
          <div className="position-relative">
            <Input
              className={cx(
                errors.container_image && "is-invalid",
                !errors.container_image &&
                  data?.accessible === true &&
                  !isFetching &&
                  !inputModified &&
                  "is-valid"
              )}
              data-cy="custom-image-input"
              id="addSessionLauncherContainerImage"
              placeholder="image:tag"
              type="text"
              {...field}
            />
            {isFetching && <InputOverlayLoader />}
          </div>
        )}
        rules={{
          required: {
            value: watchEnvironmentSelect === "custom + image",
            message: "Please provide a container image.",
          },
          pattern: {
            value: CONTAINER_IMAGE_PATTERN,
            message: "Please provide a valid container image.",
          },
        }}
      />
      <div className="invalid-feedback">
        {errors.container_image?.message ??
          "Please provide a valid container image."}
      </div>
      {!isFetching &&
        !errors.container_image?.message &&
        data?.accessible === false && (
          <div className={cx("mt-1", "small", "text-warning-emphasis")}>
            <ExclamationTriangle className="bi" /> Image not found. Access to
            this image may require connecting an additional integration after
            creating this launcher.
          </div>
        )}
      <div className={cx("fw-bold", "w-100")}>Advanced settings</div>

      <InfoAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          Please see the{" "}
          <ExternalLink
            role="text"
            url={Links.RENKU_2_HOW_TO_USE_OWN_DOCKER_IMAGE}
            title="documentation"
            showLinkIcon
            iconAfter
          />{" "}
          for how to complete this form to make your image run on Renkulab.
        </p>
      </InfoAlert>

      <AdvancedSettingsFields<SessionLauncherForm>
        control={control}
        errors={errors}
      />
    </>
  );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <EnvironmentKindField control={control} />

      {watchEnvironmentSelect === "global" && renderEnvironmentList()}
      {watchEnvironmentSelect === "custom + image" &&
        renderCustomEnvironmentFields()}
      {watchEnvironmentSelect === "custom + build" && (
        <BuilderEnvironmentFields control={control} isEdit />
      )}
    </div>
  );
}

export function EditLauncherFormMetadata({
  control,
  errors,
}: EditLauncherFormContentProps) {
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div>
        <Label className="form-label" for="addSessionLauncherName">
          Session launcher name
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              className={cx(errors.name && "is-invalid")}
              id="addSessionLauncherName"
              placeholder="session name"
              type="text"
              data-cy="edit-session-name"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
      </div>
      <div>
        <Label className="form-label" for="addSessionLauncherDescription">
          Session launcher description
          <span className={cx("text-muted", "small", "ms-2")}>(Optional)</span>
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <textarea
              className="form-control"
              id="addSessionLauncherDescription"
              placeholder="session description"
              rows={3}
              {...field}
            />
          )}
        />
      </div>
    </div>
  );
}
