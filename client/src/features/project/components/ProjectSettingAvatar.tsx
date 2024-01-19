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

import { useCallback, useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import {
  RtkErrorAlert,
  extractRkErrorRemoteBranch,
} from "../../../components/errors/RtkErrorAlert";
import { ImageFieldPropertyName as Prop } from "../../../components/form-field/FormGeneratorImageInput";
import InlineSubmitImageInput, {
  INITIAL_IMAGE_VALUE,
  ImageValue,
} from "../../../components/inlineSubmitImageInput/InlineSubmitImageInput";
import { InputCard } from "../../../components/inlineSubmitInput/InlineSubmitInput";
import { PROJECT_AVATAR_MAX_SIZE } from "../../../project/new/components/NewProjectAvatar";
import { getEntityImageUrl } from "../../../utils/helpers/HelperFunctions";
import { ImagesLinks } from "../project.types";
import {
  useGetProjectIndexingStatusQuery,
  useProjectMetadataQuery,
  useUpdateAvatarProjectMutation,
} from "../projectKg.api";
import { SettingRequiresKg } from "./ProjectSettingsUtils";
import ProjectWarningForMerge from "./ProjectWarningForMerge";

const CURRENT_AVATAR_NAME = "[Current Avatar]";

function getCurrentImageAvatar(images?: ImagesLinks[]): ImageValue {
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
}

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
  const [succeeded, setSucceeded] = useState<boolean | undefined>(undefined);
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

  const setAvatarAndReset = useCallback(
    (newAvatar: ImageValue) => {
      setAvatar(newAvatar);
      reset();
    },
    [setAvatar, reset]
  );

  useEffect(() => {
    setAvatar(
      getCurrentImageAvatar(
        projectMetadata.data?.images as unknown as ImagesLinks[]
      )
    );
  }, [projectMetadata.data?.images]);

  const onCancel = useCallback(() => {
    setAvatar(
      getCurrentImageAvatar(
        projectMetadata.data?.images as unknown as ImagesLinks[]
      )
    );
    reset();
  }, [reset, setAvatar, projectMetadata.data?.images]);

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
            color="green"
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
          <div className="my-2">{errorAlert}</div>
        </CardBody>
      </Card>
    </>
  );
}
