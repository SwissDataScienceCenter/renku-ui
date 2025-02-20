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
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  Button,
  Collapse,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import {
  InfoAlert,
  SuccessAlert,
  WarnAlert,
} from "../../../components/Alert.jsx";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import ChevronFlippedIcon from "../../../components/icons/ChevronFlippedIcon.tsx";
import { Loader } from "../../../components/Loader";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { useGetMigrationQuery } from "../../projects/projectMigration.api";
import {
  LegacySlug,
  ProjectName,
  RepositoriesList,
  Slug,
  usePostProjectMigrationsMutation,
  Visibility,
} from "../../projectsV2/api/projectV2.api";
import ProjectNamespaceFormField from "../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectVisibilityFormField from "../../projectsV2/fields/ProjectVisibilityFormField";
import { GitLabRegistryTag } from "../GitLab.types.ts";
import { useGetDockerImage } from "../hook/useGetDockerImage";
import { ProjectConfig } from "../project.types.ts";

interface ProjectEntityMigrationProps {
  projectId: number;
  description?: { isLoading?: boolean; unavailable?: string; value: string };
  tagList: string[];
}
export function ProjectEntityMigration({
  projectId,
  description,
  tagList,
}: ProjectEntityMigrationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: projectMigration,
    isFetching: isFetchingMigrations,
    isLoading: isLoadingMigrations,
    refetch: refetchMigrations,
  } = useGetMigrationQuery(projectId);

  const { registryTag, registryTagIsFetching, projectConfig, branch, commits } =
    useGetDockerImage();

  const linkToProject = useMemo(() => {
    return projectMigration
      ? `/v2/projects/${projectMigration.namespace}/${projectMigration.slug}`
      : "";
  }, [projectMigration]);

  const projectMetadata: unknown = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata
  );

  useEffect(() => {
    if (!isOpen) {
      refetchMigrations();
    }
  }, [isOpen, refetchMigrations]);

  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  if (isFetchingMigrations || isLoadingMigrations) return <Loader />;

  if (projectMigration)
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p>This project has been migrated to a newer version of Renku.</p>
        <Link className={cx("btn", "btn-sm", "btn-info")} to={linkToProject}>
          Go to the 2.0 version of the project
        </Link>
      </InfoAlert>
    );

  return (
    <>
      <WarnAlert>
        <p>
          This version of Renku is deprecated. Please migrate your project to
          Renku 2.0
        </p>
        <Button size="sm" color="warning" onClick={toggle}>
          Yes, I want to migrate this project to Renku 2.0
        </Button>
      </WarnAlert>
      <MigrationModal
        isOpen={isOpen}
        toggle={toggle}
        description={description?.isLoading ? undefined : description?.value}
        tagList={tagList}
        projectMetadata={projectMetadata as ProjectMetadata}
        registryTag={registryTag}
        registryTagIsFetching={registryTagIsFetching}
        projectConfig={projectConfig}
        branch={branch}
        commit={commits ? commits[0].id : undefined}
        commitMessage={commits ? commits[0].message : ""}
      />
    </>
  );
}
interface ProjectMetadata {
  accessLevel: number;
  defaultBranch: string;
  externalUrl: string;
  httpUrl: string;
  id: string;
  namespace: string;
  path: string;
  pathWithNamespace: string;
  visibility: string;
  description: string;
  title: string;
  tagList: string[];
}

interface ProjectMigrationForm {
  name: ProjectName;
  namespace: Slug;
  slug: LegacySlug;
  visibility: Visibility;
}

