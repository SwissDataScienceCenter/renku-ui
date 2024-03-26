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
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Input, Label } from "reactstrap";

export interface SessionEnvironmentForm {
  container_image: string;
  default_url: string;
  description: string;
  name: string;
}

interface SessionEnvironmentFormContentProps {
  control: Control<SessionEnvironmentForm, unknown>;
  errors: FieldErrors<SessionEnvironmentForm>;
}

export default function SessionEnvironmentFormContent({
  control,
  errors,
}: SessionEnvironmentFormContentProps) {
  return (
    <>
      <div className="mb-3">
        <Label className="form-label" for="addSessionEnvironmentName">
          Name
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="addSessionEnvironmentName"
              placeholder="session name"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addSessionEnvironmentDescription">
          Description
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <textarea
              className="form-control"
              id="addSessionEnvironmentDescription"
              placeholder="session environment description"
              rows={3}
              {...field}
            />
          )}
        />
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addSessionEnvironmentContainerImage">
          Container Image
        </Label>
        <Controller
          control={control}
          name="container_image"
          render={({ field }) => (
            <Input
              className={cx(
                "form-control",
                errors.container_image && "is-invalid"
              )}
              id="addSessionEnvironmentContainerImage"
              placeholder="Docker image"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a container image</div>
      </div>

      <div>
        <Label className="form-label" for="addSessionEnvironmentDefaultUrl">
          Default URL
        </Label>
        <Controller
          control={control}
          name="default_url"
          render={({ field }) => (
            <Input
              className="form-control"
              id="addSessionEnvironmentDefaultUrl"
              placeholder="/lab"
              type="text"
              {...field}
            />
          )}
        />
      </div>
    </>
  );
}
