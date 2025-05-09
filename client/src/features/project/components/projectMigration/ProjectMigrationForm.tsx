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

import { DateTime } from "luxon";
import { useEffect, useMemo } from "react";
import {
  Control,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormHandleSubmit,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Form } from "reactstrap";
import { Loader } from "../../../../components/Loader";
import { toHumanDateTime } from "../../../../utils/helpers/DateTimeUtils";
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
import ProjectMigrationFormInputs from "./ProjectMigrationFormInputs";
import { ErrorAlert } from "../../../../components/Alert";

interface MigrationFormProps {
  description?: string;
  keywords?: string[];
  codeRepository?: string;
  isReadyMigrationResult: boolean;
  control: Control<ProjectMigrationForm, unknown>;
  errors: FieldErrors<ProjectMigrationForm>;
  setValue: UseFormSetValue<ProjectMigrationForm>;
  watch: UseFormWatch<ProjectMigrationForm>;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<ProjectMigrationForm>>>;
  selectedProject?: GitlabProjectResponse | null;
  projectMetadata?: ProjectMetadata;
  onSubmit: (data: ProjectMigrationForm) => void;
  handleSubmit: UseFormHandleSubmit<ProjectMigrationForm>;
}

export default function MigrationForm({
  description,
  keywords,
  codeRepository,
  isReadyMigrationResult,
  control,
  errors,
  setValue,
  watch,
  dirtyFields,
  selectedProject,
  projectMetadata,
  onSubmit,
  handleSubmit,
}: MigrationFormProps) {
  const defaultBranch =
    selectedProject?.default_branch ??
    projectMetadata?.defaultBranch ??
    "master";
  const {
    commits,
    registryTag,
    isFetchingData: isFetchingSessionData,
    projectConfig,
    templateName,
    resourcePools,
    isProjectSupported,
  } = useGetSessionLauncherData(
    defaultBranch,
    selectedProject?.id
      ? Number(selectedProject.id)
      : projectMetadata?.id
      ? Number(projectMetadata.id)
      : null,
    selectedProject?.http_url_to_repo ?? projectMetadata?.externalUrl ?? ""
  );

  const projectName = watch("name");
  const isPinnedImage = !!projectConfig?.config?.sessions?.dockerImage;

  const containerImage = useMemo(() => {
    return (
      projectConfig?.config?.sessions?.dockerImage ?? registryTag?.location
    );
  }, [projectConfig, registryTag]);

  useEffect(() => {
    if (setValue && containerImage) {
      setValue("containerImage", containerImage);
    }
  }, [containerImage, setValue]);

  useEffect(() => {
    if (setValue && projectConfig?.config?.sessions?.defaultUrl) {
      setValue("defaultUrl", projectConfig?.config?.sessions?.defaultUrl);
    }
  }, [projectConfig?.config?.sessions?.defaultUrl, setValue]);

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

  useEffect(() => {
    if (setValue && resourceClass) {
      setValue("resourceClassId", resourceClass?.id);
    }
  }, [resourceClass, setValue]);

  useEffect(() => {
    if (setValue) {
      setValue("codeRepositories", [codeRepository ?? ""]);
    }
  }, [codeRepository, setValue]);

  useEffect(() => {
    if (setValue && description) {
      setValue("description", description);
    }
  }, [description, setValue]);

  useEffect(() => {
    if (setValue && keywords) {
      setValue("keywords", keywords);
    }
  }, [keywords, setValue]);

  useEffect(() => {
    if (setValue) {
      const nowFormatted = toHumanDateTime({ datetime: DateTime.now() });
      setValue(
        "session_launcher_name",
        `${templateName ?? projectName} ${nowFormatted}`
      );
    }
  }, [templateName, projectName, setValue]);

  useEffect(() => {
    if (setValue) {
      setValue(
        "v1Id",
        parseInt(selectedProject?.id?.toString() ?? projectMetadata?.id ?? "0")
      );
    }
  }, [selectedProject, projectMetadata, setValue]);

  return (
    <Form
      id="project-migration-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      {!isReadyMigrationResult && (
        <ProjectMigrationFormInputs
          errors={errors}
          setValue={setValue}
          watch={watch}
          control={control}
          dirtyFields={dirtyFields}
        />
      )}
      {isFetchingSessionData && (
        <div className="py-2">
          <Loader inline size={16} /> Loading session data...
        </div>
      )}
      {!isReadyMigrationResult && !isFetchingSessionData && (
        <>
          <DetailsMigration
            isPinnedImage={isPinnedImage}
            containerImage={containerImage}
            branch={defaultBranch}
            commits={commits}
            description={description}
            keywords={keywords?.join(",")}
            codeRepository={codeRepository ?? ""}
            resourceClass={resourceClass}
            isProjectSupported={isProjectSupported}
          />
          <DetailsNotIncludedInMigration />
        </>
      )}
      {!containerImage && !isFetchingSessionData && (
        <ErrorAlert dismissible={false}>
          Container image not available, it does not exist or is currently
          building.
        </ErrorAlert>
      )}
      {!isProjectSupported && !isFetchingSessionData && (
        <ErrorAlert dismissible={false}>
          Please update this project before migrating it to Renku 2.0.
        </ErrorAlert>
      )}
    </Form>
  );
}
