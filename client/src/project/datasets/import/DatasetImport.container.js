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

import React from "react";
import { datasetImportFormSchema } from "../../../model/RenkuModels";
import DatasetImport from "./DatasetImport.present";
import { ImportStateMessage } from "../../../utils/constants/Dataset";
import _ from "lodash";

let dsFormSchema = _.cloneDeep(datasetImportFormSchema);

function ImportDataset(props) {

  const formLocation = props.location.pathname + "/import";

  if (dsFormSchema == null)
    dsFormSchema = _.cloneDeep(datasetImportFormSchema);

  const onCancel = (e, handlers) => {
    handlers.removeDraft(props.location.pathname + "/import");
    props.history.push({ pathname: `/projects/${props.projectPathWithNamespace}/datasets` });
  };

  const redirectUser = () => {
    props.fetchDatasets(true);
    props.history.push({
      //we should do the redirect to the new dataset
      //but for this we need the dataset name in the response of the dataset.import operation :(
      pathname: `/projects/${props.projectPathWithNamespace}/datasets`
    })
    ;
  };

  function handleJobResponse(job, monitorJob, cont, handlers) {
    if (job !== null && job !== undefined) {
      switch (job.state) {
        case "ENQUEUED":
          handlers.setSubmitLoader({ value: true, text: ImportStateMessage.ENQUEUED });
          break;
        case "IN_PROGRESS":
          handlers.setSubmitLoader({ value: true, text: ImportStateMessage.IN_PROGRESS });
          break;
        case "COMPLETED":
          handlers.setSubmitLoader({ value: false, text: "" });
          clearInterval(monitorJob);
          redirectUser();
          break;
        case "FAILED":
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(ImportStateMessage.FAILED + job.extras.error);
          clearInterval(monitorJob);
          break;
        default:
          handlers.setSubmitLoader({ value: false, text: ImportStateMessage.FAILED_NO_INFO });
          handlers.setServerErrors(ImportStateMessage.FAILED_NO_INFO);
          clearInterval(monitorJob);
          break;
      }
    }
    if (cont === 100) {
      handlers.setSubmitLoader({ value: false, text: "" });
      handlers.setServerErrors(ImportStateMessage.TOO_LONG);
      clearInterval(monitorJob);
    }
  }

  const monitorJobStatusAndHandleResponse = (job_id, handlers) => {
    let cont = 0;
    let monitorJob = setInterval(() => {
      props.client.getJobStatus(job_id, props.migration.core.versionUrl)
        .then(job => {
          cont++;
          if (job !== undefined || cont === 50)
            handleJobResponse(job, monitorJob, cont, handlers);
        });
    }, 10000);
  };

  const submitCallback = (e, mappedInputs, handlers) => {
    handlers.setServerErrors(undefined);
    handlers.setServerWarnings(undefined);
    handlers.setSubmitLoader({ value: true, text: ImportStateMessage.ENQUEUED });
    props.client.datasetImport(props.httpProjectUrl, mappedInputs.uri, props.migration.core.versionUrl)
      .then(response => {
        if (response.data.error !== undefined) {
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(response.data.error.reason);
        }
        else {
          monitorJobStatusAndHandleResponse(response.data.result.job_id, handlers);
        }
      });
  };

  return <DatasetImport
    onCancel={onCancel}
    submitCallback={submitCallback}
    datasetImportFormSchema={dsFormSchema}
    accessLevel={props.accessLevel}
    formLocation={formLocation}
    notifications={props.notifications}
    model={props.model}
  />;
}


export default ImportDataset;
