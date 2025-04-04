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
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoxArrowInUp } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, Link } from "react-router";
import { ModalBody, ModalHeader } from "reactstrap";
import { ErrorAlert, SuccessAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { GitlabProjectsToMigrate } from "../../../projectMigrationV2/ProjectMigration.types.ts";
import { DEFAULT_PER_PAGE_PROJECT_MIGRATION } from "../../../projectMigrationV2/ProjectMigrationBanner.tsx";
import {
  ProjectMigrationPost,
  usePostRenkuV1ProjectsByV1IdMigrationsMutation,
} from "../../../projectsV2/api/projectV2.api";
import {
  ProjectMetadata,
  ProjectMigrationForm,
} from "./ProjectMigration.types";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import { GitlabProjectList } from "../../../projectMigrationV2/GitlabProjectList";
import { MigrationForm } from "./ProjectMigrationForm";
import { ProjectMigrationFooter } from "./ProjectMigrationFooter";

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
  searchTerm,
  page,
  perPage,
  totalResult,
  onPageChange,
}: {
  isOpen: boolean;
  toggle: () => void;
  projectMetadata?: ProjectMetadata;
  description?: string;
  tagList?: string[];
  setSearchTerm?: (term: string) => void;
  searchTerm?: string;
  dataGitlabProjects?: GitlabProjectsToMigrate[] | undefined;
  errorGitlabProjects?: FetchBaseQueryError | SerializedError | undefined;
  isLoadingGitlabProjects?: boolean;
  page?: number;
  perPage?: number;
  totalResult?: number;
  onPageChange?: (page: number) => void;
}) {
  const [step, setStep] = useState(projectMetadata ? 2 : 1);
  const [selectedProject, setSelectedProject] =
    useState<GitlabProjectsToMigrate | null>(null);

  const {
    control,
    formState: { dirtyFields, errors },
    watch,
    setValue,
    reset,
    handleSubmit,
  } = useForm<ProjectMigrationForm>({
    defaultValues: {
      name: projectMetadata?.title ?? "",
      namespace: "",
      slug: projectMetadata?.path ?? "",
      visibility:
        projectMetadata?.visibility === "public" ? "public" : "private",
      keywords: tagList ?? [],
      codeRepositories: [projectMetadata?.httpUrl ?? ""],
      containerImage: "",
      session_launcher_name: "",
      defaultUrl: "",
    },
  });

  const containerImage = watch("containerImage");
  const defaultUrl = watch("defaultUrl");

  const [migrateProject, result] =
    usePostRenkuV1ProjectsByV1IdMigrationsMutation();

  const linkToProject = useMemo(() => {
    return result?.data
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: result.data.namespace,
          slug: result.data.slug,
        })
      : "";
  }, [result.data]);

  const handleProjectSelect = useCallback(
    (project: GitlabProjectsToMigrate) => {
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
    }
  }, [isOpen, dataGitlabProjects, reset, projectMetadata]);

  const handleSearch = useCallback(
    (search: string) => {
      if (setSearchTerm) setSearchTerm(search);
    },
    [setSearchTerm]
  );

  const onSubmit = useCallback(
    (data: ProjectMigrationForm) => {
      if (!data.containerImage || !data.defaultUrl || !data.codeRepositories)
        return;
      const dataMigration: ProjectMigrationPost = {
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
      });
    },
    [migrateProject]
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
        <BoxArrowInUp className={cx("bi", "me-1")} />
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
                  searchTerm={searchTerm}
                  page={page ?? 1}
                  perPage={perPage ?? DEFAULT_PER_PAGE_PROJECT_MIGRATION}
                  totalResult={totalResult ?? 0}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <MigrationForm
              description={description}
              keywords={tagList}
              codeRepository={
                selectedProject?.http_url_to_repo ??
                projectMetadata?.httpUrl ??
                ""
              }
              isReadyMigrationResult={!!result.data}
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              selectedProject={selectedProject}
              projectMetadata={projectMetadata}
              onSubmit={onSubmit}
              handleSubmit={handleSubmit}
            />
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
          </>
        )}
      </ModalBody>
      <ProjectMigrationFooter
        isReadyMigrationResult={!!result.data}
        isLoadingMigration={result.isLoading}
        isLoadingSessionValues={!containerImage || !defaultUrl}
        step={step}
        setStep={setStep}
        setSelectedProject={setSelectedProject}
        hasGitlabProjectList={!!dataGitlabProjects && !projectMetadata}
        toggle={toggle}
      />
    </ScrollableModal>
  );
}
