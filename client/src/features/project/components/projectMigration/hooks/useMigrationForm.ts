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

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { generatePath } from "react-router";

import { ABSOLUTE_ROUTES } from "../../../../../routing/routes.constants";
import { usePostRenkuV1ProjectsByV1IdMigrationsMutation } from "../../../../projectsV2/api/projectV2.enhanced-api";
import { ProjectMigrationForm } from "../ProjectMigration.types";

interface UseMigrationFormProps {
  initialValues?: Partial<ProjectMigrationForm>;
  onSuccess?: () => void;
}

export function useMigrationForm({
  initialValues,
  onSuccess,
}: UseMigrationFormProps = {}) {
  const {
    control,
    formState: { dirtyFields, errors },
    watch,
    setValue,
    reset,
    handleSubmit,
  } = useForm<ProjectMigrationForm>({
    defaultValues: {
      name: "",
      namespace: "",
      slug: "",
      visibility: "private",
      keywords: [],
      codeRepositories: [""],
      containerImage: "",
      session_launcher_name: "",
      defaultUrl: "",
      ...initialValues,
    },
  });

  const [migrateProject, result] =
    usePostRenkuV1ProjectsByV1IdMigrationsMutation();

  const resetResult = useCallback(() => {
    result.reset();
  }, [result]);

  const containerImage = watch("containerImage");
  const defaultUrl = watch("defaultUrl");

  const linkToProject = useMemo(() => {
    return result?.data
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: result.data.namespace,
          slug: result.data.slug,
        })
      : "";
  }, [result.data]);

  const onSubmit = useCallback(
    (data: ProjectMigrationForm) => {
      if (!data.containerImage || !data.defaultUrl || !data.codeRepositories)
        return;

      const dataMigration = {
        project: {
          name: data.name,
          namespace: data.namespace,
          slug: data.slug,
          visibility: data.visibility,
          description: data.description,
          keywords: data.keywords,
          repositories: data.codeRepositories,
        },
        session_launcher: {
          name: data.session_launcher_name,
          container_image: data.containerImage,
          default_url: data.defaultUrl,
          resource_class_id: data.resourceClassId,
        },
      };

      migrateProject({
        projectMigrationPost: dataMigration,
        v1Id: data.v1Id,
      })
        .unwrap()
        .then(() => onSuccess?.());
    },
    [migrateProject, onSuccess]
  );

  return {
    control,
    errors,
    watch,
    setValue,
    reset,
    handleSubmit,
    dirtyFields,
    containerImage,
    defaultUrl,
    result,
    onSubmit,
    linkToProject,
    resetResult,
  };
}
