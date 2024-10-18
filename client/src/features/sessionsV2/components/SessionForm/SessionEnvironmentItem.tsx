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
import { Globe2 } from "react-bootstrap-icons";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldErrors,
  FieldNamesMarkedBoolean,
} from "react-hook-form";
import { SingleValue } from "react-select";
import { Card, CardBody, Input, Label, ListGroupItem } from "reactstrap";
import { TimeCaption } from "../../../../components/TimeCaption";
import {
  ResourceClass,
  ResourcePool,
} from "../../../dataServices/dataServices.types";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import {
  SessionEnvironment,
  SessionLauncherForm,
} from "../../sessionsV2.types";

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
  resourcePools,
  isLoadingResourcesPools,
  onChangeResourceClass,
  errors,
}: SessionEnvironmentItemProps) {
  const { creation_date, id, name, description } = environment;
  const isSelected = field.value === id;

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
      className={cx(isSelected && "bg-primary", isSelected && "bg-opacity-10")}
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
          {description ? <p className="mb-2">{description}</p> : null}
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
