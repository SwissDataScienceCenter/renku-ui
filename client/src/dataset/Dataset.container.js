/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import DatasetView from "./Dataset.present";
import { useCoreSupport } from "../features/project/useProjectMigrationStatus";

export default function ShowDataset(props) {
  const [dataset, setDataset] = useState(null);
  const [datasetFiles, setDatasetFiles] = useState(null);

  const { defaultBranch, externalUrl } = useSelector(
    (state) => state.stateModel.project.metadata
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: externalUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    backendAvailable,
    computed: coreSupportComputed,
    versionUrl,
  } = coreSupport;

  const findDatasetId = (name, datasets) => {
    const dataset = datasets?.find((d) => d.name === name);
    return dataset?.identifier;
  };

  // Use Effect to calculate dataset
  useEffect(() => {
    const fetchDatasets = (id) => {
      props.datasetCoordinator.resetDataset();
      const fetchKG = props.insideProject ? props.graphStatus : true;
      props.datasetCoordinator.fetchDataset(id, props.datasets, fetchKG);
    };
    if (props.datasetCoordinator) {
      const currentDataset = props.datasetCoordinator.get("metadata");
      const datasetId = props.insideProject
        ? findDatasetId(props.datasetId, props.datasets)
        : props.identifier;
      // fetch dataset data when the need data is ready (datasets list when is insideProject)
      if (
        props.insideProject &&
        datasetId &&
        props.datasets &&
        (!currentDataset || !currentDataset?.fetching)
      )
        fetchDatasets(datasetId);
      else if (!props.insideProject && props.identifier)
        fetchDatasets(datasetId);
      else setDataset(currentDataset);
    }
  }, [
    props.datasetCoordinator,
    props.identifier,
    props.datasets,
    props.insideProject,
    props.datasetId,
    props.graphStatus,
  ]);

  // use effect to calculate files
  useEffect(() => {
    const fetchFiles = (name, httpProjectUrl, versionUrl) => {
      props.datasetCoordinator.fetchDatasetFilesFromCoreService(
        name,
        httpProjectUrl,
        versionUrl
      );
    };

    if (
      props.insideProject &&
      props.datasetCoordinator &&
      dataset?.identifier !== undefined &&
      (!datasetFiles || !datasetFiles.fetched)
    ) {
      const isFilesFetching = props.datasetCoordinator.get("files")?.fetching;
      if (
        props.insideProject &&
        coreSupportComputed &&
        backendAvailable &&
        !isFilesFetching
      ) {
        fetchFiles(dataset?.name, props.httpProjectUrl, versionUrl);
      }
    }
  }, [
    dataset,
    props.httpProjectUrl,
    props.insideProject,
    coreSupportComputed,
    backendAvailable,
    props.datasetCoordinator,
    datasetFiles,
    versionUrl,
  ]);

  const currentDataset = useSelector(
    (state) => state.stateModel.dataset?.metadata
  );
  useEffect(() => {
    const datasetId = props.insideProject
      ? findDatasetId(props.datasetId, props.datasets)
      : props.identifier;
    const currentIdentifier = currentDataset?.identifier;
    if (
      currentIdentifier === datasetId &&
      currentIdentifier !== dataset?.identifier &&
      !currentDataset.fetching
    )
      setDataset(currentDataset);
    if (currentDataset.fetchError && !currentDataset.fetching)
      setDataset(currentDataset);
  }, [currentDataset, dataset]); // eslint-disable-line

  const currentFiles = useSelector((state) => state.stateModel.dataset?.files);
  useEffect(() => {
    if (!currentDataset.fetching && !currentFiles.fetching)
      setDatasetFiles(currentFiles);
  }, [currentFiles, datasetFiles]); // eslint-disable-line

  const loadingDatasets =
    dataset === null || dataset?.fetching || !dataset?.fetched;
  return (
    <DatasetView
      client={props.client}
      dataset={dataset}
      datasets={props.datasets}
      files={datasetFiles}
      fetchError={dataset?.fetchError}
      fetchedKg={dataset?.fetched}
      fileContentUrl={props.fileContentUrl}
      history={props.history}
      httpProjectUrl={props.httpProjectUrl}
      identifier={props.identifier}
      insideProject={props.insideProject}
      lineagesUrl={props.lineagesUrl}
      loadingDatasets={loadingDatasets}
      location={props.location}
      lockStatus={props.lockStatus}
      logged={props.logged}
      maintainer={props.maintainer}
      model={props.model}
      progress={props.progress}
      projectId={props.projectId}
      projectInsideKg={props.projectInsideKg}
      projectPathWithNamespace={props.projectPathWithNamespace}
      projectsUrl={props.projectsUrl}
      versionUrl={versionUrl}
    />
  );
}
