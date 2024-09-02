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
import { useMemo } from "react";
import {
  Control,
  FieldErrors,
  UseFormSetValue,
  Controller,
} from "react-hook-form";
import { SingleValue } from "react-select";
import { Label, Input } from "reactstrap";
import { WarnAlert } from "../../../../components/Alert";
import { useGetResourcePoolsQuery } from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import { SessionLauncherForm } from "../../sessionsV2.types";

interface LauncherDetailsFieldsProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
  setValue: UseFormSetValue<SessionLauncherForm>;
}
export function LauncherDetailsFields({
  setValue,
  control,
  errors,
}: LauncherDetailsFieldsProps) {
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
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className={cx("form-label", "mb-0")}>
        <span className="fw-bold">2 of 2. Define launcher details</span>
      </div>
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
              data-cy="launcher-name-input"
              autoFocus={true}
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
      </div>
      <div>
        <Label className="form-label" for="addSessionResourceClass">
          Session launcher compute resources
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
    </div>
  );
}
