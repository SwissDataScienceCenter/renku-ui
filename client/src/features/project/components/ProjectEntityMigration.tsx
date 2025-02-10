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
import KeywordsInput from "../../../components/form-field/KeywordsInput";
import { Loader } from "../../../components/Loader";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { useGetMigrationQuery } from "../../projects/projectMigration.api";
import {
  Description,
  KeywordsList,
  LegacySlug,
  ProjectName,
  RepositoriesList,
  Repository,
  Slug,
  usePostProjectMigrationsMutation,
  Visibility,
} from "../../projectsV2/api/projectV2.api";
import ProjectNamespaceFormField from "../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectVisibilityFormField from "../../projectsV2/fields/ProjectVisibilityFormField";
import { GitLabRegistryTag } from "../GitLab.types.ts";
import { useGetDockerImage } from "../hook/useGetDockerImage";
import { ProjectConfig } from "../project.types.ts";

interface ProjectMigrationForm {
  name: ProjectName;
  namespace: Slug;
  slug: LegacySlug;
  visibility: Visibility;
  description?: Description;
  keywords?: KeywordsList;
  repositories?: Repository;
  containerImage?: string;
  launcherName?: string;
  defaultUrl?: string;
}

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

  const { registryTag, registryTagIsFetching, projectConfig } =
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

function MigrationModal({
  isOpen,
  toggle,
  projectMetadata,
  description,
  tagList,
  registryTag,
  registryTagIsFetching,
  projectConfig,
}: {
  isOpen: boolean;
  toggle: () => void;
  projectMetadata: ProjectMetadata;
  description?: string;
  tagList: string[];
  registryTag?: GitLabRegistryTag;
  registryTagIsFetching: boolean;
  projectConfig?: ProjectConfig;
}) {
  const [migrateProject, result] = usePostProjectMigrationsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<ProjectMigrationForm>({
    defaultValues: {
      description: "",
      name: projectMetadata.title,
      namespace: "",
      slug: projectMetadata.path,
      visibility:
        projectMetadata.visibility === "public" ? "public" : "private",
      keywords: tagList ?? [],
      repositories: projectMetadata.httpUrl ?? "",
    },
  });

  useEffect(() => {
    if (description !== undefined) {
      setValue("description", description);
    }
  }, [description, setValue]);

  useEffect(() => {
    if (tagList !== undefined) {
      setValue("keywords", tagList);
    }
  }, [tagList, setValue]);

  useEffect(() => {
    if (registryTag !== undefined) {
      const nowFormatted = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
      setValue("containerImage", registryTag.location);
      setValue("launcherName", `${registryTag.location} ${nowFormatted}`);
    }
  }, [registryTag, setValue]);

  useEffect(() => {
    if (projectConfig !== undefined) {
      setValue("defaultUrl", projectConfig?.config?.sessions?.defaultUrl ?? "");
    }
  }, [projectConfig, setValue]);

  const onSubmit = useCallback(
    (data: ProjectMigrationForm) => {
      const dataMigration = {
        ...data,
        repositories: [data.repositories] as RepositoriesList,
      };
      migrateProject({
        projectPost: dataMigration,
        v1Id: parseInt(projectMetadata.id),
      });
    },
    [migrateProject, projectMetadata.id]
  );

  const [areKeywordsDirty, setKeywordsDirty] = useState(false);

  const linkToProject = useMemo(() => {
    return result?.data
      ? `/v2/projects/${result.data.namespace}/${result.data.slug}`
      : "";
  }, [result.data]);

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
        <Label className="form-label" for="migrateProjectDescription">
          Description
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateProjectDescription"
              placeholder="Project description"
              type="text"
              {...field}
            />
          )}
          rules={{ required: false }}
        />
        <div className="invalid-feedback">Please provide a description</div>
      </div>
      <div className="mb-3">
        <KeywordsInput
          hasError={errors.keywords != null}
          help="Keywords are used to describe the project. To add one, type a keyword and press enter."
          label="Keywords"
          name="keywords"
          value={tagList ?? []} // Pass current value from form
          setDirty={setKeywordsDirty}
          register={register("keywords", {
            validate: () => !areKeywordsDirty,
          })}
        />
      </div>
      <div className="mb-3">
        <Label className="form-label" for="migrateProjectRepository">
          Repository
        </Label>
        <Controller
          control={control}
          name="repositories"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateProjectRepository"
              placeholder="Code repository"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a repository</div>
      </div>
      <div className="mb-3">
        <Label className="fw-bold">
          Session Launcher{" "}
          {registryTagIsFetching && <Loader inline size={16} />}
        </Label>
      </div>
      <div className="mb-3">
        <Label className="form-label" for="migrateProjectImage">
          Container Image
        </Label>
        <Controller
          control={control}
          name="containerImage"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateContainerImage"
              placeholder="image:tag"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a container image</div>
      </div>
      <div className="mb-3">
        <Label className="form-label" for="migrateLauncherName">
          Launcher name
        </Label>
        <Controller
          control={control}
          name="launcherName"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateLauncherName"
              placeholder=""
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a launcher name</div>
      </div>
      <div className="mb-3">
        <Label className="form-label" for="migrateDefaultURL">
          Default URL
        </Label>
        <Controller
          control={control}
          name="defaultUrl"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id="migrateDefaultURL"
              placeholder=""
              type="text"
              {...field}
            />
          )}
          rules={{ required: false }}
        />
        <div className="invalid-feedback">Please provide a default url</div>
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
              <Button disabled={result?.isLoading} type="submit">
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
