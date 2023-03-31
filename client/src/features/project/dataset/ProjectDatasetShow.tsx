import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../../api-client";
import DatasetView from "../../../dataset/Dataset.present";
import { Url } from "../../../utils/helpers/url";

import type { IDataset, IDatasetFiles, IMigration, StateModelProject } from "../Project.d";

type IDatasetCoordinator = {
  fetchDataset: (id: string, datasets: IDataset[], fetchKG: boolean) => void;
  fetchDatasetFilesFromCoreService: (id: string, httpProjectUrl: string, versionUrl: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string): any;
}

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
  datasets: IDataset[];
  datasetId: string;
  fileContentUrl: string;
  graphStatus: boolean;
  history: unknown;
  httpProjectUrl: string;
  lineagesUrl: string;
  location: unknown;
  lockStatus: unknown;
  logged: unknown;
  maintainer: boolean;
  migration: IMigration;
  model: unknown;
  overviewStatusUrl: string;
  projectId: string;
  projectInsideKg: boolean;
  projectPathWithNamespace: string;
  projectsUrl: string;
}

function findDataset(name: string, datasets: IDataset[]) {
  return datasets.find((d) => d.name === name);
}

function findDatasetId(name: string, datasets: IDataset[]) {
  const dataset = findDataset(name, datasets);
  return dataset?.identifier;
}

function ProjectDatasetView(props: ProjectDatasetViewProps) {

  const [dataset, setDataset] = React.useState<IDataset|undefined>(undefined);
  const [datasetFiles, setDatasetFiles] = React.useState<IDatasetFiles|undefined>(undefined);

  const migration = props.migration;

  // Use Effect to calculate dataset
  React.useEffect(() => {
    const fetchDatasets = (id: string) => {
      const fetchKG = props.graphStatus;
      props.datasetCoordinator.fetchDataset(id, props.datasets, fetchKG);
    };
    if (props.datasetCoordinator) {
      const currentDataset = props.datasetCoordinator.get("metadata");
      const datasetId = findDatasetId(props.datasetId, props.datasets);
      // fetch dataset data when the need data is ready (datasets list when is insideProject)
      if (datasetId && props.datasets && (!currentDataset || !currentDataset?.fetching))
        fetchDatasets(datasetId);
      else
        setDataset(currentDataset);
    }
  }, [
    props.datasetCoordinator,
    props.datasets,
    props.datasetId,
    props.graphStatus ]);


  // use effect to calculate files
  React.useEffect(() => {
    const fetchFiles = (name: string, httpProjectUrl: string, versionUrl: string) => {
      props.datasetCoordinator.fetchDatasetFilesFromCoreService(name, httpProjectUrl, versionUrl);
    };

    if (props.datasetCoordinator && dataset?.identifier !== undefined &&
      (!datasetFiles || !datasetFiles.fetched)) {
      const isFilesFetching = props.datasetCoordinator.get("files")?.fetching;
      if (migration.core.fetched && migration.core.backendAvailable && !isFilesFetching) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const versionUrl = migration.core.versionUrl!;
        fetchFiles(dataset?.name, props.httpProjectUrl, versionUrl);
      }
    }
  }, [
    dataset, props.httpProjectUrl, migration.core.backendAvailable, migration.core.fetched,
    migration.core.versionUrl, props.datasetCoordinator, datasetFiles
  ]);

  const currentDataset = useSelector((state: RootStateOrAny) => state.stateModel.dataset?.metadata);
  React.useEffect(() => {
    const datasetId = findDatasetId(props.datasetId, props.datasets);
    const currentIdentifier = currentDataset?.identifier;
    if (currentIdentifier === datasetId && currentIdentifier !== dataset?.identifier && !currentDataset.fetching)
      setDataset(currentDataset);
    if (currentDataset.fetchError && !currentDataset.fetching)
      setDataset(currentDataset);
  }, [ currentDataset, dataset, props.datasetId, props.datasets ]);

  const currentFiles = useSelector((state: RootStateOrAny) => state.stateModel.dataset?.files);
  React.useEffect(() => {
    if (!currentDataset.fetching && !currentFiles.fetching)
      setDatasetFiles(currentFiles);
  }, [ currentDataset.fetching, currentFiles, datasetFiles ]);


  const loadingDatasets = dataset == null || dataset?.fetching || !dataset?.fetched;
  return <DatasetView
    client={undefined}
    dataset={dataset}
    files={datasetFiles}
    datasets={props.datasets}
    fetchError={undefined}
    fetchedKg={undefined}
    fileContentUrl={props.fileContentUrl}
    history={props.history}
    httpProjectUrl={props.httpProjectUrl}
    identifier={undefined}
    insideProject={true}
    lineagesUrl={props.lineagesUrl}
    loadingDatasets={loadingDatasets}
    location={props.location}
    lockStatus={props.lockStatus}
    logged={props.logged}
    maintainer={props.maintainer}
    migration={migration}
    model={props.model}
    overviewStatusUrl={props.overviewStatusUrl}
    progress={undefined}
    projectId={props.projectId}
    projectInsideKg={props.projectInsideKg}
    projectPathWithNamespace={props.projectPathWithNamespace}
    projectsUrl={props.projectsUrl}
  />;
}

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
  if (props.datasetCoordinator == null) return null;
  return (
    <ProjectDatasetView
      key="datasetPreview"
      datasets={datasets as IDataset[]}
      datasetCoordinator={props.datasetCoordinator as IDatasetCoordinator}
      datasetId={props.datasetId}
      fileContentUrl={fileContentUrl}
      graphStatus={props.graphStatus}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      lineagesUrl={lineagesUrl}
      location={props.location}
      lockStatus={lockStatus}
      logged={user.logged}
      maintainer={maintainer}
      migration={migration as IMigration}
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
