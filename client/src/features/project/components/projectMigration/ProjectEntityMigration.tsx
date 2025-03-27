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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { XLg, Airplane, ArrowLeft } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, Link, useLocation } from "react-router";
import { Button, Form, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { ErrorAlert, SuccessAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { toHumanDateTime } from "../../../../utils/helpers/DateTimeUtils";
import { isRenkuLegacy } from "../../../../utils/helpers/HelperFunctionsV2";
import {
  RepositoriesList,
  usePostRenkuV1ProjectsByV1IdMigrationsMutation,
} from "../../../projectsV2/api/projectV2.api";
import { GitlabProjectResponse } from "../../GitLab.types";
import { useGetSessionLauncherData } from "../../hook/useGetSessionLauncherData";
import {
  ProjectMetadata,
  ProjectMigrationForm,
} from "./ProjectMigration.types";
import {
  DetailsMigration,
  DetailsNotIncludedInMigration,
} from "./ProjectMigrationDetails";
import { ProjectMigrationFormInputs } from "./ProjectMigrationForm";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import { GitlabProjectList } from "../../../projectMigrationV2/GitlabProjectList.js";

export function MigrationModal({
  isOpen,
  toggle,
  projectMetadata,
  description,
  tagList,
  setSearchTerm,
  dataGitlabProjects,
  errorGitlabProjects,
  isLoadingGitlabProjects,
  refetchGitlabProjects,
}: {
  isOpen: boolean;
  toggle: () => void;
  projectMetadata?: ProjectMetadata;
  description?: string;
  tagList?: string[];
  setSearchTerm?: (term: string) => void;
  searchTerm?: string;
  dataGitlabProjects?: GitlabProjectResponse[] | undefined;
  errorGitlabProjects?: FetchBaseQueryError | SerializedError | undefined;
  isLoadingGitlabProjects?: boolean;
  refetchGitlabProjects?: () => void;
}) {
  const [step, setStep] = useState(projectMetadata ? 2 : 1);
  const [selectedProject, setSelectedProject] =
    useState<GitlabProjectResponse | null>(null);

  const {
    control,
    formState: { dirtyFields, errors },
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<ProjectMigrationForm>({
    defaultValues: {
      name: projectMetadata?.title ?? "",
      namespace: "",
      slug: projectMetadata?.path ?? "",
      visibility:
        projectMetadata?.visibility === "public" ? "public" : "private",
    },
  });

  const location = useLocation();
  const isRenkuV1 = isRenkuLegacy(location.pathname);

  const [migrateProject, result] =
    usePostRenkuV1ProjectsByV1IdMigrationsMutation();
  const {
    registryTag,
    isFetchingData,
    projectConfig,
    branch,
    commits,
    templateName,
    resourcePools,
    isProjectSupported,
  } = useGetSessionLauncherData(
    selectedProject?.default_branch ??
      projectMetadata?.defaultBranch ??
      "master",
    selectedProject?.id
      ? Number(selectedProject.id)
      : projectMetadata?.id
      ? Number(projectMetadata.id)
      : null,
    selectedProject?.http_url_to_repo ?? projectMetadata?.externalUrl ?? ""
  );

  const isPinnedImage = !!projectConfig?.config?.sessions?.dockerImage;

  const containerImage = useMemo(() => {
    return (
      projectConfig?.config?.sessions?.dockerImage ?? registryTag?.location
    );
  }, [projectConfig, registryTag]);

  const defaultSessionClass = useMemo(
    () =>
      resourcePools?.flatMap((pool) => pool.classes).find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [resourcePools]
  );

  const resourceClass = useMemo(() => {
    return (
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id && c.matching) ??
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.matching) ??
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id) ??
      undefined
    );
  }, [resourcePools, defaultSessionClass]);

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
      if (!containerImage || (!projectMetadata && !selectedProject)) return;
      const nowFormatted = toHumanDateTime({ datetime: DateTime.now() });
      const dataMigration = {
        project: {
          name: data.name,
          namespace: data.namespace,
          slug: data.slug,
          visibility: data.visibility,
          description: description,
          keywords: tagList,
          repositories: [
            selectedProject?.http_url_to_repo ?? projectMetadata?.httpUrl ?? "",
          ] as RepositoriesList,
        },
        session_launcher: {
          container_image: containerImage,
          name: `${templateName ?? data.name} ${nowFormatted}`,
          default_url: projectConfig?.config?.sessions?.defaultUrl ?? "",
          resource_class_id: resourceClass?.id,
        },
      };
      migrateProject({
        projectMigrationPost: dataMigration,
        v1Id: parseInt(
          selectedProject?.id?.toString() ?? projectMetadata?.id ?? "0"
        ),
      });
    },
    [
      migrateProject,
      projectMetadata,
      selectedProject,
      tagList,
      description,
      projectConfig,
      containerImage,
      templateName,
      resourceClass,
    ]
  );

  const handleProjectSelect = useCallback(
    (project: GitlabProjectResponse) => {
      setSelectedProject(project);
      reset({
        name: project.name,
        namespace: "",
        slug: project.path,
        visibility: project.visibility === "public" ? "public" : "private",
      });
      setStep(2);
    },
    [reset]
  );

  const handleBack = useCallback(() => {
    setStep(1);
    setSelectedProject(null);
    reset({
      name: projectMetadata?.title ?? "",
      namespace: "",
      slug: projectMetadata?.path ?? "",
      visibility:
        projectMetadata?.visibility === "public" ? "public" : "private",
    });
  }, [reset, projectMetadata]);

  useEffect(() => {
    if (!isOpen) {
      setStep(projectMetadata ? 2 : 1);
      setSelectedProject(null);
      reset({
        name: projectMetadata?.title ?? "",
        namespace: "",
        slug: projectMetadata?.path ?? "",
        visibility:
          projectMetadata?.visibility === "public" ? "public" : "private",
      });
      if (!projectMetadata && dataGitlabProjects && refetchGitlabProjects)
        refetchGitlabProjects();
    }
  }, [
    isOpen,
    dataGitlabProjects,
    refetchGitlabProjects,
    reset,
    projectMetadata,
  ]);

  const buttonClasses = useMemo(
    () => ({
      outline: isRenkuV1 ? "outline-rk-green" : "outline-primary",
      primary: isRenkuV1 ? "rk-green" : "primary",
    }),
    [isRenkuV1]
  );

  const handleSearch = useCallback(
    (search: string) => {
      if (setSearchTerm) setSearchTerm(search);
    },
    [setSearchTerm]
  );

  return (
    <ScrollableModal
      backdrop="static"
      centered
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        <Airplane className={cx("bi", "me-1")} />
        {step === 1
          ? "Select project to migrate"
          : "Migrate project to Renku 2.0"}
      </ModalHeader>
      <ModalBody className="p-4">
        {result.error && <RtkErrorAlert error={result.error} />}
        {step === 1 && !projectMetadata ? (
          <>
            {errorGitlabProjects ? (
              <ErrorAlert dismissible={false}>
                Error loading projects. Please try again.
              </ErrorAlert>
            ) : (
              <div className="h-100">
                <GitlabProjectList
                  projects={dataGitlabProjects ?? []}
                  onSelectProject={handleProjectSelect}
                  onSearch={handleSearch}
                  isLoading={isLoadingGitlabProjects ?? false}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              {!result.data && (
                <ProjectMigrationFormInputs
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  control={control}
                  dirtyFields={dirtyFields}
                />
              )}
              {isFetchingData && (
                <div className="py-2">
                  <Loader inline size={16} /> Loading session data...
                </div>
              )}
              {!result.data && !isFetchingData && (
                <>
                  <DetailsMigration
                    isPinnedImage={isPinnedImage}
                    containerImage={containerImage}
                    branch={branch}
                    commits={commits}
                    description={description}
                    keywords={tagList?.join(",")}
                    codeRepository={
                      selectedProject?.http_url_to_repo ??
                      projectMetadata?.httpUrl ??
                      ""
                    }
                    resourceClass={resourceClass}
                    isProjectSupported={isProjectSupported}
                  />
                  <DetailsNotIncludedInMigration />
                </>
              )}
            </Form>
            {result?.data && (
              <SuccessAlert dismissible={false} timeout={0}>
                <p>This project has been successfully migrated to Renku 2.0</p>
                <Link
                  className={cx("btn", "btn-sm", "btn-success", "text-white")}
                  to={linkToProject}
                >
                  Go to the 2.0 version of the project
                </Link>
              </SuccessAlert>
            )}
            {!containerImage && !isFetchingData && (
              <ErrorAlert dismissible={false}>
                Container image not available, it does not exist or is currently
                building.
              </ErrorAlert>
            )}
            {!isProjectSupported && !isFetchingData && (
              <ErrorAlert dismissible={false}>
                Please update this project before migrating it to Renku 2.0.
              </ErrorAlert>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        {!result.data && (
          <>
            {!projectMetadata && (
              <Button
                color={buttonClasses.outline}
                onClick={step === 1 ? toggle : handleBack}
              >
                {step === 1 ? (
                  <XLg className={cx("bi", "me-1")} />
                ) : (
                  <ArrowLeft className={cx("bi", "me-1")} />
                )}
                {step === 1 ? "Cancel" : "Back"}
              </Button>
            )}
            {projectMetadata && (
              <Button color={buttonClasses.outline} onClick={toggle}>
                <XLg className={cx("bi", "me-1")} /> Cancel
              </Button>
            )}
            {step === 2 && (
              <Button
                color={buttonClasses.primary}
                disabled={
                  result?.isLoading ||
                  isFetchingData ||
                  !containerImage ||
                  !isProjectSupported
                }
                type="submit"
                onClick={handleSubmit(onSubmit)}
              >
                {result.isLoading ? (
                  <Loader className="me-1" inline size={16} />
                ) : (
                  "Migrate project to Renku 2.0"
                )}
              </Button>
            )}
          </>
        )}
        {result.data && (
          <Button color={buttonClasses.outline} onClick={toggle}>
            Close
          </Button>
        )}
      </ModalFooter>
    </ScrollableModal>
  );
}
