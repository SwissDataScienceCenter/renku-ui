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
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, FormGroup, FormText, Input, Label } from "reactstrap";

import { Loader } from "../../../components/Loader";
import { InlineSubmitButton } from "../../../components/buttons/Button";
import { useGetProjectIndexingStatusQuery } from "../projectKgApi";
import { useProjectMetadataQuery } from "../../projects/projectsKgApi";
import { useUpdateDescriptionMutation } from "../projectCoreApi";

interface ProjectSettingsDescriptionProps {
  gitUrl: string;
  projectFullPath: string;
  projectId: number;
  settingsReadOnly?: boolean;
}
export function ProjectSettingsDescription({
  gitUrl,
  projectFullPath,
  projectId,
  settingsReadOnly = false,
}: ProjectSettingsDescriptionProps) {
  const [description, setDescription] = useState("");
  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !projectFullPath || !projectId,
  });
  const projectMetadata = useProjectMetadataQuery(
    { projectPath: projectFullPath },
    { skip: !projectFullPath || !projectIndexingStatus.data?.activated }
  );
  const [updateDescriptionMutation, updateDescriptionStatus] =
    useUpdateDescriptionMutation();
  const updateDescription = useCallback(
    (description: string) =>
      updateDescriptionMutation({ description, gitUrl, slug: projectFullPath }),
    [updateDescriptionMutation, gitUrl, projectFullPath]
  );
  // ! TODO: finish submit and verify re-fetching KG data
  // ! TOOD: might be necessary to fetch from core :(
  const submit = () => {
    updateDescription(description);
  };

  useEffect(() => {
    if (projectMetadata.data?.description)
      setDescription(projectMetadata.data?.description);
  }, [projectMetadata.data?.description]);

  const readOnly =
    settingsReadOnly ||
    projectIndexingStatus.isLoading ||
    projectMetadata.isLoading;
  const pristine = description === projectMetadata.data?.description;

  if (projectIndexingStatus.isLoading || projectMetadata.isLoading)
    return (
      <>
        <DescriptionLabel />
        <Loader inline size={14} />
      </>
    );

  if (projectIndexingStatus.data?.activated === false)
    return (
      <>
        <DescriptionLabel />
        <div>
          <small>
            <FontAwesomeIcon icon={faExclamationTriangle} /> This requires
            processing the metadata.
          </small>
        </div>
      </>
    );

  const inputField = (
    <Input
      data-cy="description-input"
      disabled={updateDescriptionStatus.isLoading}
      id="projectDescription"
      onChange={(e) => setDescription(e.target.value)}
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
      onSubmit={() => submit()}
      pristine={pristine}
      submittingText="Updating"
      text="Update"
      tooltipPristine="Modify description to update value"
    />
  );
  return (
    <Form>
      <FormGroup>
        <DescriptionLabel />
        <div className="d-flex">
          {inputField}
          {submitButton}
        </div>
        <FormText>A short description for the project</FormText>
      </FormGroup>
    </Form>
  );
}

function DescriptionLabel() {
  return (
    <Label className="me-2" for="projectDescription">
      Project Description
    </Label>
  );
}
