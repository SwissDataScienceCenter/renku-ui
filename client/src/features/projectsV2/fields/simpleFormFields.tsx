/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import type { FieldValues } from "react-hook-form";

import { FormText, Input, Label } from "reactstrap";
import type { GenericProjectFormFieldProps } from "./formField.types";

export function ProjectDescriptionFormField<T extends FieldValues>({
  control,
  errors,
  name,
}: GenericProjectFormFieldProps<T>) {
  return (
    <div className="mb-3">
      <Label className="form-label" for="project-slug">
        Description
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            className={cx("form-control", errors.description && "is-invalid")}
            data-cy="project-description-input"
            id="project-description"
            type="textarea"
            {...field}
          />
        )}
        rules={{ maxLength: 500, required: false }}
      />
      {errors[name] ? null : (
        <FormText className="input-hint">
          A brief (at most 500 character) description of the project.
        </FormText>
      )}
      <div className="invalid-feedback">Please provide a description</div>
    </div>
  );
}

export function ProjectNameFormField<T extends FieldValues>({
  control,
  errors,
  name,
}: GenericProjectFormFieldProps<T>) {
  return (
    <div className="mb-3">
      <Label className="form-label" for="project-name">
        Name
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            className={cx("form-control", errors.name && "is-invalid")}
            data-cy="project-name-input"
            id="project-name"
            type="text"
            {...field}
          />
        )}
        rules={{ required: true, maxLength: 99 }}
      />
      {errors[name] ? null : (
        <FormText className="input-hint">
          The name you will use to refer to the project
        </FormText>
      )}
      <div className="invalid-feedback">Please provide a name</div>
    </div>
  );
}

export function ProjectSlugFormField<T extends FieldValues>({
  control,
  errors,
  name,
}: GenericProjectFormFieldProps<T>) {
  return (
    <div className="mb-3">
      <Label className="form-label" for="project-slug">
        Slug
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            className={cx("form-control", errors.slug && "is-invalid")}
            data-cy="project-slug-input"
            id="project-slug"
            type="text"
            {...field}
          />
        )}
        rules={{ required: true, maxLength: 99, pattern: /^[a-z0-9-]+$/ }}
      />
      {errors[name] ? null : (
        <FormText className="input-hint">
          A short, machine-readable identifier for the project, restricted to
          lowercase letters, numbers, and hyphens.{" "}
          <b>Cannot be changed after project creation</b>.
        </FormText>
      )}
      <div className="invalid-feedback">
        Please provide a slug consisting of lowercase letters, numbers, and
        hyphens.
      </div>
    </div>
  );
}

export function ProjectVisibilityFormField<T extends FieldValues>({
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
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            className={cx("form-control", errors.visibility && "is-invalid")}
            data-cy="project-visibility"
            id="project-visibility"
            type="select"
            {...field}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Input>
        )}
        rules={{ required: true }}
      />
      {errors[name] ? null : (
        <FormText className="input-hint">
          Should the project be visible to everyone or only to members?
        </FormText>
      )}
      <div className="invalid-feedback">Please select a visibility</div>
    </div>
  );
}
