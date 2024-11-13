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
import { ButtonGroup, Input, Label } from "reactstrap";
import type { GenericProjectFormFieldProps } from "./formField.types";

export default function ProjectVisibilityFormField<T extends FieldValues>({
  control,
  name,
}: GenericProjectFormFieldProps<T>) {
  return (
    <>
      <Label className="form-label" for="project-visibility">
        Visibility
      </Label>
      <div>
        <Controller
          aria-describedby="projectVisibilityHelp"
          control={control}
          name={name}
          render={({ field }) => (
            <>
              <ButtonGroup id="project-visibility">
                <Input
                  type="radio"
                  className="btn-check"
                  data-cy="project-visibility-public"
                  id="project-visibility-public"
                  value="public"
                  checked={field.value === "public"}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
                <Label
                  className={cx("btn", "btn-outline-primary", "mb-0")}
                  for="project-visibility-public"
                >
                  <Globe className={cx("bi", "me-1")} />
                  Public
                </Label>
                <Input
                  type="radio"
                  className="btn-check"
                  data-cy="project-visibility-private"
                  id="project-visibility-private"
                  value="private"
                  checked={field.value === "private"}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
                <Label
                  className={cx("btn", "btn-outline-primary", "mb-0")}
                  for="project-visibility-private"
                >
                  <Lock className={cx("bi", "me-1")} />
                  Private
                </Label>
              </ButtonGroup>
              <div
                id="project-visibility-help"
                className={cx("form-text", "text-muted")}
              >
                {field.value === "public"
                  ? "Your project is visible for everyone."
                  : "Your project is visible for you and people you add to the project."}
              </div>
            </>
          )}
          rules={{ required: true }}
        />
      </div>
      <div className="invalid-feedback">Please select a visibility</div>
    </>
  );
}
