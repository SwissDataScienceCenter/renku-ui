/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

/**
 *  incubator-renku-ui
 *
 *  DatasetImport.container.js
 *  Container components for new dataset.
 */

import React, { useState, useEffect } from "react";
import { datasetImportFormSchema } from "../../../model/RenkuModels";
import DatasetImport from "./DatasetImport.present";
import { ImportStateMessage } from "../../../utils/Dataset";

function ImportDataset(props) {

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [submitLoaderText, setSubmitLoaderText] = useState(ImportStateMessage.ENQUEUED);

  const onCancel = e => {
    props.history.push({ pathname: `/projects/${props.projectPathWithNamespace}/datasets` });
  };

  const redirectUserAndClearInterval = (datasets, oldDatasetsList, waitForDatasetInKG) => {
    let new_dataset = datasets.filter(ds =>
      oldDatasetsList.find(ods => ds.identifier === ods.identifier) === undefined);
    if (new_dataset.length > 0) {
      setSubmitLoader(false);
      clearInterval(waitForDatasetInKG);
      props.history.push({
        pathname: `/projects/${props.projectPathWithNamespace}/datasets/${new_dataset[0].identifier}/`,
        state: { datasets: datasets }
      })
      ;
    }
  };

  const findDatasetInKgAnRedirect = (oldDatasetsList) => {
    let waitForDatasetInKG = setInterval(() => {
      props.client.getProjectDatasetsFromKG_short(props.projectPathWithNamespace)
        .then(datasets => {
          if (datasets.length !== oldDatasetsList.length)
            redirectUserAndClearInterval(datasets, oldDatasetsList, waitForDatasetInKG);
        });
    }, 6000);
  };

  function handleJobResponse(job, monitorJob, cont, oldDatasetsList) {
    switch (job.state) {
      case "ENQUEUED":
        setSubmitLoaderText(ImportStateMessage.ENQUEUED);
        break;
      case "IN_PROGRESS":
        setSubmitLoaderText(ImportStateMessage.IN_PROGRESS);
        break;
      case "COMPLETED":
        setSubmitLoaderText(ImportStateMessage.COMPLETED);
        clearInterval(monitorJob);
        findDatasetInKgAnRedirect(oldDatasetsList);
        break;
      case "FAILED":
        setSubmitLoader(false);
        setServerErrors(ImportStateMessage.FAILED + job.extras.error);
        clearInterval(monitorJob);
        break;
      default:
        setSubmitLoader(false);
        setServerErrors(ImportStateMessage.FAILED_NO_INFO);
        clearInterval(monitorJob);
        break;
    }
    if (cont === 100) {
      setSubmitLoader(false);
      setServerErrors(ImportStateMessage.TOO_LONG);
      clearInterval(monitorJob);
    }
  }

  const monitorJobStatusAndHandleResponse = (job_id, oldDatasetsList) => {
    let cont = 0;
    let monitorJob = setInterval(() => {
      props.client.getJobStatus(job_id)
        .then(job => {
          cont++;
          if (job !== undefined || cont === 50)
            handleJobResponse(job, monitorJob, cont, oldDatasetsList);
        });
    }, 10000);
  };


  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    const dataset = {};
    let oldDatasetsList = [];
    dataset.uri = datasetImportFormSchema.uri.value;
    props.client.getProjectDatasetsFromKG_short(props.projectPathWithNamespace)
      .then(result => {
        oldDatasetsList = result;
        props.client.datasetImport(props.httpProjectUrl, dataset.uri)
          .then(response => {
            if (response.data.error !== undefined) {
              setSubmitLoader(false);
              setServerErrors(response.data.error.reason);
            }
            else {
              monitorJobStatusAndHandleResponse(
                response.data.result.job_id,
                oldDatasetsList);
            }
          });
      });
  };

  useEffect(()=>{
    return (()=>{
      datasetImportFormSchema.uri.value = datasetImportFormSchema.uri.initial;
    });
  }, []);

  return <DatasetImport
    submitLoader={submitLoader}
    submitLoaderText={submitLoaderText}
    serverErrors={serverErrors}
    onCancel={onCancel}
    submitCallback={submitCallback}
    datasetImportFormSchema={datasetImportFormSchema}
    accessLevel={props.accessLevel}
  />;
}


export default ImportDataset;
