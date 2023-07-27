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
import {
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Badge, Button, Collapse, FormText, Input } from "reactstrap";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import { Docs } from "../../../utils/constants/Docs";
import { PipelineJob } from "../../pipelines/pipelines.types";
import pipelinesApi from "../../pipelines/pipelines.api";
import { useCoreSupport } from "../../project/useProjectCoreSupport";
import registryApi from "../../registry/registry.api";
import usePatchedProjectConfig from "../hooks/usePatchedProjectConfig.hook";
import { useGetDockerImageQuery } from "../sessions.api";
import {
  SESSION_CI_IMAGE_BUILD_JOB,
  SESSION_CI_PIPELINE_POLLING_INTERVAL_MS,
} from "../startSessionOptions.constants";
import { DockerImageStatus } from "../startSessionOptions.types";
import {
  setDockerImageBuildStatus,
  setDockerImageStatus,
  setPinnedDockerImage,
  useStartSessionOptionsSelector,
} from "../startSessionOptionsSlice";

export default function SessionDockerImage() {
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;

  const commit = useStartSessionOptionsSelector(({ commit }) => commit);

  const { data: projectConfig, isFetching: projectConfigIsFetching } =
    usePatchedProjectConfig({
      commit,
      gitLabProjectId: gitLabProjectId ?? 0,
      projectRepositoryUrl,
      versionUrl,
      skip: !coreSupportComputed,
    });

  useEffect(() => {
    console.log({ commit });
  }, [commit]);

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
  const status = useStartSessionOptionsSelector(
    ({ dockerImageStatus }) => dockerImageStatus
  );

  const { data: dockerImageStatus, isLoading } = useGetDockerImageQuery(
    {
      image: dockerImage,
    },
    {
      pollingInterval:
        status === "not-available"
          ? SESSION_CI_PIPELINE_POLLING_INTERVAL_MS
          : 0,
    }
  );

  const [show, setShow] = useState<boolean>(false);
  const toggleShow = useCallback(() => setShow((show) => !show), []);

  const dispatch = useDispatch();

  // Set the pinned image option
  useEffect(() => {
    dispatch(setPinnedDockerImage(dockerImage));
  }, [dispatch, dockerImage]);

  // Set the image status
  useEffect(() => {
    const newStatus: DockerImageStatus = isLoading
      ? "unknown"
      : dockerImageStatus == null
      ? "not-available"
      : dockerImageStatus.available
      ? "available"
      : "not-available";
    if (newStatus !== status) {
      dispatch(setDockerImageStatus(newStatus));
    }
  }, [dispatch, dockerImageStatus, isLoading, status]);

  if (status === "unknown") {
    return (
      <div className="field-group">
        <div className="form-label">
          Loading Docker image status... <Loader inline size={16} />
        </div>
      </div>
    );
  }

  const moreInfoButton = (
    <Button className={cx("ms-3", "p-0")} color="link" onClick={toggleShow}>
      more info
    </Button>
  );
  const pinnedImagesDoc = (
    <ExternalLink
      role="text"
      iconSup={true}
      iconAfter={true}
      url={Docs.rtdReferencePage("templates.html#pin-a-docker-image")}
      title="pinned image"
    />
  );
  const badge =
    status === "not-available" ? (
      <Badge color="danger">pinned not available</Badge>
    ) : (
      <Badge color="success">pinned available</Badge>
    );
  const moreInfo =
    status === "not-available" ? (
      <>
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />{" "}
        Pinned Docker image not found. Since this project specifies a{" "}
        {pinnedImagesDoc}, it is unlikely to work with a base image.
      </>
    ) : (
      <>
        <Input
          type="text"
          disabled={true}
          id="customImage"
          value={dockerImage}
        ></Input>
        <FormText>
          <FontAwesomeIcon icon={faInfoCircle} /> This project specifies a{" "}
          {pinnedImagesDoc}. A pinned image has advantages for projects with
          many forks, but it will not reflect changes to the{" "}
          <code>Dockerfile</code> or any project dependency files.
        </FormText>
      </>
    );

  return (
    <div className="field-group">
      <div className="form-label">
        Docker image: {badge}
        {moreInfoButton}
        <Collapse isOpen={show}>
          <div className="mt-3">{moreInfo}</div>
        </Collapse>
      </div>
    </div>
  );
}

