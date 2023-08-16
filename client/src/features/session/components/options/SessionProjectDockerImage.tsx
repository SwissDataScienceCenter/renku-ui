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

import React, { useCallback, useEffect } from "react";
import {
  faCog,
  faExclamationTriangle,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { ACCESS_LEVELS } from "../../../../api-client";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { GitLabPipelineJob } from "../../../project/GitLab.types";
import projectGitLabApi, {
  useGetPipelineJobByNameQuery,
  useGetPipelinesQuery,
  useRetryPipelineMutation,
  useRunPipelineMutation,
} from "../../../project/projectGitLab.api";
import {
  SESSION_CI_IMAGE_BUILD_JOB,
  SESSION_CI_PIPELINE_POLLING_INTERVAL_MS,
} from "../../startSessionOptions.constants";
import {
  setDockerImageBuildStatus,
  setDockerImageStatus,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";

// ? See: SessionProjectDockerImage.md
export default function SessionProjectDockerImage() {
  const { dockerImageBuildStatus: status, dockerImageStatus } =
    useStartSessionOptionsSelector(
      ({ commit, dockerImageBuildStatus, dockerImageStatus }) => ({
        commit,
        dockerImageBuildStatus,
        dockerImageStatus,
      })
    );

  useDockerImageStatusStateMachine();

  if (dockerImageStatus === "unknown") {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading Docker image status...
        </div>
      </div>
    );
  }

  if (dockerImageStatus === "available") {
    return (
      <div className="field-group">
        <div className="form-label">
          Docker image <Badge color="success">available</Badge>
        </div>
      </div>
    );
  }

  if (dockerImageStatus === "not-available") {
    const moreInfo =
      status === "error" ? (
        <div>
          <div className={cx("form-label", "mt-3")}>
            <FontAwesomeIcon
              className={cx("text-danger", "me-1")}
              icon={faExclamationTriangle}
            />
            The Docker image build failed. You can use the base image to start a
            session, but project-specific dependencies will not be available.
          </div>
          <div>
            <BuildAgainButton />
            <ViewPipelineLink />
          </div>
        </div>
      ) : (
        <div>
          <div className={cx("form-label", "mt-3")}>
            <FontAwesomeIcon
              className={cx("text-danger", "me-1")}
              icon={faExclamationTriangle}
            />
            No Docker image found. You can use the base image to start a
            session, but project-specific dependencies will not be available.
          </div>
          <div>
            <RunPipeline />
          </div>
        </div>
      );

    return (
      <div className="field-group">
        <div className="form-label">
          Docker image <Badge color="danger">not available</Badge>
        </div>
        {moreInfo}
      </div>
    );
  }

  return (
    <div className="field-group">
      <div className="form-label">
        Docker image <Badge color="warning">building</Badge>
      </div>
      <div>
        <div className={cx("form-label", "mt-3")}>
          <FontAwesomeIcon className="me-1" icon={faCog} spin />
          The Docker image for the session is being built. Please wait a
          moment...
        </div>
        <div className={cx("form-label", "mt-1")}>
          You can use the base image to start a session instead of waiting, but
          project-specific dependencies will not be available.
        </div>
      </div>
      <div>
        <ViewPipelineLink />
      </div>
    </div>
  );
}

function BuildAgainButton() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const accessLevel = useSelector<RootStateOrAny, number>(
    (state) => state.stateModel.project.metadata.accessLevel
  );

  const commit = useStartSessionOptionsSelector(({ commit }) => commit);

  const hasDevAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;

  const { data: pipelines } = useGetPipelinesQuery(
    { commit, projectId: gitLabProjectId ?? 0 },
    { skip: !gitLabProjectId }
  );

  const { data: pipelineJob } = useGetPipelineJobByNameQuery(
    {
      jobName: SESSION_CI_IMAGE_BUILD_JOB,
      pipelineIds: (pipelines ?? []).map(({ id }) => id),
      projectId: gitLabProjectId ?? 0,
    },
    { skip: !gitLabProjectId || !pipelines }
  );

  const [retryPipeline] = useRetryPipelineMutation();

  const dispatch = useDispatch();

  const onRetryPipeline = useCallback(() => {
    if (!gitLabProjectId || !pipelineJob) {
      return;
    }

    retryPipeline({
      pipelineId: pipelineJob.pipeline.id,
      projectId: gitLabProjectId,
    });
    dispatch(setDockerImageBuildStatus("unknown"));
    dispatch(setDockerImageStatus("unknown"));
  }, [dispatch, gitLabProjectId, pipelineJob, retryPipeline]);

  if (!hasDevAccess) {
    return null;
  }

  return (
    <>
      <Button
        className="me-1"
        color="primary"
        id="imageBuildAgain"
        size="sm"
        onClick={onRetryPipeline}
      >
        <FontAwesomeIcon className="me-1" icon={faRedo} />
        Build again
      </Button>
      <UncontrolledTooltip
        placement="top"
        target="imageBuildAgain"
        trigger="hover"
        offset={[0, 5]} // offset the tooltip a bit higher
      >
        Try to build again if it is the first time you see this error on this
        commit.
      </UncontrolledTooltip>
    </>
  );
}

