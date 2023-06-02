import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../../api-client";
import ImportDataset from "../../../project/datasets/import";
import { Url } from "../../../utils/helpers/url";

import type { StateModelProject } from "../Project";

type ProjectDatasetImportProps = {
  client: unknown;
  fetchDatasets: unknown;
  history: unknown;
  location: unknown;
  model: unknown;
  notifications: unknown;
  params: unknown;
  toggleNewDataset: unknown;
};

function ProjectDatasetImport(props: ProjectDatasetImportProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const datasets = project.datasets.core.datasets;
  const httpProjectUrl = projectMetadata.httpUrl;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;

  const forkedData = project.forkedFromProject;
  const forked =
    forkedData != null && Object.keys(forkedData).length > 0 ? true : false;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = {
    namespace: projectNamespace,
    path: projectPath,
    target: "",
  };
  const fileContentUrl = Url.get(Url.pages.project.file, projectUrlProps);
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const overviewCommitsUrl = Url.get(
    Url.pages.project.overview.commits,
    projectUrlProps
  );
  const projectsUrl = Url.get(Url.pages.projects);

  return (
    <ImportDataset
      key="datasetImport"
      accessLevel={accessLevel}
      client={props.client}
      datasets={datasets}
      fetchDatasets={props.fetchDatasets}
      fileContentUrl={fileContentUrl}
      forked={forked}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      lineagesUrl={lineagesUrl}
      location={props.location}
      maintainer={maintainer}
      model={props.model}
      notifications={props.notifications}
      overviewCommitsUrl={overviewCommitsUrl}
      projectsUrl={projectsUrl}
      toggleNewDataset={props.toggleNewDataset}
    />
  );
}

export default ProjectDatasetImport;
