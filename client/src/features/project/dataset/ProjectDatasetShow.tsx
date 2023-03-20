import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../../api-client";
import ShowDataset from "../../../dataset/Dataset.container";
import { Url } from "../../../utils/helpers/url";

import type { StateModelProject } from "../Project.d";

type ProjectDatasetShowProps = {
  datasetCoordinator: unknown;
  datasetId: string;
  graphStatus: boolean;
  history: unknown;
  location: unknown;
  model: unknown;
  projectInsideKg: boolean;
};

function ProjectDatasetShow(props: ProjectDatasetShowProps) {
  const project = useSelector((state: RootStateOrAny) => state.stateModel.project as StateModelProject);
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const datasets = project.datasets.core.datasets;
  const httpProjectUrl = projectMetadata.httpUrl;
  const lockStatus = project.lockStatus;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const migration = project.migration;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;
  const projectId = projectMetadata.id;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = { namespace: projectNamespace, path: projectPath, target: "" };
  const fileContentUrl = Url.get(Url.pages.project.file, projectUrlProps);
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const overviewStatusUrl = Url.get(Url.pages.project.overview.status, projectUrlProps);
  const projectsUrl = Url.get(Url.pages.projects);
  return (
    <ShowDataset
      key="datasetPreview"
      datasets={datasets}
      datasetCoordinator={props.datasetCoordinator}
      datasetId={props.datasetId}
      fileContentUrl={fileContentUrl}
      graphStatus={props.graphStatus}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      lineagesUrl={lineagesUrl}
      location={props.location}
      lockStatus={lockStatus}
      logged={user.logged}
      maintainer={maintainer}
      migration={migration}
      model={props.model}
      overviewStatusUrl={overviewStatusUrl}
      projectId={projectId}
      projectInsideKg={props.projectInsideKg}
      projectPathWithNamespace={projectPathWithNamespace}
      projectsUrl={projectsUrl}
    />
  );
}

export default ProjectDatasetShow;
