type IDataset = {
  created_at: string; // could be created?
  creators: string[];
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
  }
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
  }
};

export type { IDataset, StateModelProject };
