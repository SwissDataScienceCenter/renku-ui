/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  DatasetNew.container.js
 *  Container components for new dataset.
 */

import React, { useState, useRef, useEffect } from "react";
import { datasetFormSchema } from "../../../model/RenkuModels";
import DatasetNew from "./DatasetNew.present";
import { JobStatusMap } from "../../../job/Job";
import { FILE_STATUS } from "../../../utils/formgenerator/fields/FileUploaderInput";

function NewDataset(props) {


  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [jobsStats, setJobsStats] = useState(undefined);
  const warningOn = useRef(false);
  datasetFormSchema.files.uploadFileFunction = props.client.uploadFile;
  datasetFormSchema.files.filesOnUploader = useRef(0);

  const onCancel = e => {
    props.history.push({ pathname: `/projects/${props.projectPathWithNamespace}/datasets` });
  };

  function setNewJobStatus(localJob, remoteJobsList) {
    let remoteJob = remoteJobsList.find(newJob => newJob.job_id === localJob.job_id);
    if (remoteJob !== undefined) {
      localJob.job_status = remoteJob.state;
      localJob.extras = remoteJob.extras;
    }
  }

  function checkJobsAndSetWarnings(jobsList, tooLong = false) {
    let failed = jobsList.filter(job => job.job_status === JobStatusMap.FAILED );
    let inProgress = jobsList
      .filter(job => (job.job_status === JobStatusMap.IN_PROGRESS || job.job_status === JobStatusMap.ENQUEUED) );

    if (failed.length !== 0 || inProgress.length !== 0 || tooLong === true) {
      setJobsStats({ failed, inProgress, tooLong });
      warningOn.current = true;
      setSubmitLoader(false);
    }
  }

  function getJobsStats(jobsList) {
    const failed = jobsList.filter(job => job.job_status === JobStatusMap.FAILED);
    const completed = jobsList.filter(job => job.job_status === JobStatusMap.COMPLETED);
    const inProgress = jobsList.filter(job =>
      (job.job_status === JobStatusMap.IN_PROGRESS || job.job_status === JobStatusMap.ENQUEUED));
    return { failed, completed, inProgress, finished: inProgress.length === 0 };
  }

  const monitorURLJobsStatuses = (datasetsJobsArray) => {
    return props.client.getAllJobStatus()
      .then(response => {
        //we set the new status and then we check if they are all finsihed (completed or failed)
        datasetsJobsArray.map(localJob => setNewJobStatus(localJob, response.jobs));
        return getJobsStats(datasetsJobsArray);
      });
  };

  const monitorFilesInKgAndRedirect = (dataset, interval, datasetId) => {
    props.client.fetchDatasetFromKG(props.client.baseUrl.replace(
      "api", "knowledge-graph/datasets/") + datasetId)
      .then(response => {
        return response.hasPart.length >= dataset.files.length;
      }).then( filesInKg => {
        if (filesInKg)
          redirectAfterSuccess(interval, datasetId);

      });
  };

  const redirectAfterSuccess = (interval, datasetId) => {
    setSubmitLoader(false);
    if (interval !== undefined) clearInterval(interval);
    props.history.push({
      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${datasetId}/`
    });
  };


  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    const dataset = {};
    dataset.name = datasetFormSchema.name.value;
    dataset.description = datasetFormSchema.description.value;

    const pendingFiles = datasetFormSchema.files.value
      .filter(f => f.file_status === FILE_STATUS.PENDING).map(f => ({ "file_url": f.file_name }));
    dataset.files = [].concat.apply([], datasetFormSchema.files.value
      .filter(f => f.file_status !== FILE_STATUS.PENDING)
      .map(f => f.file_id)).map(f => ({ "file_id": f }));

    dataset.files = [...dataset.files, ...pendingFiles];

    props.client.postDataset(props.httpProjectUrl, dataset)
      .then(response => {
        if (response.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(response.data.error.reason);
        }
        else {
          let datasetInKg = false;
          let filesURLJobsArray = [];

          if (response.data.result.files) {
            response.data.result.files.map(file => {
              if (file.job_id !== undefined)
                filesURLJobsArray.push({ job_id: file.job_id, file_url: file.file_url, job_status: null });
              return file;
            });
          }

          let cont = 0;
          const INTERVAL = 6000;
          let datasetId;

          let monitorKGandJobs = setInterval(() => {
            if (!datasetInKg) {
              props.client.getProjectDatasetsFromKG_short(props.projectPathWithNamespace)
                .then(datasets => {
                // eslint-disable-next-line
                  let new_dataset = datasets.find( ds => ds.name === response.data.result.short_name);
                  if (new_dataset !== undefined) {
                    datasetInKg = true;
                    datasetId = new_dataset.identifier;
                  }

                  if (cont >= 20) {
                    checkJobsAndSetWarnings([], true);
                    clearInterval(monitorKGandJobs);
                  }
                });
            }
            else {
              if (filesURLJobsArray.length === 0) {
                monitorFilesInKgAndRedirect(dataset, monitorKGandJobs, datasetId);
              }
              else {
                monitorURLJobsStatuses(filesURLJobsArray).then(jobsStats => {
                  if (jobsStats.finished) {
                    if (jobsStats.failed.length === 0) {
                      monitorFilesInKgAndRedirect(dataset, monitorKGandJobs, datasetId);
                    }
                    else {
                    //some or all failed, but all finished
                      checkJobsAndSetWarnings(filesURLJobsArray, false);
                      clearInterval(monitorKGandJobs);
                    }
                  }
                });
              }

              if (cont >= 20) {
                checkJobsAndSetWarnings(filesURLJobsArray, true);
                clearInterval(monitorKGandJobs);
              }
            }
            cont++;
          }, INTERVAL);
        }
      });
  };

  useEffect(()=>{
    return () => {
      datasetFormSchema.name.value = datasetFormSchema.name.initial;
      datasetFormSchema.description.value = datasetFormSchema.description.initial;
      datasetFormSchema.files.value = datasetFormSchema.files.initial;
    };
  }, []);

  return <DatasetNew
    datasetFormSchema={datasetFormSchema}
    accessLevel={props.accessLevel}
    serverErrors={serverErrors}
    submitCallback={submitCallback}
    submitLoader={submitLoader}
    onCancel={onCancel}
    warningOn={warningOn}
    jobsStats={jobsStats}
  />;
}


export default NewDataset;
