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
import { prioritizeSelectedEnvironment } from "../../session.utils";
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
  const environmentKind = watch("environment_kind");
  const [isAdvanceSettingOpen, setIsAdvanceSettingsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setIsAdvanceSettingsOpen((isAdvanceSettingOpen) => !isAdvanceSettingOpen),
    []
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
          name="environment_id"
          rules={{ required: environmentKind === "GLOBAL" }}
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
                className={cx(errors.environment_id && "is-invalid")}
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
        rules={{ required: environmentKind === "CUSTOM" }}
        render={({ field }) => (
          <Input
            id="addSessionLauncherContainerImage"
            placeholder="Docker image"
            {...field}
            className={cx(errors.container_image && "is-invalid")}
          />
        )}
      />
      <div className="invalid-feedback">Please provide a container image</div>
      <div>
        <span
          className={cx("fw-bold", "cursor-pointer")}
          onClick={toggleIsOpen}
        >
          Advance settings <ChevronFlippedIcon flipped={isAdvanceSettingOpen} />
        </span>
      </div>
      <Collapse isOpen={isAdvanceSettingOpen}>
        <AdvanceSettingsFields<SessionLauncherForm>
          control={control}
          errors={errors}
        />
      </Collapse>
    </>
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
      <EnvironmentKindField control={control} setValue={setValue} />

      {environmentKind === "GLOBAL" && renderEnvironmentList()}

      {environmentKind === "CUSTOM" && renderCustomEnvironmentFields()}
    </div>
  );
}
