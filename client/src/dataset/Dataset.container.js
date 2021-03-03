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
import { Loader } from "../utils/UIComponents";
import { mapDataset } from "./index";

export default function ShowDataset(props) {

  const [datasetKg, setDatasetKg] = useState();
  const [datasetFiles, setDatasetFiles] = useState();
  const dataset = useMemo(() =>
    mapDataset(props.datasets ?
      props.datasets.find(dataset => dataset.name === props.datasetId)
      : undefined
    , datasetKg, datasetFiles)
  , [props.datasets, datasetKg, props.datasetId, datasetFiles]);
  const [fetchError, setFetchError] = useState();

  useEffect(()=>{
    let unmounted = false;
    if (props.insideProject && datasetFiles === undefined && dataset && dataset.name) {
      props.client.fetchDatasetFilesFromCoreService(dataset.name, props.httpProjectUrl)
        .then(response =>{
          if (!unmounted && datasetFiles === undefined) {
            if (response.data.result) {
              setDatasetFiles(response.data.result.files
                .map(file => ({ name: file.name, atLocation: file.path })));
            }
            else { setDatasetFiles(response.data); }
          }
        }
        );
    }
    return () => {
      unmounted = true;
    };
  }, [props.insideProject, datasetFiles,
    dataset, props.httpProjectUrl, setDatasetFiles, props.client]);

  useEffect(() => {
    let unmounted = false;
    if (datasetKg === undefined && ((props.insideProject && dataset.identifier && props.graphStatus)
    || (props.identifier !== undefined))) {
      const id = props.insideProject ? dataset.identifier : props.identifier;
      props.client.fetchDatasetFromKG(id)
        .then((datasetInfo) => {
          if (!unmounted && datasetKg === undefined && datasetInfo !== undefined)
            setDatasetKg(datasetInfo);
        }).catch(error => {
          if (fetchError === undefined) {
            if (!unmounted && error.case === API_ERRORS.notFoundError) {
              setFetchError(props.insideProject ? "Error 404: The dataset that was selected does not exist or" +
                " could not be accessed. If you just created or imported the dataset try reloading the page."
                : "Error 404: The dataset that was selected does not exist or" +
                " could not be accessed.");
            }
            else if (!unmounted && error.case === API_ERRORS.internalServerError) {
              setFetchError("Error 500: The dataset that was selected couldn't be fetched.");
            }
          }
        });
    }
    return () => {
      unmounted = true;
    };
  }, [props.insideProject, props.datasets_kg, props.datasetId, props.identifier,
    props.client, datasetKg, fetchError, dataset, props.graphStatus]);

  if (props.insideProject && datasetFiles === undefined)
    return <Loader />;

  return <DatasetView
    maintainer={props.maintainer}
    insideProject={props.insideProject}
    identifier={props.identifier}
    progress={props.progress}
    lineagesUrl={props.lineagesUrl}
    fileContentUrl={props.fileContentUrl}
    projectsUrl={props.projectsUrl}
    client={props.client}
    datasets={props.datasets}
    history={props.history}
    logged={props.logged}
    model={props.model}
    projectId={props.projectId}
    projectPathWithNamespace={props.projectPathWithNamespace}
    dataset={dataset}
    fetchError={fetchError}
    overviewStatusUrl={props.overviewStatusUrl}
    projectInsideKg={props.projectInsideKg}
    httpProjectUrl={props.httpProjectUrl}
    location={props.location}
  />;
}
