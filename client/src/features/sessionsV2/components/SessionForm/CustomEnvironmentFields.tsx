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
import { useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { Collapse, Input, Label } from "reactstrap";

import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import { CONTAINER_IMAGE_PATTERN } from "../../session.constants";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { AdvancedSettingsFields } from "./AdvancedSettingsFields";
import { EnvironmentFieldsProps } from "./EnvironmentField";

export function CustomEnvironmentFields({
  watch,
  control,
  errors,
}: EnvironmentFieldsProps) {
  const watchEnvironmentKind = watch("environment_kind");
  const [isAdvanceSettingOpen, setIsAdvanceSettingsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setIsAdvanceSettingsOpen((isAdvanceSettingOpen) => !isAdvanceSettingOpen),
    []
  );
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <p className={cx("mb-0")}>
        Use a custom container image to create a session launcher. Provide the
        image name or reference, such as one from Docker Hub (e.g.,
        repository/image:tag).
      </p>
      <div className={cx("d-flex", "flex-column")}>
        <Label
          className={cx("form-label")}
          for="addSessionLauncherContainerImage"
        >
          Container Image
        </Label>
        <Controller
          control={control}
          name="container_image"
          render={({ field }) => (
            <Input
              className={cx(errors.container_image && "is-invalid")}
              id="addSessionLauncherContainerImage"
              placeholder="image:tag"
              type="text"
              autoFocus={true}
              data-cy="custom-image-input"
              {...field}
            />
          )}
          rules={{
            required: {
              value: watchEnvironmentKind === "CUSTOM",
              message: "Please provide a container image.",
            },
            pattern: {
              value: CONTAINER_IMAGE_PATTERN,
              message: "Please provide a valid container image.",
            },
          }}
        />
        <div className="invalid-feedback">
          {errors.container_image?.message ??
            "Please provide a valid container image."}
        </div>
      </div>
      <div>
        <span
          className={cx("fw-bold", "cursor-pointer")}
          onClick={toggleIsOpen}
        >
          Advanced settings{" "}
          <ChevronFlippedIcon flipped={isAdvanceSettingOpen} />
        </span>
      </div>
      <Collapse isOpen={isAdvanceSettingOpen}>
        <AdvancedSettingsFields<SessionLauncherForm>
          control={control}
          errors={errors}
        />
      </Collapse>
    </div>
  );
}
