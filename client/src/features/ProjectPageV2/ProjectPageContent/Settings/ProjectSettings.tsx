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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Diagram3Fill, Pencil, Sliders } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { generatePath, useLocation, useNavigate } from "react-router";
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
import type {
  ProjectV2Metadata,
  ProjectV2MetadataWithKeyword,
} from "../../settings/projectSettings.types";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import ProjectSessionSecrets from "../SessionSecrets/ProjectSessionSecrets";
import ProjectPageDelete from "./ProjectDelete";
import ProjectKeywordsFormField from "./ProjectKeywordsFormField";
import ProjectPageSettingsMembers from "./ProjectSettingsMembers";
import ProjectUnlinkTemplate from "./ProjectUnlinkTemplate";
import SlugFormField from "~/features/projectsV2/fields/SlugFormField";

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

function ProjectReadOnlySlugField({ slug }: { slug: string }) {
  return (
    <div>
      <Label className="form-label" for="project-slug">
        Slug
      </Label>
      <Input
        className="form-control"
        id="project-slug"
        type="text"
        value={slug}
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
    formState: { errors, dirtyFields },
    getValues,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm<Required<ProjectV2MetadataWithKeyword>>({
    defaultValues: {
      description: project.description ?? "",
      name: project.name,
      namespace: project.namespace,
      slug: project.slug,
      visibility: project.visibility,
      keywords: project.keywords ?? [],
      keyword: "",
      is_template: project.is_template ?? false,
    },
  });
  const currentNamespace = watch("namespace");
  const currentName = watch("name");
  const isDirtyExceptKeyword = Object.keys(dirtyFields).some(
    (f) => f !== "keyword"
  );

  const navigate = useNavigate();
  const [redirectAfterUpdate, setRedirectAfterUpdate] = useState(false);
  const { notifications } = useContext(AppContext);

  const [
    updateProject,
    { isLoading, error, isSuccess, data: updatedProject, reset: resetPatch },
  ] = usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;

  const onSubmit = useCallback(
    (data: ProjectV2MetadataWithKeyword) => {
      const namespaceChanged = data.namespace !== project.namespace;
      setRedirectAfterUpdate(namespaceChanged);
      const { keyword, ...editedData } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: editedData as ProjectV2Metadata,
      });
    },
    [project, updateProject]
  );

  const { params } = useContext(AppContext);
  const baseUrl = params?.BASE_URL ?? window.location.origin;
  const groupPath = useMemo(() => {
    return generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: currentNamespace,
      slug: "",
    });
  }, [currentNamespace]);
  const url = `${baseUrl}${groupPath}/`;

  const resetUrl = useCallback(() => {
    setValue("slug", project.slug, {
      shouldValidate: true,
    });
  }, [setValue, project.slug]);

  useEffect(() => {
    if (isSuccess && updatedProject != null) {
      reset({
        description: updatedProject.description ?? "",
        name: updatedProject.name,
        namespace: updatedProject.namespace,
        slug: updatedProject.slug,
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
      resetPatch();
    }
  }, [
    currentName,
    currentNamespace,
    isSuccess,
    navigate,
    notifications,
    project.slug,
    redirectAfterUpdate,
    resetPatch,
  ]);

  const formId = "project-settings-form";
  return (
    <div>
      <Form
        className={cx("d-flex", "flex-column", "gap-3")}
        id={formId}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <PermissionsGuard
          disabled={<ProjectReadOnlyNameField name={project.name} />}
          enabled={
            <ProjectNameFormField
              name="name"
              formId={formId}
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
              entityName={`${formId}-project`}
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
          disabled={<ProjectReadOnlySlugField slug={project.slug} />}
          enabled={
            <div>
              <Label className="form-label" for="group-slug">
                Slug
              </Label>
              <SlugFormField
                compact={true}
                control={control}
                entityName="project"
                errors={errors}
                name="slug"
                resetFunction={resetUrl}
                url={url}
              />
              {errors.slug && dirtyFields.slug && (
                <div className={cx("d-block", "invalid-feedback")}>
                  <p className="mb-1">
                    {errors?.slug?.message?.toString() ?? ""}
                  </p>
                </div>
              )}
            </div>
          }
          requestedPermission="delete" // NOTE: "write" is not enough
          userPermissions={permissions}
        />

        <PermissionsGuard
          disabled={
            <ProjectReadOnlyVisibilityField visibility={project.visibility} />
          }
          enabled={
            <ProjectVisibilityFormField
              name="visibility"
              formId={formId}
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
              formId={formId}
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
            <ProjectKeywordsFormField
              control={control}
              getValues={getValues}
              setValue={setValue}
            />
          }
          requestedPermission="write"
          userPermissions={permissions}
        />

        {error && <RtkErrorAlert error={error} />}

        {isSuccess && (
          <SuccessAlert className="mb-0" dismissible={false} timeout={0}>
            <p className="mb-0">The project has been successfully updated.</p>
          </SuccessAlert>
        )}

        <PermissionsGuard
          disabled={null}
          enabled={
            <div className={cx("d-flex", "justify-content-end")}>
              <Button
                color="primary"
                data-cy="project-update-button"
                disabled={isUpdating || !isDirtyExceptKeyword}
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
  return (
    <Card data-cy="project-settings-general" id="general">
      <CardHeader>
        <h4 className="m-0">
          <Sliders className={cx("me-1", "bi")} />
          General settings
        </h4>
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
