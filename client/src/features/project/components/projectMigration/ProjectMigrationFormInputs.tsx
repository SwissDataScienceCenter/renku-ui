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
import { generatePath, useLocation } from "react-router";
import { Input, Label } from "reactstrap";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { slugFromTitle } from "../../../../utils/helpers/HelperFunctions";
import { isRenkuLegacy } from "../../../../utils/helpers/HelperFunctionsV2";
import ProjectNamespaceFormField from "../../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectVisibilityFormField from "../../../projectsV2/fields/ProjectVisibilityFormField";
import styles from "../../../projectsV2/fields/RenkuV1FormFields.module.scss";
import SlugPreviewFormField from "../../../projectsV2/fields/SlugPreviewFormField";
import { ProjectMigrationForm } from "./ProjectMigration.types";

interface ProjectMigrationFormInputsProps {
  control: Control<ProjectMigrationForm>;
  errors: FieldErrors<ProjectMigrationForm>;
  watch: UseFormWatch<ProjectMigrationForm>;
  setValue: UseFormSetValue<ProjectMigrationForm>;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<ProjectMigrationForm>>>;
}
export default function ProjectMigrationFormInputs({
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
  const projectParentPath = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.root,
    {
      namespace: currentNamespace ?? "<Owner>",
      slug: "",
    }
  );
  const parentPath = `${projectParentPath}/`;
  const location = useLocation();
  const isRenkuV1 = isRenkuLegacy(location.pathname);
  const formId = "project-migration-form";
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div>
        <Label className="form-label" for="migrateProjectName">
          Name
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx(
                "form-control",
                isRenkuV1 && styles.RenkuV1input,
                error && "is-invalid"
              )}
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
      <div>
        <div className="mb-1">
          <ProjectNamespaceFormField
            control={control}
            entityName="project"
            errors={errors}
            name="namespace"
          />
        </div>
        <div>
          <SlugPreviewFormField
            compact={true}
            control={control}
            errors={errors}
            name="slug"
            resetFunction={resetUrl}
            parentPath={parentPath}
            slug={currentSlug}
            dirtyFields={dirtyFields}
            label="Project URL"
            entityName="project"
          />
        </div>
      </div>
      <div>
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
          formId={formId}
        />
      </div>
    </div>
  );
}
