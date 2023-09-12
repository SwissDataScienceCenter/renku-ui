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

import { useEffect, useMemo } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { StatusStepProgressBar } from "../../../../components/progress/ProgressSteps";
import { useGetResourcePoolsQuery } from "../../../dataServices/dataServicesApi";
import {
  useGetAllRepositoryBranchesQuery,
  useGetRepositoryCommitsQuery,
} from "../../../project/projectGitLab.api";
import { useCoreSupport } from "../../../project/useProjectCoreSupport";
import useDefaultAutoFetchLfsOption from "../../hooks/options/useDefaultAutoFetchLfsOption.hook";
import useDefaultBranchOption from "../../hooks/options/useDefaultBranchOption.hook";
import useDefaultCommitOption from "../../hooks/options/useDefaultCommitOption.hook";
import useDefaultSessionClassOption from "../../hooks/options/useDefaultSessionClassOption.hook";
import useDefaultStorageOption from "../../hooks/options/useDefaultStorageOption.hook";
import useDefaultUrlOption from "../../hooks/options/useDefaultUrlOption.hook";
import usePatchedProjectConfig from "../../hooks/usePatchedProjectConfig.hook";
import { useStartSessionMutation } from "../../sessions.api";
import {
  setError,
  setStarting,
  setSteps,
  updateStepStatus,
} from "../../startSession.slice";
import {
  startSessionOptionsSlice,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";
import { useProjectSessions } from "../ProjectSessionsList";
import SessionDockerImage from "./SessionDockerImage";

export default function AutostartSessionOptions() {
  useAutostartSessionOptions();

  const dispatch = useDispatch();

  // Reset start session options slice when we navigate away
  useEffect(() => {
    return () => {
      dispatch(startSessionOptionsSlice.actions.reset());
    };
  }, [dispatch]);

  // eslint-disable-next-line spellcheck/spell-checker
  // TODO(@leafty): refactor `SessionDockerImage` so that we can import hooks here
  return (
    <div className="d-none">
      <SessionDockerImage />
    </div>
  );
}

function useAutostartSessionOptions(): void {
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const namespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.namespace
  );
  const project = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.path
  );
  const projectPathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const projectSessions = useProjectSessions({ projectPathWithNamespace });
  const validSessions = useMemo(
    () =>
      projectSessions != null
        ? Object.values(projectSessions).filter(
            ({ status }) =>
              status.state !== "failed" && status.state !== "stopping"
          )
        : null,
    [projectSessions]
  );

  const {
    branch: currentBranch,
    commit,
    defaultUrl,
    dockerImageStatus,
    lfsAutoFetch,
    pinnedDockerImage,
    sessionClass: currentSessionClassId,
    storage,
  } = useStartSessionOptionsSelector();

  const { data: branches, isFetching: branchesIsFetching } =
    useGetAllRepositoryBranchesQuery(
      {
        projectId: `${gitLabProjectId ?? 0}`,
      },
      { skip: !gitLabProjectId }
    );
  const { data: commits, isFetching: commitsIsFetching } =
    useGetRepositoryCommitsQuery(
      {
        branch: currentBranch,
        projectId: `${gitLabProjectId ?? 0}`,
      },
      { skip: !gitLabProjectId || !currentBranch }
    );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;
  const {
    data: projectConfig,
    error: errorProjectConfig,
    isFetching: projectConfigIsFetching,
  } = usePatchedProjectConfig({
    apiVersion,
    commit,
    gitLabProjectId: gitLabProjectId ?? 0,
    metadataVersion,
    projectRepositoryUrl,
    skip: !backendAvailable || !coreSupportComputed || !commit,
  });
  const { data: resourcePools, isFetching: resourcePoolsIsFetching } =
    useGetResourcePoolsQuery(
      {
        cpuRequest: projectConfig?.config.sessions?.legacyConfig?.cpuRequest,
        gpuRequest: projectConfig?.config.sessions?.legacyConfig?.gpuRequest,
        memoryRequest:
          projectConfig?.config.sessions?.legacyConfig?.memoryRequest,
        storageRequest: projectConfig?.config.sessions?.storage,
      },
      { skip: !projectConfig }
    );

  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap(({ classes }) => classes)
        .find((c) => c.id === currentSessionClassId) ?? null,
    [currentSessionClassId, resourcePools]
  );

  // Select default options
  useDefaultBranchOption({ branches, defaultBranch });
  useDefaultCommitOption({ commits });
  useDefaultUrlOption({ projectConfig });
  useDefaultSessionClassOption({ resourcePools });
  useDefaultStorageOption({
    currentSessionClass,
    projectConfig,
  });
  useDefaultAutoFetchLfsOption({ projectConfig });

  const dispatch = useDispatch();

  const [startSession] = useStartSessionMutation({
    fixedCacheKey: "start-session",
  });

  // Handle errors
  useEffect(() => {
    if (coreSupportComputed && !backendAvailable) {
      dispatch(
        setError({
          error: "backend-error",
          errorMessage: "Error: This project is not supported",
        })
      );
    }
  }, [backendAvailable, coreSupportComputed, dispatch]);
  useEffect(() => {
    if (errorProjectConfig) {
      dispatch(
        setError({
          error: "backend-error",
          errorMessage: "Error while loading project configuration",
        })
      );
    }
  }, [dispatch, errorProjectConfig]);

  // Handle starting steps
  useEffect(() => {
    dispatch(
      setSteps([
        {
          id: 0,
          status: StatusStepProgressBar.EXECUTING,
          step: "Checking existing sessions",
        },
        {
          id: 1,
          status: StatusStepProgressBar.WAITING,
          step: "Loading branches",
        },
        {
          id: 2,
          status: StatusStepProgressBar.WAITING,
          step: "Loading commits",
        },
        {
          id: 3,
          status: StatusStepProgressBar.WAITING,
          step: "Loading project settings",
        },
        {
          id: 4,
          status: StatusStepProgressBar.WAITING,
          step: "Loading docker image status",
        },
        {
          id: 5,
          status: StatusStepProgressBar.WAITING,
          step: "Loading resource pools",
        },
        {
          id: 6,
          status: StatusStepProgressBar.WAITING,
          step: "Requesting session",
        },
      ])
    );
  }, [dispatch]);

  useEffect(() => {
    if (validSessions != null && validSessions.length == 0) {
      dispatch(
        updateStepStatus({ id: 0, status: StatusStepProgressBar.READY })
      );
      return;
    }
    if (validSessions != null) {
      dispatch(setError({ error: "existing-session" }));
    }
  }, [dispatch, validSessions]);

  useEffect(() => {
    if (branchesIsFetching) {
      dispatch(
        updateStepStatus({ id: 1, status: StatusStepProgressBar.EXECUTING })
      );
    }
  }, [branchesIsFetching, dispatch]);
  useEffect(() => {
    if (branches != null) {
      dispatch(
        updateStepStatus({ id: 1, status: StatusStepProgressBar.READY })
      );
    }
  }, [branches, dispatch]);

  useEffect(() => {
    if (commitsIsFetching) {
      dispatch(
        updateStepStatus({ id: 2, status: StatusStepProgressBar.EXECUTING })
      );
    }
  }, [commitsIsFetching, dispatch]);
  useEffect(() => {
    if (commits != null) {
      dispatch(
        updateStepStatus({ id: 2, status: StatusStepProgressBar.READY })
      );
    }
  }, [commits, dispatch]);

  useEffect(() => {
    if (projectConfigIsFetching) {
      dispatch(
        updateStepStatus({ id: 3, status: StatusStepProgressBar.EXECUTING })
      );
    }
  }, [dispatch, projectConfigIsFetching]);
  useEffect(() => {
    if (projectConfig != null) {
      dispatch(
        updateStepStatus({ id: 3, status: StatusStepProgressBar.READY })
      );
    }
  }, [dispatch, projectConfig]);

  useEffect(() => {
    if (dockerImageStatus === "unknown") {
      dispatch(
        updateStepStatus({ id: 4, status: StatusStepProgressBar.EXECUTING })
      );
    }
  }, [dispatch, dockerImageStatus]);
  useEffect(() => {
    if (dockerImageStatus === "available") {
      dispatch(
        updateStepStatus({ id: 4, status: StatusStepProgressBar.READY })
      );
    }
  }, [dispatch, dockerImageStatus]);
  useEffect(() => {
    if (dockerImageStatus === "not-available") {
      dispatch(setError({ error: "docker-image-not-available" }));
    }
  }, [dispatch, dockerImageStatus]);
  useEffect(() => {
    if (dockerImageStatus === "building") {
      dispatch(setError({ error: "docker-image-building" }));
    }
  }, [dispatch, dockerImageStatus]);

  useEffect(() => {
    if (resourcePoolsIsFetching) {
      dispatch(
        updateStepStatus({ id: 5, status: StatusStepProgressBar.EXECUTING })
      );
    }
  }, [dispatch, resourcePoolsIsFetching]);
  useEffect(() => {
    if (resourcePools != null) {
      dispatch(
        updateStepStatus({ id: 5, status: StatusStepProgressBar.READY })
      );
    }
  }, [dispatch, resourcePools]);

  // Request session
  useEffect(() => {
    if (
      validSessions == null ||
      validSessions.length > 0 ||
      branches == null ||
      commits == null ||
      dockerImageStatus !== "available" ||
      projectConfig == null ||
      resourcePools == null ||
      currentSessionClassId == 0
    ) {
      return;
    }

    dispatch(setStarting(true));
    dispatch(
      updateStepStatus({
        id: 6,
        status: StatusStepProgressBar.EXECUTING,
      })
    );
    startSession({
      branch: currentBranch,
      cloudStorageV2: [], // TODO: populate this
      commit,
      defaultUrl,
      environmentVariables: {},
      image: pinnedDockerImage,
      lfsAutoFetch,
      namespace,
      project,
      sessionClass: currentSessionClassId,
      storage,
    });
  }, [
    branches,
    commit,
    commits,
    currentBranch,
    currentSessionClassId,
    defaultUrl,
    dispatch,
    dockerImageStatus,
    lfsAutoFetch,
    namespace,
    pinnedDockerImage,
    project,
    projectConfig,
    resourcePools,
    startSession,
    storage,
    validSessions,
  ]);
}
