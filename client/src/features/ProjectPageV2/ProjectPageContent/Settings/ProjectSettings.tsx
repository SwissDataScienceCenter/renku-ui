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
import { useCallback, useContext, useEffect, useState } from "react";
import { Pencil } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom-v5-compat";
import { Button, Form } from "reactstrap";
import { RenkuAlert, SuccessAlert } from "../../../../components/Alert.jsx";
import { Loader } from "../../../../components/Loader.tsx";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert.tsx";
import KeywordsInput from "../../../../components/form-field/KeywordsInput.tsx";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants.ts";
import { NotificationsManager } from "../../../../notifications/notifications.types.ts";
import AppContext from "../../../../utils/context/appContext.ts";
import { Url } from "../../../../utils/helpers/url";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api.ts";
import ProjectDescriptionFormField from "../../../projectsV2/fields/ProjectDescriptionFormField.tsx";
import ProjectNameFormField from "../../../projectsV2/fields/ProjectNameFormField.tsx";
import ProjectNamespaceFormField from "../../../projectsV2/fields/ProjectNamespaceFormField.tsx";
import ProjectVisibilityFormField from "../../../projectsV2/fields/ProjectVisibilityFormField.tsx";
import { ProjectV2Metadata } from "../../../projectsV2/show/ProjectV2EditForm.tsx";
import ProjectPageDelete from "./ProjectDelete.tsx";

export function notificationProjectUpdated(
  notifications: NotificationsManager,
  projectName: string
) {
  notifications.addSuccess(
    NOTIFICATION_TOPICS.PROJECT_UPDATED,
    <>
      Project <code>{projectName}</code> successfully updated.
    </>
  );
}
interface ProjectSettingsFormProps {
  project: Project;
}
export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
    register,
  } = useForm<ProjectV2Metadata>({
    defaultValues: {
      description: project?.description,
      name: project.name,
      namespace: project.namespace,
      visibility: project.visibility,
      keywords: project.keywords,
    },
  });
  const currentNamespace = watch("namespace");
  const currentName = watch("name");
  const navigate = useNavigate();
  const [redirectAfterUpdate, setRedirectAfterUpdate] = useState(false);
  const { notifications } = useContext(AppContext);
  const [areKeywordsDirty, setKeywordsDirty] = useState(false);

  const [updateProject, { isLoading, error, isSuccess }] =
    usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;

  const onSubmit = useCallback(
    (data: ProjectV2Metadata) => {
      if (data.namespace !== project.namespace) setRedirectAfterUpdate(true);
      updateProject({
        "If-Match": project.etag ? project.etag : undefined,
        projectId: project.id,
        projectPatch: data,
      });
    },
    [project, updateProject]
  );
  useEffect(() => {
    if (isSuccess && redirectAfterUpdate) {
      if (notifications && currentName)
        notificationProjectUpdated(notifications, currentName);
      const projectUrl = Url.get(Url.pages.projectV2.show, {
        namespace: currentNamespace,
        slug: project.slug,
      });
      navigate(projectUrl);
    }
  }, [
    isSuccess,
    redirectAfterUpdate,
    navigate,
    project.slug,
    currentNamespace,
    currentName,
    notifications,
  ]);

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
        {currentNamespace !== project.namespace && (
          <RenkuAlert color={"warning"} dismissible={false} timeout={0}>
            Modifying the namespace also change the project&apos;s URL. Once the
            change is saved, it will redirect to the updated project URL.
          </RenkuAlert>
        )}
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
        />
        <ProjectDescriptionFormField
          name="description"
          control={control}
          errors={errors}
        />
        <KeywordsInput
          hasError={errors.keywords != null}
          help="Keywords are used to describe the project. To add one, type a keyword and press enter."
          label="Keywords"
          name="keywords"
          register={register("keywords", { validate: () => !areKeywordsDirty })}
          setDirty={setKeywordsDirty}
          value={project.keywords as string[]}
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