function MigrationModal({
  isOpen,
  toggle,
  projectMetadata,
  description,
  tagList,
  registryTag,
  registryTagIsFetching,
  projectConfig,
  branch,
  commit,
  commitMessage,
}: {
  isOpen: boolean;
  toggle: () => void;
  projectMetadata: ProjectMetadata;
  description?: string;
  tagList: string[];
  registryTag?: GitLabRegistryTag;
  registryTagIsFetching: boolean;
  projectConfig?: ProjectConfig;
  branch?: string;
  commit?: string;
  commitMessage?: string;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [migrateProject, result] = usePostProjectMigrationsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProjectMigrationForm>({
    defaultValues: {
      // description: "",
      name: projectMetadata.title,
      namespace: "",
      slug: projectMetadata.path,
      visibility:
        projectMetadata.visibility === "public" ? "public" : "private",
      // keywords: tagList ?? [],
      // repositories: projectMetadata.httpUrl ?? "",
    },
  });

  const onToggleShowDetails = useCallback(() => {
    setShowDetails((isOpen) => !isOpen);
  }, []);

  // useEffect(() => {
  //   if (description !== undefined) {
  //     setValue("description", description);
  //   }
  // }, [description, setValue]);

  // useEffect(() => {
  //   if (tagList !== undefined) {
  //     setValue("keywords", tagList);
  //   }
  // }, [tagList, setValue]);

  // useEffect(() => {
  //   if (registryTag !== undefined) {
  //     const nowFormatted = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  //     setValue("containerImage", registryTag.location);
  //     setValue("launcherName", `${registryTag.location} ${nowFormatted}`);
  //   }
  // }, [registryTag, setValue]);

  // useEffect(() => {
  //   if (projectConfig !== undefined) {
  //     setValue("defaultUrl", projectConfig?.config?.sessions?.defaultUrl ?? "");
  //   }
  // }, [projectConfig, setValue]);

  const onSubmit = useCallback(
    (data: ProjectMigrationForm) => {
      const containerImage =
        projectConfig?.config?.sessions?.dockerImage ?? registryTag?.location;
      if (!containerImage) return;
      const nowFormatted = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");

      const dataMigration = {
        project: {
          name: data.name,
          namespace: data.namespace,
          slug: data.slug,
          visibility: data.visibility,
          description: description,
          keywords: tagList,
          repositories: [projectMetadata.httpUrl ?? ""] as RepositoriesList,
        },
        sessionLauncher: {
          containerImage,
          name: `${data.name} ${nowFormatted}`,
          defaultUrl: projectConfig?.config?.sessions?.defaultUrl ?? "",
        },
      };
      migrateProject({
        projectMigrationPost: dataMigration,
        v1Id: parseInt(projectMetadata.id),
      });
    },
    [
      migrateProject,
      projectMetadata.id,
      projectMetadata.httpUrl,
      tagList,
      description,
      registryTag,
      projectConfig,
    ]
  );

  const linkToProject = useMemo(() => {
    return result?.data
      ? `/v2/projects/${result.data.namespace}/${result.data.slug}`
      : "";
  }, [result.data]);

  const details = projectConfig?.config?.sessions?.dockerImage ? (
    <p>
      The pinned image for this project will be used to create a session
      launcher.
      {projectConfig?.config?.sessions?.dockerImage}
    </p>
  ) : (
    <div>
      The latest image for this project will be used to create a session
      launcher.
      <p>
        <span>Branch: {branch}</span>
      </p>
      <p>
        <span>
          Commit: {commit} {commitMessage}
        </span>
      </p>
      <p>
        Note: This image will not update when you modify as you make more
        commits. See ... to learn more.
      </p>
    </div>
  );

  const form = !result.data && (
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
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
        />
      </div>
      <div className="mb-3">
        <Label className="form-label" for="migrateProjectSlug">
          Slug
        </Label>
        <Controller
          control={control}
          name="slug"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateProjectSlug"
              placeholder="Project slug"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a slug</div>
      </div>
      <div className="mb-3">
        <a
          className={cx("d-inline-block", "cursor-pointer", "fw-bold")}
          onClick={onToggleShowDetails}
        >
          View what will be migrated{" "}
          <ChevronFlippedIcon className="ms-1" flipped={showDetails} />
        </a>
      </div>
      <div className="mb-3">
        <Collapse isOpen={showDetails}>
          {registryTagIsFetching && <Loader inline size={16} />}
          {details}
        </Collapse>
      </div>
    </>
  );

  const successResult = result?.data && (
    <>
      <SuccessAlert dismissible={false} timeout={0}>
        <p>This project has been migrated successfully migrated to Renku 2.0</p>
        <Link
          className={cx("btn", "btn-sm", "btn-success", "text-white")}
          to={linkToProject}
        >
          Go to the 2.0 version of the project
        </Link>
      </SuccessAlert>
    </>
  );

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form className="bg-white" noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggle}>Migrate project to Renku 2.0</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}
          {form}
          {successResult}
        </ModalBody>
        <ModalFooter>
          {!result.data && (
            <>
              <Button className="btn-outline-rk-green" onClick={toggle}>
                <XLg className={cx("bi", "me-1")} />
                Cancel
              </Button>
              <Button
                disabled={result?.isLoading || registryTagIsFetching}
                type="submit"
              >
                {result.isLoading ? (
                  <Loader className="me-1" inline size={16} />
                ) : (
                  "Migrate project to Renku 2.0"
                )}
              </Button>
            </>
          )}
          {result.data && (
            <Button className="btn-outline-rk-green" onClick={toggle}>
              Close
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
}
