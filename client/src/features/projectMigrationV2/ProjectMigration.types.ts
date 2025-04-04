import { GitlabProjectResponse } from "../project/GitLab.types.ts";

export interface GitlabProjectsToMigrate extends GitlabProjectResponse {
  alreadyMigrated?: boolean;
}
