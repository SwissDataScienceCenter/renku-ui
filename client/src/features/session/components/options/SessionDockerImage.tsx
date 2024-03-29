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

import { skipToken } from "@reduxjs/toolkit/query";

import { Loader } from "../../../../components/Loader";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { useGetConfigQuery } from "../../../project/projectCoreApi";
import { useCoreSupport } from "../../../project/useProjectCoreSupport";
import SessionPinnedDockerImage from "./SessionPinnedDockerImage";
import SessionProjectDockerImage from "./SessionProjectDockerImage";

export default function SessionDockerImage() {
  const projectRepositoryUrl = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;

  const { branch: currentBranch, commit } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );

  const { data: projectConfig, isFetching: projectConfigIsFetching } =
    useGetConfigQuery(
      coreSupportComputed && currentBranch && commit
        ? {
            apiVersion,
            metadataVersion,
            projectRepositoryUrl,
            branch: currentBranch,
            commit,
          }
        : skipToken
    );

  if (
    !coreSupportComputed ||
    !currentBranch ||
    !commit ||
    projectConfigIsFetching
  ) {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading Docker image status...
        </div>
      </div>
    );
  }

  if (projectConfig?.config.sessions?.dockerImage) {
    return (
      <SessionPinnedDockerImage
        dockerImage={projectConfig.config.sessions.dockerImage}
      />
    );
  }

  return <SessionProjectDockerImage />;
}
