type IDataset = {
  annotations: string[];
  created_at: string; // could be created?
  creators: { affiliation: string | null; email: string }[];
  description: string;
  exists?: boolean;
  hasPart?: boolean;
  identifier: string;
  insideKg: boolean;
  keywords: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mediaContent: any;
  name: string;
  published: string;
  sameAs?: string;
  title: string;
  url?: string;
  usedIn?: string;
  fetching: boolean;
  fetched: boolean;
};

type IDatasetFiles = {
  fetched: boolean;
  fetching: boolean;
  files: IDatasetFile[];
};

type IDatasetFile = {
  path: string;
  added: string;
  name: string;
};

type IMigration = {
  check: {
    core_renku_version?: string;
    project_supported?: boolean;
    project_renku_version?: string;
    core_compatibility_status: {
      project_metadata_version?: string;
      migration_required?: boolean;
      current_metadata_version?: string;
    };
    dockerfile_renku_status: {
      latest_renku_version?: string;
      dockerfile_renku_version?: string;
      automated_dockerfile_update?: boolean;
      newer_renku_available?: boolean;
    };
    template_status: {
      newer_template_available?: boolean;
      template_id?: string;
      automated_template_update?: boolean;
      template_ref?: string;
      project_template_version?: string;
      template_source?: string;
      latest_template_version?: string;
    };
  };
  core: {
    versionUrl: string | null;
    backendAvailable: boolean | null;
    error: boolean | null;
    fetched: boolean | null;
    fetching: boolean | null;
  };
  migrating: boolean;
  migration_status: unknown | null;
  migration_error: unknown | null;
};

type StateModelProject = {
  branches: unknown;
  datasets: {
    core: {
      datasets: unknown;
    };
  };
  filesTree?: {
    hash: Record<string, unknown>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forkedFromProject?: any;
  lockStatus: unknown;
  metadata: {
    accessLevel: number;
    defaultBranch: string;
    externalUrl: string;
    httpUrl: string;
    id: string;
    namespace: string;
    path: string;
    pathWithNamespace: string;
    visibility: string;
  };
  migration: unknown;
  webhook: {
    progress: unknown;
  };
};

export type { IDataset, IDatasetFile, IDatasetFiles, IMigration, StateModelProject };
