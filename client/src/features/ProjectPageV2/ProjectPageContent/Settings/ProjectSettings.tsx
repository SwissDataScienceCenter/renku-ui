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
import { Pencil, Sliders } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  generatePath,
  useLocation,
  useNavigate,
} from "react-router-dom-v5-compat";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
  Label,
} from "reactstrap";

import { RenkuAlert, SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import KeywordsInput from "../../../../components/form-field/KeywordsInput";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../../notifications/notifications.types";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import AppContext from "../../../../utils/context/appContext";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import ProjectDescriptionFormField from "../../../projectsV2/fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../../../projectsV2/fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectVisibilityFormField from "../../../projectsV2/fields/ProjectVisibilityFormField";

import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import type { ProjectV2Metadata } from "../../settings/projectSettings.types";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";

import ProjectPageDelete from "./ProjectDelete";
import ProjectPageSettingsMembers from "./ProjectSettingsMembers";

function notificationProjectUpdated(
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
    <div>
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
    <div>
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

function ProjectSettingsEditForm({ project }: ProjectPageSettingsProps) {
  const permissions = useProjectPermissions({ projectId: project.id });
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
    register,
    reset,
  } = useForm<Required<ProjectV2Metadata>>({
    defaultValues: {
      description: project.description ?? "",
      name: project.name,
      namespace: project.namespace,
      visibility: project.visibility,
      keywords: project.keywords ?? [],
    },
  });
  const currentNamespace = watch("namespace");
  const currentName = watch("name");
  const navigate = useNavigate();
  const [redirectAfterUpdate, setRedirectAfterUpdate] = useState(false);
  const { notifications } = useContext(AppContext);
  const [areKeywordsDirty, setKeywordsDirty] = useState(false);

  const [updateProject, { isLoading, error, isSuccess, data: updatedProject }] =
    usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;

  const onSubmit = useCallback(
    (data: ProjectV2Metadata) => {
      const namespaceChanged = data.namespace !== project.namespace;
      setRedirectAfterUpdate(namespaceChanged);
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: data,
      });
    },
    [project, updateProject]
  );

  useEffect(() => {
    if (isSuccess && updatedProject != null) {
      reset({
        description: updatedProject.description ?? "",
        name: updatedProject.name,
        namespace: updatedProject.namespace,
        visibility: updatedProject.visibility,
        keywords: updatedProject.keywords ?? [],
      });
    }
  }, [isSuccess, reset, updatedProject]);

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
          <p className="mb-0">The project has been successfully updated.</p>
        </SuccessAlert>
      )}

      <Form
        className={cx("d-flex", "flex-column", "gap-3")}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <ProjectNameFormField name="name" control={control} errors={errors} />
        </div>

        <div>
          <PermissionsGuard
            disabled={
              <ProjectReadOnlyNamespaceField namespace={project.namespace} />
            }
            enabled={
              <ProjectNamespaceFormField
                name="namespace"
                control={control}
                entityName="project"
                ensureNamespace={project.namespace}
                errors={errors}
              />
            }
            requestedPermission="delete"
            userPermissions={permissions}
          />
          {currentNamespace !== project.namespace && (
            <div className="mt-1">
              <RenkuAlert
                className="mb-0"
                color="warning"
                dismissible={false}
                timeout={0}
              >
                Modifying the owner also change the project&apos;s URL. Once the
                change is saved, it will redirect to the updated project URL.
              </RenkuAlert>
            </div>
          )}
        </div>

        <div>
          <PermissionsGuard
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
            requestedPermission="delete"
            userPermissions={permissions}
          />
        </div>

        <div>
          <ProjectDescriptionFormField
            name="description"
            control={control}
            errors={errors}
          />
        </div>

        <div>
          <KeywordsInput
            hasError={errors.keywords != null}
            help="Keywords are used to describe the project. To add one, type a keyword and press enter."
            label="Keywords"
            name="keywords"
            register={register("keywords", {
              validate: () => !areKeywordsDirty,
            })}
            setDirty={setKeywordsDirty}
            value={project.keywords as string[]}
          />
        </div>

        <div className={cx("d-flex", "justify-content-end")}>
          <Button
            color="primary"
            disabled={isUpdating || !isDirty}
            type="submit"
          >
            {isUpdating ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
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
  const permissions = useProjectPermissions({ projectId: project.id });

  return (
    <Card id="general">
      <CardHeader>
        <PermissionsGuard
          disabled={
            <h4 className="m-0">
              <Sliders className={cx("me-1", "bi")} />
              General settings
            </h4>
          }
          enabled={
            <>
              <h4>
                <Sliders className={cx("me-1", "bi")} />
                General settings
              </h4>
              <p className="m-0">
                Update your project title, description, visibility and
                namespace.
              </p>
            </>
          }
          requestedPermission="delete"
          userPermissions={permissions}
        />
      </CardHeader>
      <CardBody>
        <PermissionsGuard
          disabled={<ProjectSettingsDisplay project={project} />}
          enabled={<ProjectSettingsEditForm project={project} />}
          requestedPermission="write"
          userPermissions={permissions}
        />
      </CardBody>
    </Card>
  );
}

interface ProjectPageSettingsProps {
  project: Project;
}
export default function ProjectPageSettings() {
  const { project } = useProject();

  const { hash } = useLocation();
  const permissions = useProjectPermissions({ projectId: project.id });

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
    <div className={cx("d-flex", "flex-column", "gap-4")}>
      <ProjectSettingsMetadata project={project} />
      <ProjectPageSettingsMembers project={project} />
      <PermissionsGuard
        disabled={null}
        enabled={<ProjectPageDelete project={project} />}
        requestedPermission="delete"
        userPermissions={permissions}
      />
    </div>
  );
}
