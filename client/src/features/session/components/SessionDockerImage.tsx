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
import registryApi, {
  useGetRenkuRegistryQuery,
} from "../../registry/registryApi";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { useCoreSupport } from "../../project/useProjectCoreSupport";
import { useGetConfigQuery } from "../../project/projectCoreApi";
import { Loader } from "../../../components/Loader";
import { useGetDockerImageQuery } from "../sessionApi";
import {
  useStartSessionOptionsSelector,
  setDockerImageStatus,
  setPinnedDockerImage,
} from "../startSessionOptionsSlice";

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

  const dispatch = useDispatch();

  // Set the pinned image option
  useEffect(() => {
    dispatch(setPinnedDockerImage(dockerImage));
  }, [dispatch, dockerImage]);

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
        Docker image: {JSON.stringify(dockerImageStatus?.available)}
      </div>
    </div>
  );
}

function SessionProjectDockerImage() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const { commit, dockerImageStatus: status } = useStartSessionOptionsSelector(
    ({ commit, dockerImageStatus }) => ({ commit, dockerImageStatus })
  );
  const dispatch = useDispatch();

  const [
    getRenkuRegistry,
    {
      data: registry,
      error: renkuRegistryError,
      isFetching: renkuRegistryIsFetching,
    },
  ] = registryApi
    .useLazyGetRenkuRegistryQuery
    // {
    //   projectId: `${gitLabProjectId ?? 0}`,
    // },
    // { skip: !gitLabProjectId }
    ();

  const [
    getRegistryTag,
    {
      data: registryTag,
      error: registryTagError,
      isFetching: registryTagIsFetching,
    },
  ] = registryApi.useLazyGetRegistryTagQuery();

  useEffect(() => {
    console.log({ status });
  }, [status]);
  useEffect(() => {
    console.log({ registryTag });
  }, [registryTag]);
  useEffect(() => {
    console.log({ registryTagError });
  }, [registryTagError]);

  // Start checking for Docker images in CI/CD
  useEffect(() => {
    if (status !== "unknown") {
      return;
    }
    dispatch(setDockerImageStatus("checking-ci-registry-start"));
  }, []);

  // Check the registry
  useEffect(() => {
    if (status !== "checking-ci-registry-start" || !gitLabProjectId) {
      return;
    }
    dispatch(setDockerImageStatus("checking-ci-registry"));
    getRenkuRegistry({
      projectId: `${gitLabProjectId}`,
    });
  }, [dispatch, getRenkuRegistry, gitLabProjectId, status]);

  // Handle checking the registry
  useEffect(() => {
    if (status !== "checking-ci-registry" || renkuRegistryIsFetching) {
      return;
    }
    if (renkuRegistryError != null) {
      // TODO
      dispatch(setDockerImageStatus("error"));
      return;
    }
    dispatch(setDockerImageStatus("checking-ci-image-start"));
  }, [dispatch, renkuRegistryError, renkuRegistryIsFetching, status]);

  // Check the Docker image
  useEffect(() => {
    if (status !== "checking-ci-image-start" || !gitLabProjectId || !registry) {
      return;
    }
    const tag = commit.slice(0, 7);
    dispatch(setDockerImageStatus("checking-ci-image"));
    getRegistryTag({
      projectId: gitLabProjectId,
      registryId: registry.id,
      tag,
    });
  }, [commit, getRegistryTag, gitLabProjectId, registry, status]);

  // Handle checking the Docker image
  useEffect(() => {
    if (status !== "checking-ci-image" || registryTagIsFetching) {
      return;
    }
    if (registryTagError != null) {
      // TODO
      dispatch(setDockerImageStatus("error"));
      return;
    }
    dispatch(setDockerImageStatus("available"));
  }, [dispatch, registryTagError, registryTagIsFetching, status]);

  return (
    <div className="field-group">
      <div className="form-label">Docker image: {status}</div>
    </div>
  );
}
