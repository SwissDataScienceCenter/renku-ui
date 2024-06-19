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

import cx from "classnames";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useGetSessionEnvironmentsQuery } from "./sessionsV2.api";
import { EnvironmentKind, SessionEnvironment } from "./sessionsV2.types";

import { useEffect, useState } from "react";
import { WarnAlert } from "../../components/Alert.jsx";
import rkIconGlobalEnv from "../../styles/assets/globalEnvironment.svg";
import styles from "./SessionLauncherForm.module.scss";

export interface SessionLauncherForm {
  name: string;
  description: string;
  environment_kind: EnvironmentKind;
  environment_id: string;
  container_image: string;
  default_url: string;
}

/* Edit session launcher */
interface SessionLauncherFormContentProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
  watch: UseFormWatch<SessionLauncherForm>;
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<SessionLauncherForm>>
  >;
}
export default function SessionLauncherFormContent({
  control,
  errors,
  watch,
  touchedFields,
}: SessionLauncherFormContentProps) {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();
  const watchEnvironmentKind = watch("environment_kind");

  return (
    <>
      <div className="mb-3">
        <Label className="form-label" for="addSessionLauncherName">
          Name
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
      <div className="mb-3">
        <Label className="form-label" for="addSessionLauncherDescription">
          Description
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

      <div className="mb-3">
        <div className="form-label">Environment Type</div>

        <Controller
          control={control}
          name="environment_kind"
          render={({ field }) => (
            <div className={cx("d-flex", "gap-4")}>
              <div>
                <Input
                  id="addSessionLauncherGlobalEnvironment"
                  type="radio"
                  {...field}
                  value={"global_environment"}
                  checked={field.value === "global_environment"}
                  disabled={environments && environments.length == 0}
                  data-cy="edit-session-type-existing"
                />
                <Label
                  className={cx(
                    environments && environments.length == 0 && "d-none",
                    "ms-2"
                  )}
                  for="addSessionLauncherGlobalEnvironment"
                >
                  Global environment
                </Label>
              </div>
              <div>
                <Input
                  id="addSessionLauncherContainerImage"
                  type="radio"
                  {...field}
                  value={"container_image"}
                  checked={field.value === "container_image"}
                  data-cy="edit-session-type-custom"
                />
                <Label className="ms-2" for="addSessionLauncherContainerImage">
                  Custom Image
                </Label>
              </div>
            </div>
          )}
        />
      </div>

      <div
        className={cx(
          watchEnvironmentKind !== "global_environment" && "d-none"
        )}
      >
        <div className="form-label">Environment</div>

        {isLoading && (
          <p>
            <Loader className="me-1" inline size={16} />
            Loading environments...
          </p>
        )}
        {error && (
          <>
            <p>Cannot load environments</p>
            <RtkErrorAlert dismissible={false} error={error} />
          </>
        )}
        {environments && environments.length > 0 && (
          <Controller
            control={control}
            name="environment_id"
            render={({ field }) => (
              <>
                <Row className={cx("row-cols-2", "mb-3")}>
                  {environments.map((environment) => (
                    <SessionEnvironmentItem
                      key={environment.id}
                      environment={environment}
                      field={field}
                      touchedFields={touchedFields}
                    />
                  ))}
                </Row>
                <Input
                  className={cx(errors.environment_id && "is-invalid")}
                  id="addSessionLauncherEnvironmentId"
                  type="hidden"
                  {...field}
                />
                <div className="invalid-feedback">
                  Please choose an environment
                </div>
              </>
            )}
            rules={{
              required: watchEnvironmentKind === "global_environment",
            }}
          />
        )}
      </div>

      <div
        className={cx(
          watchEnvironmentKind !== "container_image" && "d-none",
          "mb-3"
        )}
      >
        <Label className="form-label" for="addSessionLauncherContainerImage">
          Container Image
        </Label>
        <Controller
          control={control}
          name="container_image"
          render={({ field }) => (
            <Input
              className={cx(errors.container_image && "is-invalid")}
              id="addSessionLauncherContainerImage"
              placeholder="Docker image"
              type="text"
              {...field}
            />
          )}
          rules={{ required: watchEnvironmentKind === "container_image" }}
        />
        <div className="invalid-feedback">Please provide a container image</div>
      </div>

      <div>
        <Label className="form-label" for="addSessionLauncherDefaultUrl">
          Default URL
        </Label>
        <Controller
          control={control}
          name="default_url"
          render={({ field }) => (
            <Input
              className="form-control"
              id="addSessionLauncherDefaultUrl"
              placeholder="/lab"
              type="text"
              {...field}
            />
          )}
        />
      </div>
    </>
  );
}

