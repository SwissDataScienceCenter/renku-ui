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
 *  DatasetEdit.container.js
 *  Container components for editing dataset.
 */

import React, { useState, useRef, useEffect } from "react";
import { datasetFormSchema } from "../../../model/RenkuModels";
import DatasetEdit from "./DatasetEdit.present";
import { JobStatusMap } from "../../../job/Job";
import { FILE_STATUS } from "../../../utils/formgenerator/fields/FileUploaderInput";

function EditDataset(props) {

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [initialized, setInitialized] = useState(false);
  // const [initalFiles, setInitialFiles] = useState([]);
  const [jobsStats, setJobsStats] = useState(undefined);
  const warningOn = useRef(false);
  datasetFormSchema.files.uploadFileFunction = props.client.uploadFile;
  datasetFormSchema.files.filesOnUploader = useRef(0);
  // datasetFormSchema.title.parseFun = () => {
  //   datasetFormSchema.name.value = FormGenerator.Parsers.slugFromTitle(datasetFormSchema.title.value);
  //   return datasetFormSchema.title.value;
  // };

  const onCancel = e => {
    datasetFormSchema.name.value = datasetFormSchema.name.initial;
    datasetFormSchema.title.value = datasetFormSchema.title.initial;
    datasetFormSchema.description.value = datasetFormSchema.description.initial;
    datasetFormSchema.files.value = datasetFormSchema.files.initial;
    props.history.push({
      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${props.dataset.identifier}/`
    });
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

    if (failed.length !== 0 || inProgress.length !== 0 || tooLong) {
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

  const redirectAfterSuccess = (interval, datasetName) => {
    setSubmitLoader(false);
    datasetFormSchema.name.value = datasetFormSchema.name.initial;
    datasetFormSchema.title.value = datasetFormSchema.title.initial;
    datasetFormSchema.description.value = datasetFormSchema.description.initial;
    datasetFormSchema.files.value = datasetFormSchema.files.initial;
    if (interval !== undefined) clearInterval(interval);
    props.fetchDatasets(true);
    props.history.push({
      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${datasetName}/`
    });
  };

  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    const dataset = {};
    dataset.name = datasetFormSchema.name.value;
    dataset.title = datasetFormSchema.title.value;
    dataset.description = datasetFormSchema.description.value;

    const pendingFiles = datasetFormSchema.files.value
      .filter(f => f.file_status === FILE_STATUS.PENDING).map(f => ({ "file_url": f.file_name }));
    dataset.files = [].concat.apply([], datasetFormSchema.files.value
      .filter(f => f.file_status !== FILE_STATUS.PENDING)
      .map(f => f.file_id)).map(f => ({ "file_id": f }));

    dataset.files = [...dataset.files, ...pendingFiles];
    dataset.keywords = datasetFormSchema.keywords.value;
    dataset.creators = datasetFormSchema.creators.value
      .map(creator => ({ name: creator.name, email: creator.email }));

    props.client.postDataset(props.httpProjectUrl, dataset, true)
      .then(response => {
        if (response.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(response.data.error.reason);
          //what do we do on file upload error
          // if (response.data.error.reason.files !== undefined)
          //   setServerErrors("Error adding file(s) to dataset.");
          // else
          //   setServerErrors(response.data.error.reason);
        }
        else {
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

          let monitorJobs = setInterval(() => {
            if (filesURLJobsArray.length === 0) {
              redirectAfterSuccess(monitorJobs, dataset.name);
            }
            else {
              monitorURLJobsStatuses(filesURLJobsArray).then(jobsStats => {
                if (jobsStats.finished) {
                  if (jobsStats.failed.length === 0) {
                    redirectAfterSuccess(monitorJobs, dataset.name);
                  }
                  else {
                    //some or all failed, but all finished
                    checkJobsAndSetWarnings(filesURLJobsArray, false);
                    clearInterval(monitorJobs);
                  }
                }
              });
            }
            if (cont >= 20) {
              checkJobsAndSetWarnings(filesURLJobsArray, true);
              clearInterval(monitorJobs);
            }
            cont++;
          }, INTERVAL);
        }
      });
  };

  useEffect(() => {
    if (!initialized) {
      datasetFormSchema.files.uploadFileFunction = props.client.uploadFile;
      if (props.dataset === null) {
        props.client.fetchDatasetFromKG(props.client.baseUrl.replace(
          "api", "knowledge-graph/datasets/") + props.datasetId)
          .then((dataset) => {
            console.log(dataset);
            datasetFormSchema.name.value = dataset.name;
            datasetFormSchema.title.value = dataset.title;
            datasetFormSchema.description.value = dataset.description;
            datasetFormSchema.files.value = dataset.hasPart;
            datasetFormSchema.creators.value = dataset.published.creator;
            // setInitialFiles(dataset.hasPart);
            setInitialized(true);
          });
      }
      else {
        datasetFormSchema.name.value = props.dataset.name;
        datasetFormSchema.title.value = props.dataset.title;
        datasetFormSchema.description.value = props.dataset.description;
        datasetFormSchema.files.value = props.dataset.hasPart;
        datasetFormSchema.creators.value = props.dataset.published.creator;
        // setInitialFiles(props.dataset.hasPart);
        setInitialized(true);
      }
    }
  }, [props, initialized]);

  return <DatasetEdit
    initialized={initialized}
    datasetFormSchema={datasetFormSchema}
    accessLevel={props.accessLevel}
    serverErrors={serverErrors}
    submitCallback={submitCallback}
    submitLoader={submitLoader}
    onCancel={onCancel}
    overviewCommitsUrl={props.overviewCommitsUrl}
    warningOn={warningOn}
    jobsStats={jobsStats}
  />;
}


export default EditDataset;