function SessionProjectDockerImage() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const {
    commit,
    dockerImageBuildStatus: status,
    dockerImageStatus,
  } = useStartSessionOptionsSelector(
    ({ commit, dockerImageBuildStatus, dockerImageStatus }) => ({
      commit,
      dockerImageBuildStatus,
      dockerImageStatus,
    })
  );
  const dispatch = useDispatch();

  const [
    getRenkuRegistry,
    {
      data: registry,
      error: renkuRegistryError,
      isFetching: renkuRegistryIsFetching,
    },
  ] = registryApi.useLazyGetRenkuRegistryQuery();

  const [
    getRegistryTag,
    {
      data: registryTag,
      error: registryTagError,
      isFetching: registryTagIsFetching,
    },
  ] = registryApi.useLazyGetRegistryTagQuery();

  const [
    getPipelines,
    { data: pipelines, error: pipelinesError, isFetching: pipelinesIsFetching },
  ] = pipelinesApi.useLazyGetPipelinesQuery();

  const [
    getPipelineJobByName,
    {
      data: pipelineJob,
      error: pipelineJobError,
      isFetching: pipelineJobIsFetching,
    },
  ] = pipelinesApi.useLazyGetPipelineJobByNameQuery();

  useEffect(() => {
    console.log({ status });
  }, [status]);
  useEffect(() => {
    console.log({ registryTag });
  }, [registryTag]);
  useEffect(() => {
    console.log({ registryTagError });
  }, [registryTagError]);
  useEffect(() => {
    console.log({ pipelines });
  }, [pipelines]);
  useEffect(() => {
    console.log({ pipelineJob });
  }, [pipelineJob]);

  // Start checking for Docker images in CI/CD
  useEffect(() => {
    if (status !== "unknown") {
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-registry-start"));
  }, [dispatch, status]);

  // Check the registry
  useEffect(() => {
    if (status !== "checking-ci-registry-start" || !gitLabProjectId) {
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-registry"));
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
      dispatch(setDockerImageBuildStatus("checking-ci-pipelines-start"));
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-image-start"));
  }, [dispatch, renkuRegistryError, renkuRegistryIsFetching, status]);

  // Check the Docker image
  useEffect(() => {
    if (status !== "checking-ci-image-start" || !gitLabProjectId || !registry) {
      return;
    }
    const tag = commit.slice(0, 7);
    dispatch(setDockerImageBuildStatus("checking-ci-image"));
    getRegistryTag({
      projectId: gitLabProjectId,
      registryId: registry.id,
      tag,
    });
  }, [commit, dispatch, getRegistryTag, gitLabProjectId, registry, status]);

  // Handle checking the Docker image
  useEffect(() => {
    if (status !== "checking-ci-image" || registryTagIsFetching) {
      return;
    }
    if (registryTagError != null) {
      dispatch(setDockerImageBuildStatus("checking-ci-pipelines-start"));
      return;
    }
    dispatch(setDockerImageBuildStatus("available"));
    dispatch(setDockerImageStatus("available"));
  }, [dispatch, registryTagError, registryTagIsFetching, status]);

  // Check the CI/CD pipelines
  useEffect(() => {
    if (status !== "checking-ci-pipelines-start" || !gitLabProjectId) {
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-pipelines"));
    getPipelines({
      commit,
      projectId: gitLabProjectId,
    });
  }, [commit, dispatch, getPipelines, gitLabProjectId, status]);

  // Handle checking the CI/CD pipelines
  useEffect(() => {
    if (status !== "checking-ci-pipelines" || pipelinesIsFetching) {
      return;
    }
    if (pipelinesError != null || pipelines == null) {
      dispatch(setDockerImageBuildStatus("error"));
      dispatch(setDockerImageStatus("not-available"));
      return;
    }
    if (pipelines.length == 0) {
      dispatch(setDockerImageStatus("not-available"));
      const timeout = window.setTimeout(() => {
        dispatch(setDockerImageBuildStatus("checking-ci-pipelines-start"));
      }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
      return () => {
        window.clearTimeout(timeout);
      };
    }
    dispatch(setDockerImageBuildStatus("checking-ci-jobs-start"));
  }, [dispatch, pipelines, pipelinesError, pipelinesIsFetching, status]);

  // Check the CI/CD pipeline job
  useEffect(() => {
    if (status !== "checking-ci-jobs-start" || !gitLabProjectId || !pipelines) {
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-jobs"));
    getPipelineJobByName({
      jobName: SESSION_CI_IMAGE_BUILD_JOB,
      pipelineIds: pipelines.map(({ id }) => id),
      projectId: gitLabProjectId,
    });
  }, [dispatch, getPipelineJobByName, gitLabProjectId, pipelines, status]);

  // Handle checking the CI/CD pipeline job
  useEffect(() => {
    if (status !== "checking-ci-jobs" || pipelineJobIsFetching) {
      return;
    }
    if (pipelineJobError != null) {
      dispatch(setDockerImageBuildStatus("error"));
      dispatch(setDockerImageStatus("not-available"));
      return;
    }
    if (pipelineJob == null) {
      dispatch(setDockerImageStatus("not-available"));
      const timeout = window.setTimeout(() => {
        dispatch(setDockerImageBuildStatus("checking-ci-jobs-start"));
      }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
      return () => {
        window.clearTimeout(timeout);
      };
    }

    if (pipelineJob.status === "success") {
      dispatch(setDockerImageBuildStatus("checking-ci-done-registry"));
      return;
    }
    if (
      (["running", "pending", "stopping"] as PipelineJob["status"][]).includes(
        pipelineJob.status
      )
    ) {
      dispatch(setDockerImageBuildStatus("ci-job-running"));
      dispatch(setDockerImageStatus("building"));
      return;
    }
    dispatch(setDockerImageBuildStatus("error"));
    dispatch(setDockerImageStatus("not-available"));
  }, [dispatch, pipelineJob, pipelineJobError, pipelineJobIsFetching, status]);

  // Check the status of the running CI/CD job
  useEffect(() => {
    if (status !== "ci-job-running") {
      return;
    }
    const timeout = window.setTimeout(() => {
      dispatch(setDockerImageBuildStatus("checking-ci-jobs-start"));
    }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, pipelineJob, pipelineJobError, pipelineJobIsFetching, status]);

  // Check the registry, the CI/CD job is done, so it is supposed to exist
  useEffect(() => {
    if (status !== "checking-ci-done-registry-start" || !gitLabProjectId) {
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-done-registry"));
    getRenkuRegistry({
      projectId: `${gitLabProjectId}`,
    });
  }, [dispatch, getRenkuRegistry, gitLabProjectId, status]);

  // Handle checking the registry
  useEffect(() => {
    if (status !== "checking-ci-done-registry" || renkuRegistryIsFetching) {
      return;
    }
    if (renkuRegistryError != null) {
      dispatch(setDockerImageBuildStatus("error"));
      dispatch(setDockerImageStatus("not-available"));
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-done-image-start"));
  }, [dispatch, renkuRegistryError, renkuRegistryIsFetching, status]);

  // Check the Docker image, the CI/CD job is done, so it is supposed to exist
  useEffect(() => {
    if (
      status !== "checking-ci-done-image-start" ||
      !gitLabProjectId ||
      !registry
    ) {
      return;
    }
    const tag = commit.slice(0, 7);
    dispatch(setDockerImageBuildStatus("checking-ci-done-image"));
    getRegistryTag({
      projectId: gitLabProjectId,
      registryId: registry.id,
      tag,
    });
  }, [commit, dispatch, getRegistryTag, gitLabProjectId, registry, status]);

  // Handle checking the Docker image
  useEffect(() => {
    if (status !== "checking-ci-done-image" || registryTagIsFetching) {
      return;
    }
    if (registryTagError != null) {
      dispatch(setDockerImageBuildStatus("waiting-ci-image"));
      dispatch(setDockerImageStatus("not-available"));
      return;
    }
    dispatch(setDockerImageBuildStatus("available"));
    dispatch(setDockerImageStatus("available"));
  }, [dispatch, registryTagError, registryTagIsFetching, status]);

  // Periodically check the registry for the Docker image
  useEffect(() => {
    if (status !== "waiting-ci-image") {
      return;
    }
    const timeout = window.setTimeout(() => {
      dispatch(setDockerImageBuildStatus("checking-ci-done-image-start"));
    }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, registryTagError, registryTagIsFetching, status]);

  return (
    <div className="field-group">
      <div className="form-label">
        Docker image: {status} {dockerImageStatus}
      </div>
    </div>
  );
}
