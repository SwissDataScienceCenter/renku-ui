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

import type { FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Globe, Lock } from "react-bootstrap-icons";
import { FormText, Input, Label } from "reactstrap";
import type { GenericProjectFormFieldProps } from "./formField.types";

export default function ProjectVisibilityFormField<T extends FieldValues>({
  control,
  errors,
  name,
}: GenericProjectFormFieldProps<T>) {
  return (
    <div className="mb-3">
      <Label className="form-label" for="project-visibility">
        Visibility
      </Label>
      <Controller
        aria-describedby="projectVisibilityHelp"
        control={control}
        name={name}
        render={({ field }) => (
          <div className={cx("d-flex", "flex-row gap-4")}>
            <div className={cx("d-flex", "gap-2")}>
              <Input
                type="radio"
                className={cx(errors.visibility && "is-invalid")}
                data-cy="project-visibility-public"
                id="project-visibility-public"
                {...field}
                value="public"
                checked={field.value === "public"}
              />
              <Label
                for="project-visibility-public"
                className={cx("cursor-pointer")}
              >
                Public <Globe className="bi" />
              </Label>
            </div>
            <div className="d-flex gap-2">
              <Input
                type="radio"
                className={cx(errors.visibility && "is-invalid")}
                data-cy="project-visibility-private"
                id="project-visibility-private"
                {...field}
                value="private"
                checked={field.value === "private"}
              />
              <Label
                for="project-visibility-private"
                className={cx("cursor-pointer")}
              >
                Private <Lock className="bi" />
              </Label>
            </div>
          </div>
        )}
        rules={{ required: true }}
      />
      <div className="invalid-feedback">Please select a visibility</div>
      <FormText id="projectVisibilityHelp" className="input-hint">
        Should the project be visible to everyone or only to members?
      </FormText>
    </div>
  );
}
