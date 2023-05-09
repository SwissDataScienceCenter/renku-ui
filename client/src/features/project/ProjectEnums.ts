export enum ProjectIndexingStatuses {
  InProgress = "in-progress",
  Success = "success",
  Failure = "failure",
}

export enum MigrationStartScopes {
  All,
  OnlyTemplate,
  OnlyVersion,
}
