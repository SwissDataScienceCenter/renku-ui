export interface NotebookAnnotations {
  branch: string;
  "commit-sha": string;
  default_image_used: boolean;
  namespace: string;
  gitlabProjectId: number;
  projectName: string;
  repository: string;
  resourceClassId: string;

  hibernation: Record<string, unknown>;
  hibernationBranch: string;
  hibernationCommitSha: string;
  hibernationDate: string;
  hibernationDirty: boolean;
  hibernationSynchronized: boolean;
  hibernatedSecondsThreshold: string;

  // Annotations for Renku 2.0
  renkuVersion?: string;
  projectId?: string;
  launcherId?: string;

  [key: string]: unknown;
}
