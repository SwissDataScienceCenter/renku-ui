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
import { useCallback, useEffect } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Input, Label } from "reactstrap";
import { slugFromTitle } from "../../../../utils/helpers/HelperFunctions.js";
import ProjectNamespaceFormField from "../../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectVisibilityFormField from "../../../projectsV2/fields/ProjectVisibilityFormField";
import SlugPreviewFormField from "../../../projectsV2/fields/SlugPreviewFormField";
import { PROJECT_V2_PATH } from "../../utils/projectMigration.utils";
import { ProjectMigrationForm } from "./ProjectMigration.types";

interface ProjectMigrationFormInputsProps {
  control: Control<ProjectMigrationForm>;
  errors: FieldErrors<ProjectMigrationForm>;
  watch: UseFormWatch<ProjectMigrationForm>;
  setValue: UseFormSetValue<ProjectMigrationForm>;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<ProjectMigrationForm>>>;
}
export function ProjectMigrationFormInputs({
  control,
  dirtyFields,
  errors,
  watch,
  setValue,
}: ProjectMigrationFormInputsProps) {
  const currentName = watch("name");
  const currentNamespace = watch("namespace");
  const currentSlug = watch("slug");
  useEffect(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [currentName, setValue]);
  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);
  const url = `${PROJECT_V2_PATH}${currentNamespace ?? "<Owner>"}/`;

  return (
    <>
      <div className="mb-3">
        <Label className="form-label" for="migrateProjectName">
          Name
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateProjectName"
              placeholder="Project name"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
      </div>
      <div className="mb-3">
        <ProjectNamespaceFormField
          control={control}
          entityName="project"
          errors={errors}
          name="namespace"
        />
      </div>
      <div className="mb-3">
        <SlugPreviewFormField
          compact={true}
          control={control}
          errors={errors}
          name="slug"
          resetFunction={resetUrl}
          url={url}
          slug={currentSlug}
          dirtyFields={dirtyFields}
          label="Project URL"
          entityName="project"
        />
      </div>
      <div className="mb-3">
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
        />
      </div>
    </>
  );
}
