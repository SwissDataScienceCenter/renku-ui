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
import { useCallback, useMemo, useState } from "react";
import {
  Controller,
  useController,
  type Control,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Collapse, Label } from "reactstrap";

import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";
import { BUILDER_PLATFORMS } from "../../session.constants";
import type { SessionLauncherForm } from "../../sessionsV2.types";
import BuilderSelectorCommon from "./BuilderSelectorCommon";

interface BuilderAdvancedSettingsProps {
  control: Control<SessionLauncherForm>;
}

export default function BuilderAdvancedSettings({
  control,
}: BuilderAdvancedSettingsProps) {
  const {
    formState: { defaultValues },
  } = useController({ control, name: "platform" });
  const isDefaultPlatform =
    defaultValues?.platform == null ||
    defaultValues.platform === "" ||
    defaultValues.platform === BUILDER_PLATFORMS[0].value;
  const [isOpen, setIsOpen] = useState(!isDefaultPlatform);
  const toggleIsOpen = useCallback(
    () => setIsOpen((isAdvancedSettingOpen) => !isAdvancedSettingOpen),
    []
  );
  return (
    <div className={cx("d-flex", "flex-column", "gap-1")}>
      <button
        className={cx(
          "d-flex",
          "align-items-center",
          "w-100",
          "bg-transparent",
          "border-0",
          "p-0",
          "h4"
        )}
        type="button"
        onClick={toggleIsOpen}
      >
        Advanced settings
        <ChevronFlippedIcon className="ms-1" flipped={isOpen} />
      </button>
      <Collapse isOpen={isOpen}>
        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <BuilderPlatformSelector name="platform" control={control} />
        </div>
      </Collapse>
    </div>
  );
}

interface BuilderPlatformSelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {}

function BuilderPlatformSelector<T extends FieldValues>({
  ...controllerProps
}: BuilderPlatformSelectorProps<T>) {
  const defaultValue = useMemo(
    () =>
      controllerProps.defaultValue
        ? controllerProps.defaultValue
        : BUILDER_PLATFORMS[0],
    [controllerProps.defaultValue]
  );

  return (
    <div>
      <Label for="builder-environment-platform-select-input">Platform</Label>
      <Controller
        {...controllerProps}
        render={({
          field: { onBlur, onChange, value, disabled },
          fieldState: { error },
        }) => (
          <>
            <div
              className={cx(error && "is-invalid")}
              data-cy="environment-platform-select"
            >
              <BuilderSelectorCommon
                defaultValue={defaultValue}
                disabled={disabled}
                id="builder-environment-platform-select"
                inputId="builder-environment-platform-select-input"
                name={controllerProps.name}
                onBlur={onBlur}
                onChange={onChange}
                options={BUILDER_PLATFORMS}
                value={value ?? ""}
              />
            </div>
            <div className="invalid-feedback">
              {error?.message ? (
                <>{error.message}</>
              ) : (
                <>Please select a valid platform.</>
              )}
            </div>
          </>
        )}
        rules={
          controllerProps.rules ?? {
            required: "Please select a platform.",
          }
        }
      />
    </div>
  );
}
