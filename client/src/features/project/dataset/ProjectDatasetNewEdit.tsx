import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../../api-client";
import ChangeDataset from "../../../project/datasets/change";
import { Url } from "../../../utils/helpers/url";

import type { StateModelProject } from "../Project";

type ChangeDatasetProps = {
  client: unknown;
  edit: boolean;
  fetchDatasets: unknown;
  history: unknown;
  location: unknown;
  model: unknown;
  notifications: unknown;
  params: unknown;
};

type ProjectDatasetNewOnlyProps = {
  toggleNewDataset: unknown;
};

type ProjectDatasetEditOnlyProps = {
  dataset?: string;
  datasetId: string;
};

type ProjectDatasetNewEditProps = ChangeDatasetProps &
  Partial<ProjectDatasetNewOnlyProps> &
  Partial<ProjectDatasetEditOnlyProps>;
function ProjectDatasetNewEdit(props: ProjectDatasetNewEditProps) {
  const project = useSelector((state: RootStateOrAny) => state.stateModel.project as StateModelProject);
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const datasets = project.datasets.core.datasets;
  const httpProjectUrl = projectMetadata.httpUrl;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const migration = project.migration;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;
  const projectId = projectMetadata.id;

  const forkedData = project.forkedFromProject;
  const forked = forkedData != null && Object.keys(forkedData).length > 0 ? true : false;

  const graphProgress = project.webhook.progress;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = { namespace: projectNamespace, path: projectPath, target: "" };
  const fileContentUrl = Url.get(Url.pages.project.file, projectUrlProps);
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const overviewCommitsUrl = Url.get(Url.pages.project.overview.commits, projectUrlProps);
  const projectsUrl = Url.get(Url.pages.projects);

  return (
    <ChangeDataset
      accessLevel={accessLevel}
      client={props.client}
      dataset={props.dataset}
      datasetId={props.datasetId}
      datasets={datasets}
      defaultBranch={projectMetadata.defaultBranch}
      edit={props.edit}
      fetchDatasets={props.fetchDatasets}
      fileContentUrl={fileContentUrl}
      forked={forked}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      lineagesUrl={lineagesUrl}
      location={props.location}
      maintainer={maintainer}
      migration={migration}
      model={props.model}
      notifications={props.notifications}
      overviewCommitsUrl={overviewCommitsUrl}
      params={props.params}
      progress={graphProgress}
      projectId={projectId}
      projectPathWithNamespace={projectPathWithNamespace}
      projectsUrl={projectsUrl}
      toggleNewDataset={props.toggleNewDataset}
      user={user}
    />
  );
}

function ProjectDatasetNew(props: Omit<ChangeDatasetProps, "edit"> & ProjectDatasetNewOnlyProps) {
  return (
    <ProjectDatasetNewEdit
      key="datasetCreate"
      client={props.client}
      edit={false}
      fetchDatasets={props.fetchDatasets}
      history={props.history}
      location={props.location}
      model={props.model}
      notifications={props.notifications}
      params={props.params}
      toggleNewDataset={props.toggleNewDataset}
    />
  );
}

function ProjectDatasetEdit(props: Omit<ChangeDatasetProps, "edit"> & ProjectDatasetEditOnlyProps) {
  return (
    <ProjectDatasetNewEdit
      key="datasetModify"
      client={props.client}
      dataset={props.dataset}
      datasetId={props.datasetId}
      edit={true}
      fetchDatasets={props.fetchDatasets}
      history={props.history}
      location={props.location}
      model={props.model}
      notifications={props.notifications}
      params={props.params}
    />
  );
}

export { ProjectDatasetEdit, ProjectDatasetNew };
