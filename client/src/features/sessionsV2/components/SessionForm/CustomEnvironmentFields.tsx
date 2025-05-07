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
import { Controller } from "react-hook-form";
import { Input, Label } from "reactstrap";
import { InfoAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Links } from "../../../../utils/constants/Docs";

import { CONTAINER_IMAGE_PATTERN } from "../../session.constants";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { AdvancedSettingsFields } from "./AdvancedSettingsFields";
import { EnvironmentFieldsProps } from "./EnvironmentField";

export function CustomEnvironmentFields({
  watch,
  control,
  errors,
}: EnvironmentFieldsProps) {
  const watchEnvironmentSelect = watch("environmentSelect");

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
              value: watchEnvironmentSelect === "custom + image",
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

      <div className={cx("fw-bold", "w-100")}>Advanced settings</div>

      <InfoAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          Please see the{" "}
          <ExternalLink
            role="text"
            url={Links.RENKU_2_HOW_TO_USE_OWN_DOCKER_IMAGE}
            title="documentation"
            showLinkIcon
            iconAfter
          />{" "}
          for how to complete this form to make your image run on Renkulab.
        </p>
      </InfoAlert>

      <AdvancedSettingsFields<SessionLauncherForm>
        control={control}
        errors={errors}
      />
    </div>
  );
}
