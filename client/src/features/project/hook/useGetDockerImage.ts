import { skipToken } from "@reduxjs/toolkit/query";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { useDockerImageStatusStateMachine } from "../../session/components/options/SessionProjectDockerImage";
import useDefaultBranchOption from "../../session/hooks/options/useDefaultBranchOption.hook";
import useDefaultCommitOption from "../../session/hooks/options/useDefaultCommitOption.hook";
import { useGetConfigQuery } from "../projectCoreApi";
import {
  useGetAllRepositoryBranchesQuery,
  useGetAllRepositoryCommitsQuery,
} from "../projectGitLab.api";
import { useCoreSupport } from "../useProjectCoreSupport";

export function useGetDockerImage() {
  const defaultBranch = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const projectRepositoryUrl = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const { branch: currentBranch, commit } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );

  const { data: branches } = useGetAllRepositoryBranchesQuery(
    gitLabProjectId
      ? {
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
  );
  const { data: commits } = useGetAllRepositoryCommitsQuery(
    gitLabProjectId && currentBranch
      ? {
          branch: currentBranch,
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
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

  const { data: projectConfig } = useGetConfigQuery(
    backendAvailable && coreSupportComputed && currentBranch && commit
      ? {
          apiVersion,
          metadataVersion,
          projectRepositoryUrl,
          branch: currentBranch,
          commit,
        }
      : skipToken
  );

  useDefaultBranchOption({ branches, defaultBranch });
  useDefaultCommitOption({ commits });
  const { registry, registryTag, registryTagIsFetching } =
    useDockerImageStatusStateMachine();
  return {
    registry,
    registryTag,
    registryTagIsFetching,
    projectConfig,
    commits,
    branch: defaultBranch,
  };
}
