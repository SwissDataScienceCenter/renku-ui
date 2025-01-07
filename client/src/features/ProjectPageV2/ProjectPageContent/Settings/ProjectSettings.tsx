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
import { Diagram3Fill, Pencil, Sliders } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
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
  FormGroup,
  FormText,
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

import ProjectSessionSecrets from "../SessionSecrets/ProjectSessionSecrets";
import ProjectPageDelete from "./ProjectDelete";
import ProjectPageSettingsMembers from "./ProjectSettingsMembers";
import ProjectUnlinkTemplate from "./ProjectUnlinkTemplate";

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

function ProjectReadOnlyNameField({ name }: { name: string }) {
  return (
    <div>
      <Label className="form-label" for="project-name">
        Name
      </Label>
      <Input
        className="form-control"
        id="project-name"
        type="text"
        value={name}
        disabled={true}
        readOnly
      />
    </div>
  );
}

function ProjectReadOnlyNamespaceField({ namespace }: { namespace: string }) {
  return (
    <div>
      <Label className="form-label" for="project-namespace">
        Owner
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

function ProjectReadOnlyDescriptionFiled({
  description,
}: {
  description: string;
}) {
  return (
    <div>
      <Label className="form-label" for="project-description">
        Description
      </Label>
      <Input
        className="form-control"
        id="project-description"
        type="textarea"
        value={description}
        disabled={true}
        readOnly
      />
    </div>
  );
}

function ProjectReadOnlyTemplateField({ isTemplate }: { isTemplate: boolean }) {
  return (
    <div>
      <Label className="form-label" for="project-template">
        Template
      </Label>
      <div className={cx("d-flex", "flex-row gap-4")}>
        <FormGroup switch>
          <Input
            className="form-control"
            type="checkbox"
            role="switch"
            id="project-template"
            disabled={true}
            checked={isTemplate}
          />
          <Label for="project-template" check>
            <Diagram3Fill className={cx("bi", "me-1")} />
            Template Project
          </Label>
        </FormGroup>
      </div>
    </div>
  );
}

function ProjectSettingsForm({ project }: ProjectPageSettingsProps) {
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
      is_template: project.is_template ?? false,
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
        is_template: updatedProject.is_template ?? false,
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
        <PermissionsGuard
          disabled={<ProjectReadOnlyNameField name={project.name} />}
          enabled={
            <ProjectNameFormField
              name="name"
              control={control}
              errors={errors}
            />
          }
          requestedPermission="write"
          userPermissions={permissions}
        />

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
          requestedPermission="write"
          userPermissions={permissions}
        />
        {currentNamespace !== project.namespace && (
          <RenkuAlert
            className={cx("mb-0", "mt-1")}
            color="warning"
            dismissible={false}
            timeout={0}
          >
            Modifying the owner also change the project&apos;s URL. Once the
            change is saved, it will redirect to the updated project URL.
          </RenkuAlert>
        )}

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
          requestedPermission="write"
          userPermissions={permissions}
        />

        <PermissionsGuard
          disabled={
            <ProjectReadOnlyDescriptionFiled
              description={project.description ?? ""}
            />
          }
          enabled={
            <ProjectDescriptionFormField
              name="description"
              control={control}
              errors={errors}
            />
          }
          requestedPermission="write"
          userPermissions={permissions}
        />

        <PermissionsGuard
          disabled={
            <ProjectReadOnlyTemplateField
              isTemplate={project.is_template ?? false}
            />
          }
          enabled={
            <div>
              <div className="form-label">Template</div>
              <Controller
                aria-describedby="projectTemplateHelp"
                control={control}
                name={"is_template"}
                render={({ field }) => {
                  const { value, ...props } = field;
                  return (
                    <div className={cx("d-flex", "flex-row gap-4")}>
                      <FormGroup switch>
                        <Input
                          type="checkbox"
                          role="switch"
                          className={cx(errors.is_template && "is-invalid")}
                          data-cy="project-template"
                          id="project-template"
                          {...props}
                          checked={value}
                        />
                        <Label
                          for="project-template"
                          className="cursor-pointer"
                          check
                        >
                          <Diagram3Fill className={cx("bi", "me-1")} />
                          Mark this project as a template
                        </Label>
                      </FormGroup>
                    </div>
                  );
                }}
              />
              <FormText id="projectTemplateHelp" className="input-hint">
                Make this a template project to indicate to viewers that this
                project should be copied before being used.
              </FormText>
            </div>
          }
          requestedPermission="write"
          userPermissions={permissions}
        />

        <PermissionsGuard
          disabled={null}
          enabled={
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
          }
          requestedPermission="write"
          userPermissions={permissions}
        />

        <PermissionsGuard
          disabled={null}
          enabled={
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
          }
          requestedPermission="write"
          userPermissions={permissions}
        />
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
        <ProjectSettingsForm project={project} />
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
      <ProjectSessionSecrets />
      <PermissionsGuard
        disabled={null}
        enabled={<ProjectUnlinkTemplate project={project} />}
        requestedPermission="write"
        userPermissions={permissions}
      />
      <PermissionsGuard
        disabled={null}
        enabled={<ProjectPageDelete project={project} />}
        requestedPermission="delete"
        userPermissions={permissions}
      />
    </div>
  );
}
