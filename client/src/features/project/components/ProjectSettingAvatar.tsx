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
  useUpdateAvatarProjectMutation,
} from "../../projects/projectsKgApi";
import { SettingRequiresKg } from "./ProjectSettingsUtils";
import {
  extractRkErrorRemoteBranch,
  RtkErrorAlert,
} from "../../../components/errors/RtkErrorAlert";
import ProjectWarningForMerge from "./ProjectWarningForMerge";
import { InputCard } from "../../../components/inlineSubmitInput/InlineSubmitInput";
import { PROJECT_AVATAR_MAX_SIZE } from "../../../project/new/components/NewProjectAvatar";
import InlineSubmitImageInput, {
  ImageValue,
  INITIAL_IMAGE_VALUE,
} from "../../../components/inlineSubmitImageInput/InlineSubmitImageInput";
import { ImageFieldPropertyName as Prop } from "../../../components/form-field/FormGeneratorImageInput";
import { Card, CardBody } from "reactstrap";
import { ImagesLinks } from "../Project";
import { getEntityImageUrl } from "../../../utils/helpers/HelperFunctions";

const CURRENT_AVATAR_NAME = "[Current Avatar]";

interface ProjectSettingsAvatarProps {
  isMaintainer: boolean;
  projectFullPath: string;
  projectId: number;
  branch?: string;
  gitUrl: string;
}
export function ProjectSettingsAvatar({
  isMaintainer,
  projectFullPath,
  projectId,
  branch,
  gitUrl,
}: ProjectSettingsAvatarProps) {
  const [avatar, setAvatar] = useState<ImageValue>();
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
      error: errorAvatar,
      reset,
    },
  ] = useUpdateAvatarProjectMutation();

  const onSubmit = useCallback(() => {
    const imageProject = avatar?.options[avatar?.selected];
    if (!imageProject) return;
    updateProject({
      projectPathWithNamespace: projectFullPath,
      avatar: imageProject.FILE as File,
      projectId,
    })
      .unwrap()
      .then(() => setSucceeded(true))
      .catch(() => setSucceeded(false));
  }, [avatar, projectFullPath, updateProject, projectId]);

  const setAvatarAndReset = (newAvatar: ImageValue) => {
    setAvatar(newAvatar);
    reset();
  };

  const getCurrentImageAvatar = (images?: ImagesLinks[]): ImageValue => {
    return images && images.length > 0
      ? ({
          options: [
            {
              [Prop.NAME]: CURRENT_AVATAR_NAME,
              [Prop.URL]: getEntityImageUrl(images),
            },
          ],
          selected: 0,
        } as ImageValue)
      : INITIAL_IMAGE_VALUE;
  };

  useEffect(() => {
    setAvatar(
      getCurrentImageAvatar(
        projectMetadata.data?.images as unknown as ImagesLinks[]
      )
    );
  }, [projectMetadata.data?.images]);

  const onCancel = () => {
    setAvatar(
      getCurrentImageAvatar(
        projectMetadata.data?.images as unknown as ImagesLinks[]
      )
    );
    reset();
  };

  const readOnly =
    !isMaintainer ||
    projectIndexingStatus.isLoading ||
    projectMetadata.isLoading;

  if (projectIndexingStatus.data?.activated === false)
    return (
      <InputCard label="Project Avatar" id="indexProjectAvatar">
        <SettingRequiresKg />
      </InputCard>
    );

  const showMergeWarning =
    !succeeded &&
    isError &&
    errorAvatar &&
    extractRkErrorRemoteBranch(errorAvatar);
  const errorAlert = showMergeWarning ? (
    <ProjectWarningForMerge
      error={errorAvatar}
      changeDescription="avatar"
      defaultBranch={branch}
      externalUrl={gitUrl}
    />
  ) : isError && errorAvatar ? (
    <RtkErrorAlert error={errorAvatar} dismissible={false} property="avatar" />
  ) : null;

  const initialValue = getCurrentImageAvatar(
    projectMetadata.data?.images as unknown as ImagesLinks[]
  );
  return (
    <>
      <Card className="form-rk-green mb-4">
        <CardBody>
          <InlineSubmitImageInput
            alert={null}
            currentImageName={CURRENT_AVATAR_NAME}
            doneText="Avatar Updated"
            includeRequiredLabel={false}
            imageMaxSize={PROJECT_AVATAR_MAX_SIZE}
            isDisabled={readOnly}
            isDone={isSuccess}
            isSubmitting={isLoadingMutation}
            label="Project Avatar"
            name="project-avatar"
            onCancel={onCancel}
            onChange={(value) => {
              setAvatarAndReset(value as unknown as ImageValue);
            }}
            onSubmit={() => onSubmit()}
            readOnly={readOnly}
            submitButtonId="update-avatar"
            value={avatar ?? initialValue}
          />
          {errorAlert}
        </CardBody>
      </Card>
    </>
  );
}
