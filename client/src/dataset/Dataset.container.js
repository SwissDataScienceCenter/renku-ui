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

import React, { useState, useMemo, useEffect } from "react";

import DatasetView from "./Dataset.present";
import { API_ERRORS } from "../api-client";
import { mapDataset } from "./index";
import { projectSchema } from "../model";

export default function ShowDataset(props) {

  const [datasetKg, setDatasetKg] = useState();
  const [datasetFiles, setDatasetFiles] = useState();
  const [fetchedKg, setFetchedKg] = useState(false);

  const dataset = useMemo(() =>
    mapDataset(props.datasets ?
      props.datasets.find(dataset => dataset.name === props.datasetId)
      : undefined
    , datasetKg, datasetFiles)
  , [props.datasets, datasetKg, props.datasetId, datasetFiles]);
  const [fetchError, setFetchError] = useState({});
  const migration = props.insideProject ?
    props.migration :
    projectSchema.createInitialized().migration;

  useEffect(() => {
    let unmounted = false;
    if (props.insideProject && datasetFiles === undefined
      && ((dataset && dataset.name) || (props.datasetId !== undefined))) {
      const name = (dataset && dataset.name) ? dataset.name : props.datasetId;
      if (migration.core.fetched && migration.core.backendAvailable) {
        const versionUrl = migration.core.versionUrl;
        props.client.fetchDatasetFilesFromCoreService(name, props.httpProjectUrl, versionUrl).then(response => {
          if (!unmounted && datasetFiles === undefined) {
            if (response.data.result) {
              setDatasetFiles(response.data.result.files
                .map(file => ({ name: file.name, atLocation: file.path })));
            }
            else {
              setDatasetFiles([]);
              if (response.data && response.data.error) {
                if (response.data.error.code === -32100)
                  setFetchError({ code: 404, message: "dataset not found or missing permissions" });
                else
                  setFetchError({ code: 0, message: "error fetching dataset files: " + response.data.error.reason });
              }
            }
          }
        });
      }
    }
    return () => {
      unmounted = true;
    };
  }, [
    dataset, datasetFiles, props.client, props.datasetId, props.httpProjectUrl, props.insideProject,
    migration.core.backendAvailable, migration.core.fetched, migration.core.versionUrl, setDatasetFiles
  ]);

  useEffect(() => {
    let unmounted = false;
    if (datasetKg === undefined && ((dataset && dataset.identifier && props.graphStatus)
      || (props.identifier !== undefined))) {
      const id = props.insideProject ? dataset.identifier : props.identifier;
      props.client.fetchDatasetFromKG(id)
        .then((datasetInfo) => {
          if (!unmounted && datasetKg === undefined && datasetInfo !== undefined) {
            setFetchedKg(true);
            setDatasetKg(datasetInfo);
          }
        }).catch(error => {
          setFetchedKg(true);
          if (!unmounted && error.case === API_ERRORS.notFoundError)
            setFetchError({ code: 404, message: "dataset not found or missing permissions" });
          else if (!unmounted && error.case === API_ERRORS.internalServerError)
            setFetchError({ code: 500, message: "cannot fetch selected dataset" });
        });
    }
    return () => {
      unmounted = true;
    };
  }, [props.insideProject, props.identifier, props.client, datasetKg, dataset, props.graphStatus]);

  return <DatasetView
    client={props.client}
    dataset={dataset}
    datasets={props.datasets}
    fetchError={fetchError}
    fetchedKg={fetchedKg}
    fileContentUrl={props.fileContentUrl}
    history={props.history}
    httpProjectUrl={props.httpProjectUrl}
    identifier={props.identifier}
    insideProject={props.insideProject}
    lineagesUrl={props.lineagesUrl}
    location={props.location}
    loadingDatasets={props.insideProject && datasetFiles === undefined}
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
