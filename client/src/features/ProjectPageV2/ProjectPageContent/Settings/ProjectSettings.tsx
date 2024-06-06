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
import {
  generatePath,
  useLocation,
  useNavigate,
} from "react-router-dom-v5-compat";
import { Button, Input, Form, Label } from "reactstrap";

import { RenkuAlert, SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import KeywordsInput from "../../../../components/form-field/KeywordsInput";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../../notifications/notifications.types";
import AppContext from "../../../../utils/context/appContext";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import ProjectDescriptionFormField from "../../../projectsV2/fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../../../projectsV2/fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectVisibilityFormField from "../../../projectsV2/fields/ProjectVisibilityFormField";
import { ProjectV2Metadata } from "../../../projectsV2/show/ProjectV2EditForm";

import AccessGuard from "../../utils/AccessGuard";
import useProjectAccess from "../../utils/useProjectAccess.hook";

import ProjectPageDelete from "./ProjectDelete";
import ProjectPageSettingsMembers from "./ProjectSettingsMembers";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";

const projectMetadataStringKeys = ["description", "name", "namespace"] as const;

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

function ProjectReadOnlyNamespaceField({ namespace }: { namespace: string }) {
  return (
    <div className="mb-3">
      <Label className="form-label" for="project-namespace">
        Namespace
      </Label>
      <Input
        className="form-control"
        id="project-namespace"
        type="text"
        value={namespace}
        disabled={true}
        readOnly
      />
    </div>
  );
}

function ProjectReadOnlyVisibilityField({
  visibility,
}: {
  visibility: string;
}) {
  return (
    <div className="mb-3">
      <Label className="form-label" for="project-visibility">
        Visibility
      </Label>
      <Input
        className="form-control"
        id="project-visibility"
        type="text"
        value={visibility}
        disabled={true}
        readOnly
      />
    </div>
  );
}

export function ProjectSettingsEditForm({ project }: ProjectPageSettingsProps) {
  const { userRole } = useProjectAccess({ projectId: project.id });
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
    register,
  } = useForm<Required<ProjectV2Metadata>>({
    defaultValues: {
      description: project.description,
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
      const dataToSend: ProjectV2Metadata = {};
      for (const key of projectMetadataStringKeys) {
        if (data[key] !== project[key]) dataToSend[key] = data[key];
      }
      dataToSend.visibility = data.visibility;
      dataToSend.keywords = data.keywords;
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: dataToSend,
      });
    },
    [project, updateProject]
  );
  useEffect(() => {
    if (isSuccess && redirectAfterUpdate) {
      if (notifications && currentName)
        notificationProjectUpdated(notifications, currentName);
      const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
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
        <AccessGuard
          disabled={
            <ProjectReadOnlyNamespaceField namespace={project.namespace} />
          }
          enabled={
            <ProjectNamespaceFormField
              name="namespace"
              control={control}
              entityName="project"
              errors={errors}
            />
          }
          role={userRole}
        />
        {currentNamespace !== project.namespace && (
          <RenkuAlert color={"warning"} dismissible={false} timeout={0}>
            Modifying the namespace also change the project&apos;s URL. Once the
            change is saved, it will redirect to the updated project URL.
          </RenkuAlert>
        )}
        <AccessGuard
          disabled={
            <ProjectReadOnlyVisibilityField visibility={project.visibility} />
          }
          enabled={
            <ProjectVisibilityFormField
              name="visibility"
              control={control}
              errors={errors}
            />
          }
          role={userRole}
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

function ProjectSettingsDisplay({ project }: ProjectPageSettingsProps) {
  const onSubmit = () => {};

  return (
    <div>
      <Form className="form-rk-green" noValidate onSubmit={onSubmit}>
        <div className="mb-3">
          <Label className="form-label" for="project-name">
            Name
          </Label>
          <Input
            className="form-control"
            id="project-name"
            type="text"
            value={project.name}
            disabled={true}
            readOnly
          />
        </div>
        <ProjectReadOnlyNamespaceField namespace={project.namespace} />
        <div className="mb-3">
          <Label className="form-label" for="project-description">
            Description
          </Label>
          <Input
            className="form-control"
            id="project-description"
            type="textarea"
            value={project.description}
            disabled={true}
            readOnly
          />
        </div>
        <ProjectReadOnlyVisibilityField visibility={project.visibility} />
      </Form>
    </div>
  );
}

function ProjectSettingsMetadata({ project }: ProjectPageSettingsProps) {
  const { userRole } = useProjectAccess({ projectId: project.id });
  return (
    <>
      <h4 className="fw-bold">General settings</h4>
      <AccessGuard
        disabled={null}
        enabled={
          <small>
            Update your project title, description, visibility and namespace.
          </small>
        }
        role={userRole}
      />
      <div
        id="general"
        className={cx("bg-white", "rounded-3", "mt-3", "p-3", "p-md-4")}
      >
        <AccessGuard
          disabled={<ProjectSettingsDisplay project={project} />}
          enabled={<ProjectSettingsEditForm project={project} />}
          minimumRole="editor"
          role={userRole}
        />
      </div>
    </>
  );
}

interface ProjectPageSettingsProps {
  project: Project;
}
export default function ProjectPageSettings() {
  const { project } = useProject();

  const { hash } = useLocation();
  const { userRole } = useProjectAccess({ projectId: project.id });

  // Handle anchor links https://stackoverflow.com/a/61311926/5804638
  useEffect(() => {
    // if not a hash link, scroll to top
    if (hash === "") {
      window.scrollTo(0, 0);
    }
    // else scroll to id
    else {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
        }
      }, 0);
    }
  }, [hash]);

  return (
    <div className={cx("pb-5", "pt-0")}>
      <div id="general" className={cx("px-2", "px-md-5", "pt-4")}>
        <ProjectSettingsMetadata project={project} />
      </div>
      <div id="members" className={cx("px-2", "px-md-5", "pt-4")}>
        <ProjectPageSettingsMembers project={project} />
      </div>
      <AccessGuard
        disabled={null}
        enabled={
          <div id="delete" className={cx("px-2", "px-md-5", "pt-4")}>
            <ProjectPageDelete project={project} />
          </div>
        }
        role={userRole}
      />
    </div>
  );
}