function ViewPipelineLink() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const commit = useStartSessionOptionsSelector(({ commit }) => commit);

  const { data: pipelines } = useGetPipelinesQuery(
    { commit, projectId: gitLabProjectId ?? 0 },
    { skip: !gitLabProjectId }
  );

  const { data: pipelineJob } = useGetPipelineJobByNameQuery(
    {
      jobName: SESSION_CI_IMAGE_BUILD_JOB,
      pipelineIds: (pipelines ?? []).map(({ id }) => id),
      projectId: gitLabProjectId ?? 0,
    },
    { skip: !gitLabProjectId || !pipelines }
  );

  const pipelineJobUrl = pipelineJob?.web_url;

  if (!pipelineJobUrl) {
    return null;
  }

  return (
    <>
      <ExternalLink
        id="imageCheckPipeline"
        role="button"
        showLinkIcon={true}
        size="sm"
        title="View pipeline in GitLab"
        url={pipelineJobUrl}
      />
      <UncontrolledTooltip
        placement="top"
        target="imageCheckPipeline"
        trigger="hover"
        offset={[0, 5]} // offset the tooltip a bit higher
      >
        Check the GitLab pipeline. For expert users.
      </UncontrolledTooltip>
    </>
  );
}

function RunPipeline() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const accessLevel = useSelector<RootStateOrAny, number>(
    (state) => state.stateModel.project.metadata.accessLevel
  );

  const branch = useStartSessionOptionsSelector(({ branch }) => branch);

  const hasDevAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;

  const [runPipeline] = useRunPipelineMutation();

  const dispatch = useDispatch();

  const onRunPipeline = useCallback(() => {
    if (!branch || !gitLabProjectId) {
      return;
    }

    runPipeline({
      projectId: gitLabProjectId,
      ref: branch,
    });
    dispatch(setDockerImageBuildStatus("unknown"));
    dispatch(setDockerImageStatus("unknown"));
  }, [branch, dispatch, gitLabProjectId, runPipeline]);

  if (!hasDevAccess) {
    return null;
  }

  return (
    <>
      If you are seeing this error for the first time,{" "}
      <Button color="primary" size="sm" id="imageBuild" onClick={onRunPipeline}>
        <FontAwesomeIcon className="me-1" icon={faRedo} />
        building the branch image
      </Button>{" "}
      will probably solve the problem.
    </>
  );
}

function useDockerImageStatusStateMachine() {
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const { commit, dockerImageBuildStatus: status } =
    useStartSessionOptionsSelector(({ commit, dockerImageBuildStatus }) => ({
      commit,
      dockerImageBuildStatus,
    }));
  const dispatch = useDispatch();

  const [
    getRenkuRegistry,
    {
      data: registry,
      error: renkuRegistryError,
      isFetching: renkuRegistryIsFetching,
    },
  ] = projectGitLabApi.useLazyGetRenkuRegistryQuery();

  const [
    getRegistryTag,
    { error: registryTagError, isFetching: registryTagIsFetching },
  ] = projectGitLabApi.useLazyGetRegistryTagQuery();

  const [
    getPipelines,
    { data: pipelines, error: pipelinesError, isFetching: pipelinesIsFetching },
  ] = projectGitLabApi.useLazyGetPipelinesQuery();

  const [
    getPipelineJobByName,
    {
      data: pipelineJob,
      error: pipelineJobError,
      isFetching: pipelineJobIsFetching,
    },
  ] = projectGitLabApi.useLazyGetPipelineJobByNameQuery();

  // Start checking for Docker images in CI/CD
  useEffect(() => {
    if (status !== "unknown") {
      return;
    }
    // ? async dispatch required here because of race conditions with state reset
    const timeout = window.setTimeout(
      () => dispatch(setDockerImageBuildStatus("checking-ci-registry-start")),
      0
    );
    return () => {
      window.clearTimeout(timeout);
    };
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
      dispatch(setDockerImageBuildStatus("checking-ci-done-registry-start"));
      return;
    }
    if (
      (
        ["running", "pending", "stopping"] as GitLabPipelineJob["status"][]
      ).includes(pipelineJob.status)
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
}
