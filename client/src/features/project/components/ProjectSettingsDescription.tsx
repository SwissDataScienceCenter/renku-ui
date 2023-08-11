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
import { Card, CardBody, FormText, Input, Label } from "reactstrap";

import { Loader } from "../../../components/Loader";
import { InlineSubmitButton } from "../../../components/buttons/Button";
import { useGetProjectIndexingStatusQuery } from "../projectKgApi";
import { useProjectMetadataQuery } from "../../projects/projectsKgApi";
import { useUpdateDescriptionMutation } from "../projectCoreApi";
import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { CoreErrorContent } from "../../../utils/definitions";
import { SettingRequiresKg } from "./ProjectSettingsUtils";

interface ProjectSettingsDescriptionProps {
  gitUrl: string;
  isMaintainer: boolean;
  projectFullPath: string;
  projectId: number;
}
export function ProjectSettingsDescription({
  gitUrl,
  isMaintainer,
  projectFullPath,
  projectId,
}: ProjectSettingsDescriptionProps) {
  const [description, setDescription] = useState("");
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
  const [updateDescriptionMutation, updateDescriptionStatus] =
    useUpdateDescriptionMutation();
  const onSubmit = useCallback(() => {
    updateDescriptionMutation({
      description,
      gitUrl,
      projectId,
    });
  }, [description, gitUrl, projectId, updateDescriptionMutation]);

  const setDescriptionAndReset = (newDescription: string) => {
    setDescription(newDescription);
    // Reset mutation when changing description after an update.
    if (!updateDescriptionStatus.isUninitialized)
      updateDescriptionStatus.reset();
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

  if (projectIndexingStatus.isLoading || projectMetadata.isLoading)
    return (
      <DescriptionCard>
        <Loader className="ms-1" inline size={16} />
      </DescriptionCard>
    );

  if (projectIndexingStatus.data?.activated === false)
    return (
      <DescriptionCard>
        <SettingRequiresKg />
      </DescriptionCard>
    );

  const inputField = (
    <Input
      data-cy="description-input"
      disabled={updateDescriptionStatus.isLoading}
      id="projectDescription"
      onChange={(e) => setDescriptionAndReset(e.target.value)}
      readOnly={readOnly}
      value={description}
    />
  );

  const submitButton = readOnly ? null : (
    <InlineSubmitButton
      className="updateProjectSettings"
      doneText="Updated"
      id="update-desc"
      isDone={updateDescriptionStatus.isSuccess}
      isReadOnly={readOnly || pristine}
      isSubmitting={updateDescriptionStatus.isLoading}
      onSubmit={onSubmit}
      pristine={pristine}
      submittingText="Updating"
      text="Update"
      tooltipPristine="Modify description to update value"
    />
  );

  const error =
    updateDescriptionStatus.error && "data" in updateDescriptionStatus.error ? (
      <CoreErrorAlert
        error={updateDescriptionStatus.error.data as CoreErrorContent}
      />
    ) : null;

  return (
    <DescriptionCard>
      <div className="d-flex" data-cy="settings-description">
        {inputField}
        {submitButton}
      </div>
      <FormText>A short description for the project</FormText>
      {error}
    </DescriptionCard>
  );
}

interface DescriptionCardProps {
  children: React.ReactNode;
}
function DescriptionCard({ children }: DescriptionCardProps) {
  return (
    <Card className="mb-4">
      <CardBody>
        <Label className="me-2" for="projectDescription">
          Project Description
        </Label>
        {children}
      </CardBody>
    </Card>
  );
}
