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

/**
 *  renku-ui
 *
 *  Keywords.tsx
 *  Project Keywords Input
 */

import { useCallback, useEffect, useState } from "react";

import { trim } from "lodash";
import { useGetProjectIndexingStatusQuery } from "../../features/project/projectKgApi";
import {
  useProjectMetadataQuery,
  useUpdateProjectMutation,
} from "../../features/project/projectKgApi";
import { SettingRequiresKg } from "../../features/project/components/ProjectSettingsUtils";
import {
  extractRkErrorRemoteBranch,
  RtkErrorAlert,
} from "../../components/errors/RtkErrorAlert";
import ProjectWarningForMerge from "../../features/project/components/ProjectWarningForMerge";
import InlineSubmitInput, {
  InputCard,
} from "../../components/inlineSubmitInput/InlineSubmitInput";

export function sortedKeywordsList(keywordsListOrNull?: string[]) {
  const keywordsList = keywordsListOrNull || [];
  const tlSet = new Set(keywordsList);
  const tl = Array.from(tlSet);
  tl.sort();
  return tl;
}

interface ProjectKeywordsProps {
  projectId: number;
  projectFullPath: string;
  isMaintainer: boolean;
  branch?: string;
  gitUrl: string;
}
function ProjectKeywordsInput({
  branch,
  gitUrl,
  projectFullPath,
  projectId,
  isMaintainer,
}: ProjectKeywordsProps) {
  const keywordListToString = (keywords: string[] = []) => {
    const keywordsList = sortedKeywordsList(keywords);
    return keywordsList.join(", ");
  };

  const keywordsStringToList = (keywords: string) => {
    if (trim(keywords).length === 0) return [];
    const keywordsList = keywords.split(", ");
    return sortedKeywordsList(keywordsList);
  };

  const [keywords, setKeywords] = useState<string>("");
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
      error: errorKeywords,
      reset,
    },
  ] = useUpdateProjectMutation();

  const onSubmit = useCallback(() => {
    updateProject({
      projectPathWithNamespace: projectFullPath,
      project: { keywords: keywordsStringToList(keywords) },
      projectId,
    });
  }, [keywords, projectFullPath, updateProject, projectId]);

  const setKeywordsAndReset = (newKeywords: string) => {
    setKeywords(newKeywords);
    reset();
  };

  useEffect(() => {
    if (projectMetadata.data?.keywords)
      setKeywords(keywordListToString(projectMetadata.data?.keywords));
  }, [projectMetadata.data?.keywords]);

  const readOnly =
    !isMaintainer ||
    projectIndexingStatus.isLoading ||
    projectMetadata.isLoading;
  const pristine =
    keywords === keywordListToString(projectMetadata.data?.keywords);

  if (projectIndexingStatus.data?.activated === false)
    return (
      <InputCard label="Project Keywords" id="indexProjectKeywords">
        <SettingRequiresKg />
      </InputCard>
    );

  const showMergeWarning =
    isError && errorKeywords && extractRkErrorRemoteBranch(errorKeywords);
  const errorAlert = showMergeWarning ? (
    <ProjectWarningForMerge
      error={errorKeywords}
      changeDescription="keywords"
      defaultBranch={branch}
      externalUrl={gitUrl}
    />
  ) : isError && errorKeywords ? (
    <RtkErrorAlert error={errorKeywords} dismissible={false} />
  ) : null;

  return (
    <InlineSubmitInput
      classNameSubmitButton="updateProjectSettings"
      dataCyCard="settings-keywords"
      dataCyInput="keywords-input"
      disabled={isLoadingMutation}
      doneText="Updated"
      errorToDisplay={errorAlert}
      id="projectKeywords"
      inputHint="Comma-separated list of keywords"
      isDone={isSuccess}
      isSubmitting={isLoadingMutation}
      label="Project Keywords"
      loading={projectIndexingStatus.isLoading || projectMetadata.isLoading}
      onChange={(e) => setKeywordsAndReset(e.target.value)}
      onSubmit={onSubmit}
      pristine={pristine}
      readOnly={readOnly}
      submittingText="Updating"
      text="Update"
      tooltipPristine="Modify keywords to update value"
      value={keywords}
    />
  );
}

export default ProjectKeywordsInput;
