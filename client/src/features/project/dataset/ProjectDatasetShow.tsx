/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../../api-client";
import DatasetView from "../../../dataset/Dataset.present";
import AppContext from "../../../utils/context/appContext";
import { Url } from "../../../utils/helpers/url";
import type {
  DatasetCore,
  DatasetKg,
  IDataset,
  StateModelProject,
} from "../Project";
import { useGetDatasetFilesQuery } from "../projectCoreApi";
import { useGetDatasetKgQuery } from "../projectKg.api";
import { useCoreSupport } from "../useProjectCoreSupport";

type IDatasetCoordinator = {
  fetchDataset: (id: string, datasets: DatasetCore[], fetchKG: boolean) => void;
  fetchDatasetFilesFromCoreService: (
    id: string,
    httpProjectUrl: string,
    versionUrl: string,
    branch: string
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string): any;
};

type ProjectDatasetShowProps = {
  datasetCoordinator: unknown;
  datasetId: string;
  graphStatus: boolean;
  history: unknown;
  location: unknown;
  model: unknown;
  projectInsideKg: boolean;
};

type ProjectDatasetViewProps = {
  datasetCoordinator: IDatasetCoordinator;
  datasets: DatasetCore[] | undefined;
  datasetId: string;
  externalUrl: string;
  fileContentUrl: string;
  graphStatus: boolean;
  history: unknown;
  httpProjectUrl: string;
  lineagesUrl: string;
  location: unknown;
  lockStatus: unknown;
  logged: unknown;
  maintainer: boolean;
  model: unknown;
  projectId: string;
  projectInsideKg: boolean;
  projectPathWithNamespace: string;
  projectsUrl: string;
};

function findDataset(
  slug: string | undefined,
  datasets: DatasetCore[] | undefined
) {
  if (slug == null || datasets == null) return undefined;
  return datasets.find((d) => d.slug === slug);
}

function findDatasetId(
  slug: string | undefined,
  datasets: DatasetCore[] | undefined
) {
  if (slug == null || datasets == null) return undefined;
  const dataset = findDataset(slug, datasets);
  return dataset?.identifier;
}

function mergeCoreAndKgDatasets(
  coreDataset?: DatasetCore,
  kgDataset?: DatasetKg
) {
  if (coreDataset == null) {
    if (kgDataset == null) return undefined;
    const dataset: IDataset = { exists: true, insideKg: true, ...kgDataset };
    return dataset;
  }

  const dataset: IDataset = {
    created: coreDataset.created_at,
    exists: true,
    insideKg: kgDataset != null,
    ...coreDataset,
  };
  dataset.published = {
    creator: coreDataset.creators,
  };
  if (kgDataset) {
    dataset.name = kgDataset.name;
    dataset.slug = kgDataset.slug;
    dataset.url = kgDataset.url;
    dataset.sameAs = kgDataset.sameAs;
    dataset.usedIn = kgDataset.usedIn;
    dataset.published.datePublished =
      kgDataset.published && kgDataset.published.datePublished
        ? kgDataset.published.datePublished
        : undefined;
  }
  return dataset;
}

function ProjectDatasetView(props: ProjectDatasetViewProps) {
  const { client } = React.useContext(AppContext);
  const coreDataset = findDataset(props.datasetId, props.datasets);
  const datasetId = findDatasetId(props.datasetId, props.datasets);

  const { defaultBranch, externalUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: externalUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { apiVersion, metadataVersion, versionUrl } = coreSupport;

  const {
    data: kgDataset,
    error: kgFetchError,
    isFetching: isKgFetching,
  } = useGetDatasetKgQuery({ id: datasetId ?? "" }, { skip: !datasetId });
  const currentDataset = mergeCoreAndKgDatasets(coreDataset, kgDataset);
  const datasetSlug = currentDataset?.slug;
  const {
    data: datasetFiles,
    error: filesFetchError,
    isFetching: isFilesFetching,
  } = useGetDatasetFilesQuery(
    {
      apiVersion,
      git_url: props.externalUrl,
      slug: datasetSlug ?? "",
      metadataVersion,
      branch: defaultBranch,
    },
    { skip: !datasetSlug }
  );

  const loadingDatasets =
    currentDataset == null ||
    currentDataset.identifier !== datasetId ||
    isKgFetching;
  return (
    <DatasetView
      apiVersion={apiVersion}
      client={client}
      dataset={currentDataset}
      datasets={props.datasets}
      externalUrl={props.externalUrl}
      files={datasetFiles}
      isFilesFetching={isFilesFetching}
      filesFetchError={filesFetchError}
      fetchError={kgFetchError}
      fetchedKg={kgDataset != null}
      fileContentUrl={props.fileContentUrl}
      history={props.history}
      httpProjectUrl={props.httpProjectUrl}
      identifier={datasetId}
      insideProject={true}
      lineagesUrl={props.lineagesUrl}
      loadingDatasets={loadingDatasets}
      location={props.location}
      lockStatus={props.lockStatus}
      logged={props.logged}
      maintainer={props.maintainer}
      metadataVersion={metadataVersion}
      model={props.model}
      projectId={props.projectId}
      projectInsideKg={props.projectInsideKg}
      projectPathWithNamespace={props.projectPathWithNamespace}
      projectsUrl={props.projectsUrl}
      versionUrl={versionUrl}
    />
  );
}

function ProjectDatasetShow(props: ProjectDatasetShowProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const datasets = project.datasets.core.datasets;
  const httpProjectUrl = projectMetadata.httpUrl;
  const lockStatus = project.lockStatus;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;
  const projectId = projectMetadata.id;

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
  const projectsUrl = Url.get(Url.pages.projects);
  if (props.datasetCoordinator == null) return null;
  return (
    <ProjectDatasetView
      key="datasetPreview"
      datasets={datasets as DatasetCore[] | undefined}
      datasetCoordinator={props.datasetCoordinator as IDatasetCoordinator}
      datasetId={props.datasetId}
      externalUrl={projectMetadata.externalUrl}
      fileContentUrl={fileContentUrl}
      graphStatus={props.graphStatus}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      lineagesUrl={lineagesUrl}
      location={props.location}
      lockStatus={lockStatus}
      logged={user.logged}
      maintainer={maintainer}
      model={props.model}
      projectId={projectId}
      projectInsideKg={props.projectInsideKg}
      projectPathWithNamespace={projectPathWithNamespace}
      projectsUrl={projectsUrl}
    />
  );
}

export default ProjectDatasetShow;
