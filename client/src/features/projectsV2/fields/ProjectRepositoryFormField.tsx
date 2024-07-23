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
import { Button, FormText, Input, Label } from "reactstrap";
import { XLg } from "react-bootstrap-icons";
import { Controller } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

import type { Repository } from "../projectV2.types";
import type { GenericProjectFormFieldProps } from "./formField.types";

interface ProjectRepositoryFormFieldProps
  extends GenericProjectFormFieldProps<ProjectV2Repositories> {
  id: string;
  index: number;
  onDelete: () => void;
}

interface ProjectV2Repositories extends FieldValues {
  repositories: Repository[];
}

export default function ProjectRepositoryFormField({
  control,
  defaultValue,
  errors,
  id,
  index,
  name,
  onDelete,
}: ProjectRepositoryFormFieldProps) {
  return (
    <div className="mb-3">
      <Label className="form-label" for={`project-${index}-repository`}>
        Repository {index + 1}
      </Label>
      <div
        className={cx(
          "d-flex",
          "input-group",
          errors.repositories && errors.repositories[index] && "is-invalid",
          index > 0 &&
            (errors.repositories == null ||
              errors.repositories[index] == null) &&
            "mb-2"
        )}
      >
        <Controller
          key={id}
          control={control}
          name={name}
          defaultValue={defaultValue}
          render={({ field }) => (
            <Input
              className={cx(
                errors.repositories &&
                  errors.repositories[index] &&
                  "is-invalid"
              )}
              data-cy={`project-repository-input-${index}`}
              id={`project-${index}-repository`}
              type="text"
              {...field}
            />
          )}
          rules={{
            required: true,
            pattern: /^(http|https):\/\/[^ "]+$/,
          }}
        />
        <Button color="outline-primary" onClick={onDelete}>
          <XLg className="bi" />
        </Button>
      </div>
      <div className="invalid-feedback">
        Please provide a valid URL or remove the repository.
      </div>
      {index == 0 && (
        <FormText className="input-hint">
          A URL that refers to a git repository.
        </FormText>
      )}
    </div>
  );
}
