/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { useCallback, useEffect, useState } from "react";
import { useGetProjectIndexingStatusQuery } from "../projectKgApi";
import {
  useProjectMetadataQuery,
  useUpdateProjectMutation,
} from "../../project/projectKgApi";
import { SettingRequiresKg } from "./ProjectSettingsUtils";
import {
  extractRkErrorRemoteBranch,
  RtkErrorAlert,
} from "../../../components/errors/RtkErrorAlert";
import ProjectWarningForMerge from "./ProjectWarningForMerge";
import InlineSubmitInput, {
  InputCard,
} from "../../../components/inlineSubmitInput/InlineSubmitInput";

interface ProjectSettingsDescriptionProps {
  isMaintainer: boolean;
  projectFullPath: string;
  projectId: number;
  branch?: string;
  gitUrl: string;
}
export function ProjectSettingsDescription({
  isMaintainer,
  projectFullPath,
  projectId,
  branch,
  gitUrl,
}: ProjectSettingsDescriptionProps) {
  const [description, setDescription] = useState("");
  const [succeeded, setSucceeded] = React.useState<boolean | undefined>(
    undefined
  );
  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !projectFullPath || !projectId,
  });
  const projectMetadata = useProjectMetadataQuery(
    { projectPath: projectFullPath, projectId },
    {
      skip:
        !projectFullPath ||
        !projectId ||
        !projectIndexingStatus.data?.activated,
    }
  );

  const [
    updateProject,
    {
      isLoading: isLoadingMutation,
      isSuccess,
      isError,
      error: errorDescription,
      reset,
    },
  ] = useUpdateProjectMutation();

  const onSubmit = useCallback(() => {
    updateProject({
      projectPathWithNamespace: projectFullPath,
      project: { description },
      projectId,
    })
      .unwrap()
      .then(() => setSucceeded(true))
      .catch(() => setSucceeded(false));
  }, [description, projectFullPath, updateProject, projectId]);

  const setDescriptionAndReset = (newDescription: string) => {
    setDescription(newDescription);
    // Reset mutation when changing description after an update.
    reset();
  };

  useEffect(() => {
    if (projectMetadata.data?.description)
      setDescription(projectMetadata.data?.description);
  }, [projectMetadata.data?.description]);

  const readOnly =
    !isMaintainer ||
    projectIndexingStatus.isLoading ||
    projectMetadata.isLoading;
  const pristine = description === projectMetadata.data?.description;

  if (projectIndexingStatus.data?.activated === false)
    return (
      <InputCard label="Project Description" id="indexProjectDescription">
        <SettingRequiresKg />
      </InputCard>
    );

  const showMergeWarning =
    !succeeded &&
    isError &&
    errorDescription &&
    extractRkErrorRemoteBranch(errorDescription);
  const errorAlert = showMergeWarning ? (
    <ProjectWarningForMerge
      error={errorDescription}
      changeDescription="description"
      defaultBranch={branch}
      externalUrl={gitUrl}
    />
  ) : isError && errorDescription ? (
    <RtkErrorAlert error={errorDescription} dismissible={false} />
  ) : null;

  return (
    <InlineSubmitInput
      classNameSubmitButton="updateProjectSettings"
      dataCyCard="settings-description"
      dataCyInput="description-input"
      disabled={isLoadingMutation}
      doneText="Updated"
      errorToDisplay={errorAlert}
      id="projectDescription"
      inputHint="A short description for the project"
      isDone={isSuccess}
      isSubmitting={isLoadingMutation}
      label="Project Description"
      loading={projectIndexingStatus.isLoading || projectMetadata.isLoading}
      onChange={(e) => setDescriptionAndReset(e.target.value)}
      onSubmit={onSubmit}
      pristine={pristine}
      readOnly={readOnly}
      submittingText="Updating"
      text="Update"
      tooltipPristine="Modify description to update value"
      value={description}
    />
  );
}
