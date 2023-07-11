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

import React, { useEffect } from "react";
import { useGetRenkuRegistryQuery } from "../../registry/registryApi";
import { RootStateOrAny, useSelector } from "react-redux";
import { useCoreSupport } from "../../project/useProjectCoreSupport";
import { useGetConfigQuery } from "../../project/projectCoreApi";
import { Loader } from "../../../components/Loader";
import { useGetDockerImageQuery } from "../sessionApi";
import { useStartSessionOptionsSelector } from "../startSessionOptionsSlice";

export default function SessionDockerImage() {
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;

  // TODO: We should get the commit here, not the branch
  const branch = useStartSessionOptionsSelector(({ branch }) => branch);

  const { data: projectConfig, isFetching: projectConfigIsFetching } =
    useGetConfigQuery(
      {
        branch,
        projectRepositoryUrl,
        versionUrl,
      },
      { skip: !coreSupportComputed || !branch }
    );

  useEffect(() => {
    console.log({ coreSupport });
  }, [coreSupport]);
  useEffect(() => {
    console.log({ projectConfig });
  }, [projectConfig]);

  if (!coreSupportComputed || projectConfigIsFetching) {
    return (
      <div className="field-group">
        <div className="form-label">
          Loading Docker image status... <Loader inline size={16} />
        </div>
      </div>
    );
  }

  if (projectConfig?.config.sessions?.dockerImage) {
    return (
      <SessionPinnedDockerImage
        dockerImage={projectConfig?.config.sessions?.dockerImage}
      />
    );
  }

  return <SessionProjectDockerImage />;
}

interface SessionPinnedDockerImageProps {
  dockerImage: string;
}

function SessionPinnedDockerImage({
  dockerImage,
}: SessionPinnedDockerImageProps) {
  const { data: dockerImageStatus, isFetching } = useGetDockerImageQuery({
    image: dockerImage,
  });

  if (isFetching) {
    return (
      <div className="field-group">
        <div className="form-label">
          Loading Docker image status... <Loader inline size={16} />
        </div>
      </div>
    );
  }

  if (dockerImageStatus == null) {
    return (
      <div className="field-group">
        <div className="form-label">
          Error: could not get Docker image availability for{" "}
          <code>{dockerImage}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="field-group">
      <div className="form-label">
        Docker image: {dockerImageStatus?.available}
      </div>
    </div>
  );
}

function SessionProjectDockerImage() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const result = useGetRenkuRegistryQuery(
    {
      projectId: `${gitLabProjectId ?? 0}`,
    },
    { skip: !gitLabProjectId }
  );

  useEffect(() => {
    console.log({ result });
  }, [result]);

  return (
    <div className="field-group">
      <div className="form-label">Docker image</div>
    </div>
  );
}
