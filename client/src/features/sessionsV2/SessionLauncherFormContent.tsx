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
import { useEffect, useMemo, useState } from "react";
import { SingleValue } from "react-select";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormResetField,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Card,
  CardBody,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import { Globe2 } from "react-bootstrap-icons";

import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useGetSessionEnvironmentsQuery } from "./sessionsV2.api";
import { EnvironmentKind, SessionEnvironment } from "./sessionsV2.types";
import { WarnAlert } from "../../components/Alert.jsx";
import { useGetResourcePoolsQuery } from "../dataServices/computeResources.api";
import {
  ResourceClass,
  ResourcePool,
} from "../dataServices/dataServices.types";
import { SessionClassSelectorV2 } from "../session/components/options/SessionClassOption";

export interface SessionLauncherForm {
  name: string;
  description: string;
  environment_kind: EnvironmentKind;
  environment_id: string;
  container_image: string;
  default_url: string;
  resourceClass: ResourceClass;
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
              <div
                className={cx(
                  environments && environments.length == 0 && "d-none"
                )}
              >
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
                  className="ms-2"
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
                <Row>
                  {environments.map((environment) => (
                    <SessionEnvironmentItem
                      key={environment.id}
                      environment={environment}
                      field={field}
                      touchedFields={touchedFields}
                      errors={errors}
                      control={control}
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
  setValue: UseFormSetValue<SessionLauncherForm>;
}
export function CustomEnvFormContent({
  control,
  errors,
  setValue,
}: CustomEnvFormContentProps) {
  const { data: resourcePools, isLoading: isLoadingResourcesPools } =
    useGetResourcePoolsQuery({});

  const onChangeResourceClass = (resourceClass: SingleValue<ResourceClass>) => {
    if (resourceClass) setValue("resourceClass", resourceClass);
  };

  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [resourcePools]
  );

  return (
    <>
      <div className="mb-3">
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
              data-cy="launcher-name-input"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
      </div>
      <div className="mb-3">
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
      <div className="mb-3">
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
      <div>
        <Label className="form-label" for="addSessionResourceClass">
          Compute resources
        </Label>
        {!isLoadingResourcesPools &&
        resourcePools &&
        resourcePools?.length > 0 ? (
          <Controller
            control={control}
            name="resourceClass"
            defaultValue={defaultSessionClass}
            render={() => (
              <>
                <SessionClassSelectorV2
                  id="addSessionResourceClass"
                  resourcePools={resourcePools}
                  onChange={onChangeResourceClass}
                  defaultSessionClass={defaultSessionClass}
                />
                {errors?.resourceClass && (
                  <div className={cx("small", "text-danger")}>
                    Please provide a resource class
                  </div>
                )}
              </>
            )}
            rules={{ required: true }}
          />
        ) : (
          <WarnAlert>
            There are no one resource pool available to create a session
          </WarnAlert>
        )}
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
  resetField: UseFormResetField<SessionLauncherForm>;
}
export function ExistingEnvFormContent({
  control,
  errors,
  watch,
  setValue,
  touchedFields,
  resetField,
}: ExistingEnvFormContentProps) {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();
  const { data: resourcePools, isLoading: isLoadingResourcesPools } =
    useGetResourcePoolsQuery({});
  const watchEnvironmentId = watch("environment_id");
  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [resourcePools]
  );

  useEffect(() => {
    if (watchEnvironmentId == null) {
      return;
    }
    if (environments && environments.length > 0 && watchEnvironmentId) {
      const selectedEnv = environments.filter(
        (e) => e.id === watchEnvironmentId
      );
      if (selectedEnv) {
        setValue("name", selectedEnv[0].name);
        resetField("resourceClass");
        if (defaultSessionClass) setValue("resourceClass", defaultSessionClass);
      }
    }
  }, [
    watchEnvironmentId,
    setValue,
    environments,
    resetField,
    defaultSessionClass,
  ]);

  const onChangeResourceClass = (resourceClass: SingleValue<ResourceClass>) => {
    if (resourceClass) setValue("resourceClass", resourceClass);
  };

  if (error)
    return (
      <div>
        <p>Cannot load environments</p>
        <RtkErrorAlert dismissible={false} error={error} />
      </div>
    );
  if (isLoading)
    return (
      <p>
        <Loader className="me-1" inline size={16} />
        Loading environments...
      </p>
    );
  if (!environments)
    return (
      <p>
        <p>Cannot load environments</p>
      </p>
    );
  if (environments && environments.length === 0)
    return (
      <WarnAlert dismissible={false}>
        No existing environments available. Please contact an admin to update
        this list.
      </WarnAlert>
    );

  return (
    <>
      <Controller
        control={control}
        name="environment_id"
        render={({ field }) => (
          <>
            <ListGroup>
              {environments.map((environment) => (
                <SessionEnvironmentItem
                  key={environment.id}
                  environment={environment}
                  field={field}
                  touchedFields={touchedFields}
                  resourcePools={resourcePools}
                  onChangeResourceClass={onChangeResourceClass}
                  isLoadingResourcesPools={isLoadingResourcesPools}
                  errors={errors}
                  control={control}
                  defaultSessionClass={defaultSessionClass}
                />
              ))}
            </ListGroup>
            <Input
              className={cx(errors.environment_id && "is-invalid")}
              id="addSessionLauncherEnvironmentId"
              type="hidden"
              {...field}
            />
            <div className="invalid-feedback">Please choose an environment</div>
          </>
        )}
        rules={{ required: true }}
      />
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
  resourcePools?: ResourcePool[];
  isLoadingResourcesPools?: boolean;
  onChangeResourceClass?: (resourceClass: SingleValue<ResourceClass>) => void;
  errors: FieldErrors<SessionLauncherForm>;
  control: Control<SessionLauncherForm, unknown>;
  defaultSessionClass?: ResourceClass;
}

export function SessionEnvironmentItem({
  environment,
  control,
  defaultSessionClass,
  field,
  touchedFields,
  resourcePools,
  isLoadingResourcesPools,
  onChangeResourceClass,
  errors,
}: SessionEnvironmentItemProps) {
  const { creation_date, id, name, description } = environment;
  const isSelected = field.value === id;

  const [orderCard, setOrderCard] = useState(isSelected);
  const isEnvironmentIdTouched = touchedFields.environment_id;

  useEffect(() => {
    if (!orderCard || isEnvironmentIdTouched) setOrderCard(false);
  }, [isSelected, orderCard, isEnvironmentIdTouched]);

  const selector = !isLoadingResourcesPools &&
    resourcePools &&
    resourcePools?.length > 0 && (
      <Card className="mt-2">
        <Controller
          control={control}
          name="resourceClass"
          defaultValue={defaultSessionClass}
          render={() => (
            <CardBody>
              <Label for="resource-class-selector">Compute resources</Label>
              <SessionClassSelectorV2
                id="resource-class-selector"
                resourcePools={resourcePools}
                onChange={onChangeResourceClass}
                defaultSessionClass={defaultSessionClass}
              />
              {errors.resourceClass && (
                <Label className={cx("text-danger", "fs-small")}>
                  Select compute resource to continue{" "}
                </Label>
              )}
            </CardBody>
          )}
          rules={{ required: true }}
        />
      </Card>
    );

  return (
    <ListGroupItem
      action
      className={cx(
        isSelected && orderCard && "order-first",
        isSelected && "bg-primary",
        isSelected && "bg-opacity-10"
      )}
      data-cy="global-environment-item"
    >
      <Input
        className="btn-check"
        id={`addSessionLauncherGlobalEnvironment-${id}`}
        type="radio"
        {...field}
        value={id}
        checked={isSelected}
      />
      <div>
        <Label
          className={cx("cursor-pointer", "m-0", "w-100")}
          for={`addSessionLauncherGlobalEnvironment-${id}`}
        >
          <h5>{name}</h5>
          <p className="mb-2">
            <Globe2 className={cx("bi", "me-1")} />
            Global environment
          </p>
          {description ? <p className="mb-2">description</p> : null}
          <p className="m-0">
            <TimeCaption
              datetime={creation_date}
              enableTooltip
              prefix="Created"
            />
          </p>
        </Label>
        {isSelected && selector}
      </div>
    </ListGroupItem>
  );
}
