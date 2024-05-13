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
import { Visibility } from "../api/projectV2.api.ts";

export interface ExtendedGenericProjectFormFieldProps<T extends FieldValues>
  extends GenericProjectFormFieldProps<T> {
  setVisibility: (value: Visibility) => void;
}
export default function ProjectVisibilityFormField<T extends FieldValues>({
  control,
  errors,
  name,
  setVisibility,
}: ExtendedGenericProjectFormFieldProps<T>) {
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
          <div className="d-flex flex-row gap-5 my-3">
            <div className="d-flex align-items-center gap-2">
              <Input
                type="radio"
                className={cx(
                  "form-control",
                  errors.visibility && "is-invalid",
                  "p-0",
                  "mt-0"
                )}
                data-cy="project-visibility"
                id="project-visibility-public"
                {...field}
                value="public"
                checked={field.value === "public"}
              />
              <label
                onClick={() => setVisibility("public")}
                className={cx(
                  "cursor-pointer",
                  "d-flex",
                  "align-items-center",
                  "gap-1"
                )}
              >
                Public <Globe size={16} />
              </label>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Input
                type="radio"
                className={cx(
                  "form-control",
                  errors.visibility && "is-invalid",
                  "p-0",
                  "mt-0"
                )}
                data-cy="project-visibility"
                id="project-visibility-public"
                {...field}
                value="private"
                checked={field.value === "private"}
              />
              <label
                onClick={() => setVisibility("private")}
                className={cx(
                  "cursor-pointer",
                  "d-flex",
                  "align-items-center",
                  "gap-1"
                )}
              >
                Private <Lock size={16} />
              </label>
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