/* Add custom session launcher */
interface CustomEnvFormContentProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
}
export function CustomEnvFormContent({
  control,
  errors,
}: CustomEnvFormContentProps) {
  return (
    <>
      <div className={cx("mb-5", "mt-5")}>
        <Label className="form-label" for="addSessionLauncherContainerImage">
          Container Image
        </Label>
        <Controller
          control={control}
          name="container_image"
          rules={{ required: true }}
          render={({ field }) => (
            <Input
              className={cx(errors.container_image && "is-invalid")}
              id="addSessionLauncherContainerImage"
              placeholder="Docker image"
              type="text"
              data-cy="custom-image-input"
              {...field}
            />
          )}
        />
        <div className="invalid-feedback">Please provide a container image</div>
      </div>
      <div className="mb-5">
        <Label className="form-label" for="addSessionLauncherName">
          Session launcher Name
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
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
      </div>

      <div>
        <Label className="form-label" for="addSessionLauncherDefaultUrl">
          Default URL (Optional)
        </Label>
        <Controller
          control={control}
          name="default_url"
          render={({ field }) => (
            <Input
              className="form-control"
              id="addSessionLauncherDefaultUrl"
              placeholder="/lab"
              type="text"
              {...field}
            />
          )}
        />
      </div>
    </>
  );
}

/* Add existing session launcher */
interface ExistingEnvFormContentProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
  watch: UseFormWatch<SessionLauncherForm>;
  setValue: UseFormSetValue<SessionLauncherForm>;
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<SessionLauncherForm>>
  >;
}
export function ExistingEnvFormContent({
  control,
  errors,
  watch,
  setValue,
  touchedFields,
}: ExistingEnvFormContentProps) {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();
  const watchEnvironmentId = watch("environment_id");

  useEffect(() => {
    if (watchEnvironmentId == null) {
      return;
    }
    if (environments && environments.length > 0 && watchEnvironmentId) {
      const selectedEnv = environments.filter(
        (e) => e.id === watchEnvironmentId
      );
      if (selectedEnv) setValue("name", selectedEnv[0].name);
    }
  }, [watchEnvironmentId, setValue, environments]);

  return (
    <>
      <div>
        {isLoading && (
          <p>
            <Loader className="me-1" inline size={16} />
            Loading environments...
          </p>
        )}
        {error && (
          <>
            <p>Cannot load environments</p>
            <RtkErrorAlert dismissible={false} error={error} />
          </>
        )}
        {environments && environments.length > 0 && (
          <Controller
            control={control}
            name="environment_id"
            render={({ field }) => (
              <>
                {environments.map((environment) => (
                  <SessionEnvironmentItem
                    key={environment.id}
                    environment={environment}
                    field={field}
                    touchedFields={touchedFields}
                  />
                ))}
                <Input
                  className={cx(errors.environment_id && "is-invalid")}
                  id="addSessionLauncherEnvironmentId"
                  type="hidden"
                  {...field}
                />
                <div className="invalid-feedback">
                  Please choose an environment
                </div>
              </>
            )}
            rules={{ required: true }}
          />
        )}
        {!isLoading && environments && environments.length === 0 && (
          <WarnAlert dismissible={false}>
            No existing environments are available. Please contact an admin to
            update this list.
          </WarnAlert>
        )}
      </div>
    </>
  );
}

/* Environment Item */
interface SessionEnvironmentItemProps {
  environment: SessionEnvironment;
  field: ControllerRenderProps<SessionLauncherForm, "environment_id">;
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<SessionLauncherForm>>
  >;
}

export function SessionEnvironmentItem({
  environment,
  field,
  touchedFields,
}: SessionEnvironmentItemProps) {
  const { creation_date, id, name, description } = environment;
  const isSelected = field.value === id;

  const [orderCard, setOrderCard] = useState(isSelected);
  const isEnvironmentIdTouched = touchedFields.environment_id;

  useEffect(() => {
    if (!orderCard || isEnvironmentIdTouched) setOrderCard(false);
  }, [isSelected, orderCard, isEnvironmentIdTouched]);

  return (
    <Col
      xs={12}
      className={cx("mb-3", isSelected && orderCard && "order-first")}
    >
      <Input
        className="btn-check"
        id={`addSessionLauncherGlobalEnvironment-${id}`}
        type="radio"
        {...field}
        value={id}
        checked={isSelected}
      />
      <Label
        className={cx(
          "d-block",
          "h-100",
          "w-100",
          "rounded",
          "focus-ring",
          "focus-ring-primary",
          "cursor-pointer",
          styles.environmentLabel
        )}
        for={`addSessionLauncherGlobalEnvironment-${id}`}
        data-cy="global-environment-item"
      >
        <Card>
          <CardBody
            className={cx(
              isSelected
                ? "border rounded border-rk-green bg-success-subtle"
                : "border rounded border-dark-subtle",
              !isSelected && styles.environmentCard
            )}
          >
            <CardTitle className={cx("mb-0", "fs-5", "text-rk-green")} tag="h5">
              {name}
            </CardTitle>
            <CardText>
              <img
                src={rkIconGlobalEnv}
                className={cx("rk-icon", "rk-icon-md", "me-2")}
              />{" "}
              Global environment
            </CardText>
            <CardText className="mb-0">
              {description ? description : <i>No description</i>}
            </CardText>
            <CardText>
              <TimeCaption
                datetime={creation_date}
                enableTooltip
                prefix="Created"
              />
            </CardText>
          </CardBody>
        </Card>
      </Label>
    </Col>
  );
}
