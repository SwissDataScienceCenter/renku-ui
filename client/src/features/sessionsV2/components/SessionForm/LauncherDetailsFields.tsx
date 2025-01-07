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
import { Control, Controller, useWatch } from "react-hook-form";
import {
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  UncontrolledTooltip,
} from "reactstrap";
import { WarnAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { useGetResourcePoolsQuery } from "../../../dataServices/computeResources.api";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import { SessionLauncherForm } from "../../sessionsV2.types";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../../session/startSessionOptions.constants";

interface LauncherDetailsFieldsProps {
  control: Control<SessionLauncherForm>;
}
export function LauncherDetailsFields({ control }: LauncherDetailsFieldsProps) {
  const {
    data: resourcePools,
    isLoading: isLoadingResourcesPools,
    error: resourcePoolsError,
  } = useGetResourcePoolsQuery({});

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

  const watchCurrentSessionClass = useWatch({
    control,
    name: "resourceClass",
    defaultValue: defaultSessionClass,
  });
  const watchCurrentDiskStorage = useWatch({ control, name: "diskStorage" });

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
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx(error && "is-invalid")}
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
        {resourcePoolsError && (
          <RtkErrorAlert dismissible={false} error={resourcePoolsError} />
        )}
        {isLoadingResourcesPools && (
          <p>
            <Loader className="me-1" inline size={16} />
            Loading resource pools...
          </p>
        )}
        {!isLoadingResourcesPools &&
        resourcePools &&
        resourcePools?.length > 0 ? (
          <>
            <Controller
              control={control}
              name="resourceClass"
              defaultValue={defaultSessionClass}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <>
                  <SessionClassSelectorV2
                    id="addSessionResourceClass"
                    currentSessionClass={value}
                    resourcePools={resourcePools}
                    onChange={onChange}
                    defaultSessionClass={defaultSessionClass}
                  />
                  {error && (
                    <div className={cx("small", "text-danger")}>
                      Please provide a resource class
                    </div>
                  )}
                </>
              )}
              rules={{ required: true }}
            />
          </>
        ) : (
          <WarnAlert>
            There are no one resource pool available to create a session
          </WarnAlert>
        )}

        {watchCurrentSessionClass && (
          <div className={cx("field-group", "mt-3")}>
            <div>
              Disk Storage:{" "}
              <span className="fw-bold">
                {watchCurrentDiskStorage ? (
                  <>{watchCurrentDiskStorage} GB</>
                ) : (
                  <>{watchCurrentSessionClass?.default_storage} GB (default)</>
                )}
              </span>
            </div>
            <Controller
              control={control}
              name="diskStorage"
              render={({
                field: { ref, onChange, value, ...rest },
                fieldState: { error },
              }) => (
                <>
                  <div className={cx("form-check", "form-switch")}>
                    <Input
                      type="checkbox"
                      role="switch"
                      id="configure-disk-storage"
                      checked={watchCurrentDiskStorage != null}
                      onChange={() =>
                        onChange(
                          value
                            ? undefined
                            : watchCurrentSessionClass.default_storage
                        )
                      }
                    />
                    <Label for="configure-disk-storage">
                      Configure disk storage
                    </Label>
                  </div>
                  {watchCurrentDiskStorage != null && (
                    <>
                      <InputGroup className={cx(error && "is-invalid")}>
                        <Input
                          className={cx(error && "is-invalid")}
                          type="number"
                          min={MIN_SESSION_STORAGE_GB}
                          max={watchCurrentSessionClass.max_storage}
                          step={STEP_SESSION_STORAGE_GB}
                          innerRef={ref}
                          onChange={onChange}
                          value={value}
                          {...rest}
                        />
                        <InputGroupText id="configure-disk-storage-addon">
                          GB
                        </InputGroupText>
                        <UncontrolledTooltip target="configure-disk-storage-addon">
                          Gigabytes
                        </UncontrolledTooltip>
                      </InputGroup>
                      <FormText>
                        Default: {watchCurrentSessionClass.default_storage} GB,
                        max: {watchCurrentSessionClass.max_storage} GB
                      </FormText>
                      <div className="invalid-feedback">
                        {error?.message ?? "Invalid disk storage."}
                      </div>
                    </>
                  )}
                </>
              )}
              rules={{
                max: {
                  value: watchCurrentSessionClass.max_storage,
                  message: `Selected disk storage exceeds maximum allowed value (${watchCurrentSessionClass.max_storage} GB).`,
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
