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

import DatasetView from "./Dataset.present";
import { projectSchema } from "../model";

export default function ShowDataset(props) {

  const [dataset, setDataset] = useState(null);
  const [datasetFiles, setDatasetFiles] = useState(null);

  const migration = props.insideProject ?
    props.migration :
    projectSchema.createInitialized().migration;

  // Use Effect to calculate dataset
  useEffect(() => {
    const fetchDatasets = async (id) => {
      props.datasetCoordinator.resetDataset();
      const fetchKG = props.insideProject ? props.graphStatus : true;
      await props.datasetCoordinator.fetchDataset(id, props.datasets, fetchKG);
      let currentFiles = props.datasetCoordinator.get("files");
      let currentDataset = props.datasetCoordinator.get("metadata");
      if (currentFiles && currentFiles?.hasPart)
        setDatasetFiles(currentFiles);
      setDataset(currentDataset);
    };

    const findDatasetId = (name, datasets) => {
      const dataset = datasets?.find((d) => d.name === name);
      return dataset?.identifier;
    };

    if (props.datasetCoordinator) {
      const currentDataset = props.datasetCoordinator.get("metadata");
      const datasetId = props.insideProject ? findDatasetId(props.datasetId, props.datasets) : props.identifier;
      // fetch dataset data when the need data is ready (datasets list when is insideProject)
      if (props.insideProject && datasetId && props.datasets && (!currentDataset || !currentDataset?.fetching))
        fetchDatasets(datasetId);
      else if (!props.insideProject && props.identifier)
        fetchDatasets(datasetId);
      else
        setDataset(currentDataset);
    }
  }, [
    props.datasetCoordinator,
    props.identifier,
    props.datasets,
    props.insideProject,
    props.datasetId,
    props.graphStatus ]);


  // use effect to calculate files
  useEffect(() => {
    const fetchFiles = async (name, httpProjectUrl, versionUrl) => {
      await props.datasetCoordinator.fetchDatasetFilesFromCoreService(name, httpProjectUrl, versionUrl);
      const files = props.datasetCoordinator.get("files");
      setDatasetFiles(files);
    };

    if (props.insideProject && props.datasetCoordinator && dataset?.identifier !== undefined && !datasetFiles) {
      const isFilesFetching = props.datasetCoordinator.get("files")?.fetching;

      if (migration.core.fetched && migration.core.backendAvailable && !isFilesFetching) {
        const versionUrl = migration.core.versionUrl;
        fetchFiles(dataset?.name, props.httpProjectUrl, versionUrl);
      }
    }
  },
  [
    dataset, props.httpProjectUrl, props.insideProject, migration.core.backendAvailable,
    migration.core.fetched, migration.core.versionUrl, props.datasetCoordinator, datasetFiles]
  );

  const loadingDatasets = dataset === null || dataset?.fetching || !dataset?.fetched;

  return <DatasetView
    client={props.client}
    dataset={dataset}
    files={datasetFiles}
    datasets={props.datasets}
    fetchError={dataset?.fetchError}
    fetchedKg={dataset?.fetched}
    fileContentUrl={props.fileContentUrl}
    history={props.history}
    httpProjectUrl={props.httpProjectUrl}
    identifier={props.identifier}
    insideProject={props.insideProject}
    lineagesUrl={props.lineagesUrl}
    location={props.location}
    loadingDatasets={loadingDatasets}
    logged={props.logged}
    maintainer={props.maintainer}
    migration={migration}
    model={props.model}
    overviewStatusUrl={props.overviewStatusUrl}
    progress={props.progress}
    projectId={props.projectId}
    projectInsideKg={props.projectInsideKg}
    projectPathWithNamespace={props.projectPathWithNamespace}
    projectsUrl={props.projectsUrl}
  />;
}
