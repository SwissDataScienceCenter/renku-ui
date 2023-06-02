import { IDataset } from "../../features/project/Project";

interface AddDatasetDataset extends IDataset {
  fetchError: unknown;
  project?: ExistingProject;
}
type AddDatasetHandlers = {
  setCurrentStatus: (status: AddDatasetStatus | null) => void;
  submitCallback: (project: SubmitProject) => void;
  validateProject: (project: SubmitProject, isDatasetValid: boolean) => void;
};

type AddDatasetStatus = { status: string; text?: string };

type SubmitProject = {
  name: string;
  value: string;
};

interface ExistingProject extends SubmitProject {
  access_level: number;
  http_url_to_repo: string;
  id: string;
  path: string;
  path_with_namespace: string;
}

export type {
  AddDatasetDataset,
  AddDatasetHandlers,
  AddDatasetStatus,
  ExistingProject,
  SubmitProject,
};
