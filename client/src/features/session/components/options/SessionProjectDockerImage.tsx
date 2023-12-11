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

import {
  faCog,
  faExclamationTriangle,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useCallback, useEffect } from "react";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";

import { ACCESS_LEVELS } from "../../../../api-client";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
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
} from "../../startSessionOptionsSlice";

// ? See: SessionProjectDockerImage.md
export default function SessionProjectDockerImage() {
  const { dockerImageBuildStatus: status, dockerImageStatus } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
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
          <div className="mt-3">
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
          <div className="mt-3">
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
      <div className="mt-3">
        <ViewPipelineLink />
      </div>
    </div>
  );
}

function BuildAgainButton() {
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const accessLevel = useLegacySelector<number>(
    (state) => state.stateModel.project.metadata.accessLevel
  );

  const commit = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.commit
  );

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

  const dispatch = useAppDispatch();

  const onRetryPipeline = useCallback(() => {
    if (!gitLabProjectId || !pipelineJob) {
      return;
    }

    let reset: (() => void) | null = () => {
      dispatch(setDockerImageBuildStatus("unknown"));
      dispatch(setDockerImageStatus("unknown"));
    };
    retryPipeline({
      pipelineId: pipelineJob.pipeline.id,
      projectId: gitLabProjectId,
    }).finally(() => {
      reset?.();
    });
    return () => {
      reset = null;
    };
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
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const commit = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.commit
  );

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
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const accessLevel = useLegacySelector<number>(
    (state) => state.stateModel.project.metadata.accessLevel
  );

  const branch = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.branch
  );

  const hasDevAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;

  const [runPipeline] = useRunPipelineMutation();

  const dispatch = useAppDispatch();

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
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const { commit, dockerImageBuildStatus: status } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );
  const dispatch = useAppDispatch();

  const [
    getRenkuRegistry,
    {
      currentData: registry,
      error: renkuRegistryError,
      isFetching: renkuRegistryIsFetching,
    },
  ] = projectGitLabApi.useLazyGetRenkuRegistryQuery();

  const [
    getRegistryTag,
    {
      currentData: registryTag,
      error: registryTagError,
      isFetching: registryTagIsFetching,
    },
  ] = projectGitLabApi.useLazyGetRegistryTagQuery();

  const [
    getPipelines,
    {
      currentData: pipelines,
      error: pipelinesError,
      isFetching: pipelinesIsFetching,
    },
  ] = projectGitLabApi.useLazyGetPipelinesQuery();

  const [
    getPipelineJobByName,
    {
      currentData: pipelineJob,
      error: pipelineJobError,
      isFetching: pipelineJobIsFetching,
      isSuccess: pipelineJobIsSuccess,
    },
  ] = projectGitLabApi.useLazyGetPipelineJobByNameQuery();

  // Start checking for Docker images in CI/CD
  useEffect(() => {
    if (status !== "unknown") {
      return;
    }
    // ? async dispatch required here because of race conditions with state reset
    const timeout = window.setTimeout(
      () => dispatch(setDockerImageBuildStatus("checking-ci-registry")),
      0
    );
    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, status]);

  // Check the registry
  useEffect(() => {
    if (status !== "checking-ci-registry" || !gitLabProjectId) {
      return;
    }
    getRenkuRegistry({
      projectId: `${gitLabProjectId}`,
    });
  }, [getRenkuRegistry, gitLabProjectId, status]);

  // Handle checking the registry
  useEffect(() => {
    if (
      status !== "checking-ci-registry" ||
      renkuRegistryIsFetching ||
      (registry == null && renkuRegistryError == null)
    ) {
      return;
    }
    if (renkuRegistryError != null) {
      dispatch(setDockerImageBuildStatus("checking-ci-pipelines"));
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-image"));
  }, [dispatch, registry, renkuRegistryError, renkuRegistryIsFetching, status]);

  // Check the Docker image
  useEffect(() => {
    if (status !== "checking-ci-image" || !gitLabProjectId || !registry) {
      return;
    }
    const tag = commit.slice(0, 7);
    getRegistryTag({
      projectId: gitLabProjectId,
      registryId: registry.id,
      tag,
    });
  }, [commit, getRegistryTag, gitLabProjectId, registry, status]);

  // Handle checking the Docker image
  useEffect(() => {
    if (
      status !== "checking-ci-image" ||
      registryTagIsFetching ||
      (registryTag == null && registryTagError == null)
    ) {
      return;
    }
    if (registryTagError != null) {
      dispatch(setDockerImageBuildStatus("checking-ci-pipelines"));
      return;
    }
    dispatch(setDockerImageBuildStatus("available"));
    dispatch(setDockerImageStatus("available"));
  }, [dispatch, registryTag, registryTagError, registryTagIsFetching, status]);

  // Check the CI/CD pipelines
  useEffect(() => {
    if (status !== "checking-ci-pipelines" || !gitLabProjectId) {
      return;
    }
    getPipelines({
      commit,
      projectId: gitLabProjectId,
    });
  }, [commit, getPipelines, gitLabProjectId, status]);

  // Handle checking the CI/CD pipelines
  useEffect(() => {
    if (
      status !== "checking-ci-pipelines" ||
      pipelinesIsFetching ||
      (pipelines == null && pipelinesError == null)
    ) {
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
        dispatch(setDockerImageBuildStatus("checking-ci-pipelines"));
      }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
      return () => {
        window.clearTimeout(timeout);
      };
    }
    dispatch(setDockerImageBuildStatus("checking-ci-jobs"));
  }, [dispatch, pipelines, pipelinesError, pipelinesIsFetching, status]);

  // Check the CI/CD pipeline job
  useEffect(() => {
    if (status !== "checking-ci-jobs" || !gitLabProjectId || !pipelines) {
      return;
    }
    getPipelineJobByName({
      jobName: SESSION_CI_IMAGE_BUILD_JOB,
      pipelineIds: pipelines.map(({ id }) => id),
      projectId: gitLabProjectId,
    });
  }, [getPipelineJobByName, gitLabProjectId, pipelines, status]);

  // Handle checking the CI/CD pipeline job
  useEffect(() => {
    if (
      status !== "checking-ci-jobs" ||
      pipelineJobIsFetching ||
      (!pipelineJobIsSuccess && pipelineJobError == null)
    ) {
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
        dispatch(setDockerImageBuildStatus("checking-ci-jobs"));
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
      (
        [
          "running",
          "created",
          "pending",
          "stopping",
        ] as GitLabPipelineJob["status"][]
      ).includes(pipelineJob.status)
    ) {
      dispatch(setDockerImageBuildStatus("ci-job-running"));
      dispatch(setDockerImageStatus("building"));
      return;
    }
    dispatch(setDockerImageBuildStatus("error"));
    dispatch(setDockerImageStatus("not-available"));
  }, [
    dispatch,
    pipelineJob,
    pipelineJobError,
    pipelineJobIsFetching,
    pipelineJobIsSuccess,
    status,
  ]);

  // Check the status of the running CI/CD job
  useEffect(() => {
    if (status !== "ci-job-running") {
      return;
    }
    const timeout = window.setTimeout(() => {
      dispatch(setDockerImageBuildStatus("checking-ci-jobs"));
    }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, status]);

  // Check the registry, the CI/CD job is done, so it is supposed to exist
  useEffect(() => {
    if (status !== "checking-ci-done-registry" || !gitLabProjectId) {
      return;
    }
    getRenkuRegistry({
      projectId: `${gitLabProjectId}`,
    });
  }, [getRenkuRegistry, gitLabProjectId, status]);

  // Handle checking the registry
  useEffect(() => {
    if (
      status !== "checking-ci-done-registry" ||
      renkuRegistryIsFetching ||
      (registry == null && renkuRegistryError == null)
    ) {
      return;
    }
    if (renkuRegistryError != null) {
      dispatch(setDockerImageBuildStatus("error"));
      dispatch(setDockerImageStatus("not-available"));
      return;
    }
    dispatch(setDockerImageBuildStatus("checking-ci-done-image"));
  }, [dispatch, registry, renkuRegistryError, renkuRegistryIsFetching, status]);

  // Check the Docker image, the CI/CD job is done, so it is supposed to exist
  useEffect(() => {
    if (status !== "checking-ci-done-image" || !gitLabProjectId || !registry) {
      return;
    }
    const tag = commit.slice(0, 7);
    getRegistryTag(
      {
        projectId: gitLabProjectId,
        registryId: registry.id,
        tag,
      },
      /*preferCacheValue=*/ false
    );
  }, [commit, getRegistryTag, gitLabProjectId, registry, status]);

  // Handle checking the Docker image
  useEffect(() => {
    if (
      status !== "checking-ci-done-image" ||
      registryTagIsFetching ||
      (registryTag == null && registryTagError == null)
    ) {
      return;
    }
    if (registryTagError != null) {
      dispatch(setDockerImageBuildStatus("waiting-ci-image"));
      dispatch(setDockerImageStatus("not-available"));
      return;
    }
    dispatch(setDockerImageBuildStatus("available"));
    dispatch(setDockerImageStatus("available"));
  }, [dispatch, registryTag, registryTagError, registryTagIsFetching, status]);

  // Periodically check the registry for the Docker image
  useEffect(() => {
    if (status !== "waiting-ci-image") {
      return;
    }
    const timeout = window.setTimeout(() => {
      dispatch(setDockerImageBuildStatus("checking-ci-done-image"));
    }, SESSION_CI_PIPELINE_POLLING_INTERVAL_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, status]);
}
