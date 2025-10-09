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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect } from "react";
import { ExclamationTriangle } from "react-bootstrap-icons";
import { Controller } from "react-hook-form";
import { Input, Label } from "reactstrap";
import useDebouncedState from "~/utils/customHooks/useDebouncedState.hook";
import { InfoAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Links } from "../../../../utils/constants/Docs";
import { useGetSessionsImagesQuery } from "../../api/sessionsV2.api";
import { CONTAINER_IMAGE_PATTERN } from "../../session.constants";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { AdvancedSettingsFields } from "./AdvancedSettingsFields";
import { EnvironmentFieldsProps } from "./EnvironmentField";
import InputOverlayLoader from "./InputOverlayLoader";

export function CustomEnvironmentFields({
  control,
  errors,
  watch,
}: EnvironmentFieldsProps) {
  const watchEnvironmentSelect = watch("environmentSelect");
  const watchContainerImage = watch("container_image");
  const [debouncedContainerImage, setDebouncedContainerImage] =
    useDebouncedState<string>(watchContainerImage ?? "", 1_000);

  useEffect(() => {
    setDebouncedContainerImage(watchContainerImage ?? "");
  }, [watchContainerImage, setDebouncedContainerImage]);

  const inputModified = watchContainerImage !== debouncedContainerImage;

  const { data, isFetching } = useGetSessionsImagesQuery(
    watchEnvironmentSelect === "custom + image" &&
      debouncedContainerImage &&
      !errors.container_image
      ? { imageUrl: debouncedContainerImage }
      : skipToken
  );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <p className={cx("mb-0")}>
        Use a custom container image to create a session launcher. Provide the
        image name or reference, such as one from Docker Hub (e.g.,
        repository/image:tag).
      </p>
      <div className={cx("d-flex", "flex-column")}>
        <Label className="form-label" for="addSessionLauncherContainerImage">
          Container Image
        </Label>
        <Controller
          control={control}
          name="container_image"
          render={({ field }) => (
            <div className="position-relative">
              <Input
                autoFocus={true}
                className={cx(
                  errors.container_image && "is-invalid",
                  !errors.container_image &&
                    data?.accessible === true &&
                    !isFetching &&
                    !inputModified &&
                    "is-valid"
                )}
                data-cy="custom-image-input"
                id="addSessionLauncherContainerImage"
                placeholder="image:tag"
                type="text"
                {...field}
              />
              {(inputModified || isFetching) && !errors.container_image && (
                <InputOverlayLoader />
              )}
            </div>
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
        {!isFetching &&
          !inputModified &&
          !errors.container_image &&
          data?.accessible === false && (
            <div className={cx("mt-1", "small", "text-warning-emphasis")}>
              <ExclamationTriangle className={cx("bi", "me-1")} />
              Image not found. Access to this image may require connecting an
              additional integration after creating this launcher.
            </div>
          )}
      </div>

      <div>
        <p className={cx("fs-6", "fw-bold", "w-100")}>Advanced settings</p>

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
    </div>
  );
}
