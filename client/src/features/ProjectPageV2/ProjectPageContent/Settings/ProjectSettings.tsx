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
import { useCallback } from "react";
import { Pencil } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { Button, Form } from "reactstrap";
import { SuccessAlert } from "../../../../components/Alert.jsx";
import { Loader } from "../../../../components/Loader.tsx";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert.tsx";
import { Project, Visibility } from "../../../projectsV2/api/projectV2.api.ts";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api.ts";
import ProjectDescriptionFormField from "../../../projectsV2/fields/ProjectDescriptionFormField.tsx";
import ProjectNameFormField from "../../../projectsV2/fields/ProjectNameFormField.tsx";
import ProjectNamespaceFormField from "../../../projectsV2/fields/ProjectNamespaceFormField.tsx";
import ProjectVisibilityFormField from "../../../projectsV2/fields/ProjectVisibilityFormField.tsx";
import { ProjectV2Metadata } from "../../../projectsV2/show/ProjectV2EditForm.tsx";
import ProjectPageDelete from "./ProjectDelete.tsx";
interface ProjectSettingsFormProps {
  project: Project;
}
export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    setValue,
  } = useForm<ProjectV2Metadata>({
    defaultValues: {
      description: project?.description,
      name: project.name,
      namespace: project.namespace,
      visibility: project.visibility,
    },
  });

  const [updateProject, { isLoading, error, isSuccess }] =
    usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;
  const setVisibility = useCallback(
    (value: Visibility) => setValue("visibility", value),
    [setValue]
  );

  const onSubmit = useCallback(
    (data: ProjectV2Metadata) => {
      updateProject({
        "If-Match": project.etag ? project.etag : undefined,
        projectId: project.id,
        projectPatch: data,
      });
    },
    [project, updateProject]
  );

  return (
    <div>
      {error && <RtkErrorAlert error={error} />}
      {isSuccess && (
        <SuccessAlert dismissible={false} timeout={0}>
          <p className="p-0">The project has been successfully updated.</p>
        </SuccessAlert>
      )}

      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ProjectNameFormField name="name" control={control} errors={errors} />
        <ProjectNamespaceFormField
          name="namespace"
          control={control}
          entityName="project"
          errors={errors}
        />
        <ProjectDescriptionFormField
          name="description"
          control={control}
          errors={errors}
        />
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
          setVisibility={setVisibility}
        />
        <div className={cx("d-flex", "justify-content-end")}>
          <Button
            disabled={isUpdating || !isDirty}
            className="me-1"
            type="submit"
          >
            {isUpdating ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil size={16} className={cx("bi", "me-1")} />
            )}
            Update project
          </Button>
        </div>
      </Form>
    </div>
  );
}
export default function ProjectPageSettings({ project }: { project: Project }) {
  return (
    <div className={cx("pb-5", "pt-0")}>
      <div id="general" className={cx("px-2", "px-md-5", "pt-4")}>
        <h4 className="fw-bold">General settings</h4>
        <small>
          Update your project title, description, visibility and namespace.
        </small>
        <div
          id={"general"}
          className={cx("bg-white", "rounded-3", "mt-3", "p-3", "p-md-4")}
        >
          <ProjectSettingsForm project={project} />
        </div>
      </div>
      <div id="delete" className={cx("px-2", "px-md-5", "pt-4")}>
        <ProjectPageDelete project={project} />
      </div>
    </div>
  );
}
