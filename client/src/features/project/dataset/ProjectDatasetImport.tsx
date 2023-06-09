import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import DatasetImport from "../../../project/datasets/import";
import type { DatasetImportClient } from "../../../project/datasets/import/DatasetImport";

import type { StateModelProject } from "../Project";

type ProjectDatasetImportProps = {
  client: DatasetImportClient;
  fetchDatasets: (force: boolean, versionUrl: string) => void;
  history: { push: (arg: unknown) => void };
  location: { pathname: string };
  model: unknown;
  notifications: unknown;
  params: unknown;
  toggleNewDataset: () => void;
};

function ProjectDatasetImport(props: ProjectDatasetImportProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const httpProjectUrl = projectMetadata.httpUrl;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectPathWithNamespace = `${projectNamespace}/${projectPath}`;

  return (
    <DatasetImport
      key="datasetImport"
      accessLevel={accessLevel}
      client={props.client}
      fetchDatasets={props.fetchDatasets}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      location={props.location}
      projectPathWithNamespace={projectPathWithNamespace}
      toggleNewDataset={props.toggleNewDataset}
    />
  );
}

export default ProjectDatasetImport;
