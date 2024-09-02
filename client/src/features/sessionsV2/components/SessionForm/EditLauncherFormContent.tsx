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
import { useCallback, useMemo, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Collapse, Input, Label, ListGroup } from "reactstrap";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import { Loader } from "../../../../components/Loader";
import { orderEnvironments } from "../../session.utils";
import { useGetSessionEnvironmentsQuery } from "../../sessionsV2.api";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { AdvanceSettingsFields } from "./AdvanceSettingsFields";
import { EnvironmentKindField } from "./EnvironmentKindField";
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
  setValue: UseFormSetValue<SessionLauncherForm>;
}
export default function EditLauncherFormContent({
  control,
  errors,
  watch,
  touchedFields,
  environmentId,
  setValue,
}: EditLauncherFormContentProps) {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();
  const watchEnvironmentKind = watch("environment_kind");
  const [isAdvanceSettingOpen, setIsAdvanceSettingsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setIsAdvanceSettingsOpen((isAdvanceSettingOpen) => !isAdvanceSettingOpen),
    []
  );

  const orderEnvironment = useMemo(
    () => orderEnvironments(environments, environmentId),
    [environments, environmentId]
  );

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
      <div>
        <EnvironmentKindField control={control} setValue={setValue} />
        {/*<div className="form-label">Environment Type</div>*/}
        {/*<Controller*/}
        {/*  control={control}*/}
        {/*  name="environment_kind"*/}
        {/*  render={({ field }) => (*/}
        {/*    <div className={cx("d-flex", "gap-4")}>*/}
        {/*      <div*/}
        {/*        className={cx(*/}
        {/*          environments && environments.length == 0 && "d-none"*/}
        {/*        )}*/}
        {/*      >*/}
        {/*        <Input*/}
        {/*          id="addSessionLauncherGlobalEnvironment"*/}
        {/*          type="radio"*/}
        {/*          {...field}*/}
        {/*          value={"GLOBAL"}*/}
        {/*          checked={field.value === "GLOBAL"}*/}
        {/*          disabled={environments && environments.length == 0}*/}
        {/*          data-cy="edit-session-type-existing"*/}
        {/*        />*/}
        {/*        <Label*/}
        {/*          className="ms-2"*/}
        {/*          for="addSessionLauncherGlobalEnvironment"*/}
        {/*        >*/}
        {/*          Global environment*/}
        {/*        </Label>*/}
        {/*      </div>*/}
        {/*      <div>*/}
        {/*        <Input*/}
        {/*          id="addSessionLauncherContainerImage"*/}
        {/*          type="radio"*/}
        {/*          {...field}*/}
        {/*          value={"CUSTOM"}*/}
        {/*          checked={field.value === "CUSTOM"}*/}
        {/*          data-cy="edit-session-type-custom"*/}
        {/*        />*/}
        {/*        <Label className="ms-2" for="addSessionLauncherContainerImage">*/}
        {/*          Custom Environment*/}
        {/*        </Label>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*/>*/}
      </div>
      <div className={cx(watchEnvironmentKind !== "GLOBAL" && "d-none")}>
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
        {orderEnvironment && orderEnvironment.length > 0 && (
          <Controller
            control={control}
            name="environment_id"
            render={({ field }) => (
              <>
                <ListGroup>
                  {orderEnvironment.map((environment) => (
                    <SessionEnvironmentItem
                      key={environment.id}
                      environment={environment}
                      field={field}
                      touchedFields={touchedFields}
                      errors={errors}
                      control={control}
                    />
                  ))}
                </ListGroup>
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
              required: watchEnvironmentKind === "GLOBAL",
            }}
          />
        )}
      </div>

      <div className={cx(watchEnvironmentKind !== "CUSTOM" && "d-none")}>
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
          rules={{ required: watchEnvironmentKind === "CUSTOM" }}
        />
        <div className="invalid-feedback">Please provide a container image</div>
      </div>
      {watchEnvironmentKind === "CUSTOM" && (
        <>
          <div>
            <span
              className={cx("fw-bold", "cursor-pointer")}
              onClick={toggleIsOpen}
            >
              Advance settings{" "}
              <ChevronFlippedIcon flipped={isAdvanceSettingOpen} />
            </span>
          </div>
          <Collapse isOpen={isAdvanceSettingOpen}>
            <AdvanceSettingsFields control={control} errors={errors} />
          </Collapse>
        </>
      )}
    </div>
  );
}
