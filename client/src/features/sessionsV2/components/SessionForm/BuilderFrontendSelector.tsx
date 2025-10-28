/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "reactstrap";
import { BUILDER_FRONTENDS } from "../../session.constants";
import BuilderSelectorCommon from "./BuilderSelectorCommon";

interface BuilderFrontendSelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {}

export default function BuilderFrontendSelector<T extends FieldValues>({
  ...controllerProps
}: BuilderFrontendSelectorProps<T>) {
  const defaultValue = useMemo(
    () =>
      controllerProps.defaultValue
        ? controllerProps.defaultValue
        : BUILDER_FRONTENDS[0],
    [controllerProps.defaultValue]
  );

  return (
    <div>
      <Label for="builder-environment-frontend-select-input">
        User interface
      </Label>
      <Controller
        {...controllerProps}
        render={({
          field: { onBlur, onChange, value, disabled },
          fieldState: { error },
        }) => (
          <>
            <div
              className={cx(error && "is-invalid")}
              data-cy="environment-type-select"
            >
              <BuilderSelectorCommon
                defaultValue={defaultValue}
                disabled={disabled}
                id="builder-environment-frontend-select"
                inputId="builder-environment-frontend-select-input"
                name={controllerProps.name}
                onBlur={onBlur}
                onChange={onChange}
                options={BUILDER_FRONTENDS}
                value={value ?? ""}
              />
            </div>
            <div className="invalid-feedback">
              {error?.message ? (
                <>{error.message}</>
              ) : (
                <>Please select a valid environment type.</>
              )}
            </div>
          </>
        )}
        rules={
          controllerProps.rules ?? {
            required: "Please select an environment type.",
          }
        }
      />
    </div>
  );
}
