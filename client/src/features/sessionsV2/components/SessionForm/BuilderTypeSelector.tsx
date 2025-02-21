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
  type Path,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "reactstrap";
import { BUILDER_TYPES } from "../../session.constants";
import BuilderSelectorCommon from "./BuilderSelectorCommon";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { BoxArrowUpRight } from "react-bootstrap-icons";

interface BuilderTypeSelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {}

export default function BuilderTypeSelector<T extends FieldValues>({
  ...controllerProps
}: BuilderTypeSelectorProps<T>) {
  const defaultValue = useMemo(
    () =>
      controllerProps.defaultValue
        ? controllerProps.defaultValue
        : BUILDER_TYPES[0],
    [controllerProps.defaultValue]
  );

  return (
    <div>
      <Label for="builder-environment-type-select-input">
        Environment type{" - "}
        <ExternalLink
          role="link"
          url="https://www.notion.so/renku/UX-Research-How-to-create-a-custom-environment-from-a-code-repository-1960df2efafc801b88f6da59a0aa8234?pvs=4#1990df2efafc805f8548cbd5dafd200c"
        >
          Learn more
          <BoxArrowUpRight className={cx("bi", "ms-1")} />
        </ExternalLink>
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
                name={controllerProps.name}
                defaultValue={defaultValue}
                options={BUILDER_TYPES}
                onBlur={onBlur}
                onChange={onChange}
                value={value ?? ""}
                disabled={disabled}
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
        defaultValue={defaultValue as PathValue<T, Path<T>>}
      />
    </div>
  );
}
