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

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "reactstrap";
import _ from "lodash";

import { datasetFormSchema } from "../../../model/RenkuModels";
import DatasetChange from "./DatasetChange.present";
import { JobStatusMap } from "../../../job/Job";
import { FILE_STATUS } from "../../../utils/components/formgenerator/fields/FileUploaderInput";
import { ImageFieldPropertyName as Prop } from "../../../utils/components/formgenerator/fields/ImageInput";
import FormGenerator from "../../../utils/components/formgenerator/";
import { mapDataset } from "../../../dataset/index";
import { CoreErrorAlert } from "../../../utils/components/errors/CoreErrorAlert";
import { CoreError } from "../../../utils/components/errors/CoreErrorHelpers";


let dsFormSchema = _.cloneDeep(datasetFormSchema);

function ChangeDataset(props) {

  if (dsFormSchema == null)
    dsFormSchema = _.cloneDeep(datasetFormSchema);

  const formLocation = props.location.pathname + "change";
  const [datasetFiles, setDatasetFiles] = useState();
  const dataset = useMemo(() =>
    mapDataset(props.datasets ?
      props.datasets.find(dataset => dataset.name === props.datasetId)
      : undefined
    , undefined, datasetFiles)
  , [props.datasets, props.datasetId, datasetFiles]);
  const [initialized, setInitialized] = useState(false);
  const versionUrl = props.migration.core.versionUrl;

  const initializeFunction = (formSchema) => {
    let titleField = formSchema.find(field => field.name === "title");
    let nameField = formSchema.find(field => field.name === "name");
    let image = formSchema.find(field => field.name === "image");
    if (props.edit === false) {
      titleField.parseFun = () => {
        nameField.value = FormGenerator.Parsers.slugFromTitle(titleField.value);
        return titleField.value;
      };
      titleField.help = `${datasetFormSchema.title.help} ${datasetFormSchema.name.help}` ;
    }
    else {
      titleField.help = datasetFormSchema.title.help;
      titleField.parseFun = undefined;
      image.value = {
        options: [{ [Prop.URL]: props.dataset ? props.dataset.mediaContent : null }],
        selected: 0
      };
    }
    let fileField = formSchema.find(field => field.name === "files");

    if (!fileField.uploadFileFunction)
      fileField.uploadFileFunction = props.client.uploadFile;

    fileField.uploadThresholdSoft = props.params.UPLOAD_THRESHOLD ? props.params.UPLOAD_THRESHOLD.soft : 104857600;

    if (!fileField.notifyFunction) {
      fileField.notifyFunction = (success = true, error) => {
        const datasetName = props.edit ? "dataset " + dataset.name : "new dataset";
        const redirectUrl = props.edit ? `/projects/${props.projectPathWithNamespace}/datasets/${dataset.name}/modify`
          : `/projects/${props.projectPathWithNamespace}/datasets/new`;
        if (success) {
          props.notifications.addSuccess(props.notifications.Topics.DATASET_FILES_UPLOADED,
            `Files for the ${datasetName} in ${props.projectPathWithNamespace} finished uploading.`,
            redirectUrl,
            "Go to dataset",
            props.location.pathname
          );
        }
        else {
          const fullError = `An error occurred while uploading a file to the
          ${datasetName} in ${props.projectPathWithNamespace}.
          Error message: "${error.reason}"`;
          props.notifications.addError(
            props.notifications.Topics.DATASET_FILES_UPLOADED,
            `Unable to upload file to ${datasetName}.`,
            redirectUrl, "Try again",
            props.location.pathname,
            fullError);
        }
      };
    }
  };

  const onCancel = (e, handlers) => {
    handlers.removeDraft();
    props.history.push({ pathname: `/projects/${props.projectPathWithNamespace}/datasets` });
  };

  const goToCollaboration = (handlers) => {
    handlers.removeDraft();
    props.history.push({ pathname: `/projects/${props.projectPathWithNamespace}/collaboration/mergerequests` });
  };

  function setNewJobStatus(localJob, remoteJobsList) {
    let remoteJob = remoteJobsList.find(newJob => newJob.job_id === localJob.job_id);
    if (remoteJob !== undefined) {
      localJob.job_status = remoteJob.state;
      localJob.extras = remoteJob.extras;
    }
  }

  function checkJobsAndSetWarnings(jobsList, tooLong = false, handlers) {
    let failed = jobsList.filter(job => job.job_status === JobStatusMap.FAILED);
    let inProgress = jobsList
      .filter(job => (job.job_status === JobStatusMap.IN_PROGRESS || job.job_status === JobStatusMap.ENQUEUED) );

    if (failed.length !== 0 || inProgress.length !== 0 || tooLong === true) {
      const jobStats = { failed, inProgress, tooLong };
      handlers.setDisableAll(true);
      handlers.setSecondaryButtonText(props.edit ? "Go to dataset" : "Go to list");
      handlers.setServerWarnings(jobStats);
      handlers.setSubmitLoader({ value: false, text: "" });
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
    return props.client.getAllJobStatus(versionUrl)
      .then(response => {
        //we set the new status and then we check if they are all finished (completed or failed)
        datasetsJobsArray.map(localJob => setNewJobStatus(localJob, response.jobs));
        return getJobsStats(datasetsJobsArray);
      });
  };

  const redirectAfterSuccess = (interval, datasetId, handlers) => {
    handlers.setSubmitLoader({ value: false, text: "" });
    if (interval !== undefined) clearInterval(interval);
    props.fetchDatasets(true);
    handlers.removeDraft();
    props.history.push({
      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${datasetId}/`
    });
  };

  const redirectAfterAddFilesOnCreate = (datasetId, handlers) => {
    handlers.setSubmitLoader({ value: false, text: "" });
    props.fetchDatasets(true);
    handlers.removeDraft();
    props.history.push({
      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${datasetId}/`,
      state: { errorOnCreation: true }
    });
  };

  const getCreator = (creator)=>{
    let newCreator = { name: creator.name };
    if (creator.email)
      newCreator.email = creator.email;
    if (creator.affiliation)
      newCreator.affiliation = creator.affiliation;
    return newCreator;
  };

  const uploadDatasetImages = async (image, handlers) => {
    let images = null;
    if (image == null) return images;
    if (image.selected === -1) return images;
    if (!image.options) return images;
    if (!image.options[image.selected].FILE) return images;
    const selectedFile = image.options[image.selected];
    images = await props.client.uploadSingleFile(selectedFile.FILE, false, versionUrl)
      .then((response) => {
        if (response.data.error !== undefined) {
          const error = response.data.error;
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(error.userMessage ? error.userMessage : error.reason);
          return null;
        }
        return [{
          "file_id": response.data.result.files[0].file_id,
          "position": 0,
          "mirror_locally": true
        }];
      });
    return images;
  };

  const submitCallback = async (e, mappedInputs, handlers) => {
    handlers.setServerErrors(undefined);
    handlers.setServerWarnings(undefined);
    handlers.setDisableAll(undefined);

    const submitLoaderText = props.edit ? "Modifying dataset, please wait..." : "Creating dataset, please wait...";
    handlers.setSubmitLoader({ value: true, text: submitLoaderText });
    const dataset = {};
    dataset.name = mappedInputs.name;
    dataset.title = mappedInputs.title;
    dataset.description = mappedInputs.description;

    const pendingFiles = mappedInputs.files
      .filter(f => f.file_status === FILE_STATUS.PENDING).map(f => ({ "file_url": f.file_name }));
    dataset.files = [].concat.apply([], mappedInputs.files
      .filter(f =>
        f.file_status !== FILE_STATUS.PENDING && f.file_status !== FILE_STATUS.ADDED && f.file_id !== undefined)
      .map(f => f.file_id))
      .map(f => ({ "file_id": f }));

    dataset.files = [...dataset.files, ...pendingFiles];
    dataset.keywords = mappedInputs.keywords;
    dataset.creators = mappedInputs.creators.map(creator => getCreator(creator));

    if (mappedInputs.image.options.length && mappedInputs.image.selected) {
      const images = await uploadDatasetImages(mappedInputs.image, handlers);
      if (images)
        dataset.images = images;
    }

    props.client.postDataset(props.httpProjectUrl, dataset, props.defaultBranch, props.edit, versionUrl)
      .then(response => {
        if (response.data.error !== undefined) {
          const error = response.data.error;
          handlers.setSubmitLoader({ value: false, text: "" });
          if (error.errorOnFileAdd) {
            props.edit ?
              handlers.setServerErrors(
                <div>
                  <p>Metadata changes were successfully applied, but some files could not be updated.</p>
                  <p>{error.userMessage ? error.userMessage : error.reason}</p>
                </div>
              )
              : redirectAfterAddFilesOnCreate(dataset.name, handlers);
          }
          else {
            handlers.setServerErrors(error.userMessage ? error.userMessage : error.reason);
          }
        }
        else if (response.data.result.remote_branch !== props.defaultBranch) {
          handlers.setSubmitLoader(false);
          handlers.hideButtons(true);
          handlers.setServerWarnings(
            <div>
              <strong>This project requires use of merge requests to make changes.</strong>
              <br/><br/>
              Create a merge request to bring the changes from <strong>{response.data.result.remote_branch}</strong>
              {" "} into <strong>{props.defaultBranch}</strong> to see the dataset in your project.
              <br/><br/>
              You can do this in the {" "}
              <Button color="warning" size="sm" onClick={()=>goToCollaboration(handlers)}>
                collaboration / MR tab</Button>
            </div>
          );
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
              handlers.setSubmitLoader({ value: false, text: "" });
              redirectAfterSuccess(monitorJobs, dataset.name, handlers);
            }
            else {
              monitorURLJobsStatuses(filesURLJobsArray).then(jobsStats => {
                if (jobsStats.finished) {
                  if (jobsStats.failed.length === 0) {
                    handlers.setSubmitLoader({ value: false, text: "" });
                    redirectAfterSuccess(monitorJobs, dataset.name, handlers);
                  }
                  else {
                    //some or all failed, but all finished
                    checkJobsAndSetWarnings(filesURLJobsArray, false, handlers);
                    clearInterval(monitorJobs);
                  }
                }
              });
            }

            if (cont >= 20) {
              handlers.setSubmitLoader({ value: false, text: "" });
              checkJobsAndSetWarnings(filesURLJobsArray, true, handlers);
              clearInterval(monitorJobs);
            }
            cont++;
          }, INTERVAL);
        }
      });
  };

  useEffect(() => {
    let unmounted = false;
    if (props.edit) {
      if (!initialized && dataset !== undefined) {
        props.client.fetchDatasetFilesFromCoreService(dataset.name, props.httpProjectUrl, versionUrl)
          .then(response => {
            if (!unmounted && datasetFiles === undefined) {
              if (response.data.result) {
                dsFormSchema.files.uploadFileFunction = props.client.uploadFile;
                dsFormSchema.name.value = dataset.name;
                dsFormSchema.title.value = dataset.title;
                dsFormSchema.description.value = dataset.description;
                dsFormSchema.creators.value = dataset.published.creator.map(
                  creator => creator.email === props.user.data.email ?
                    {
                      name: creator.name,
                      email: creator.email,
                      affiliation: creator.organization,
                      default: true
                    }
                    : creator);
                if (dsFormSchema.creators.value.find(creator =>
                  creator.email === props.user.data.email) === undefined) {
                  dsFormSchema.creators.value.push({
                    name: props.user.data.name,
                    email: props.user.data.email,
                    affiliation: props.user.data.organization,
                    default: true
                  });
                }
                dsFormSchema.keywords.value = dataset.keywords;
                dsFormSchema.files.value = response.data.result.files
                  .map(file => ({ name: file.name, atLocation: file.path, file_status: "added" }));
                setInitialized(true);
              }
              else {
                setDatasetFiles(response.data);
              }
            }
          });
      }
    }
    else {
      setInitialized(true);
      dsFormSchema.name.value = dsFormSchema.name.value === undefined
        ? dsFormSchema.name.initial : dsFormSchema.name.value;
      dsFormSchema.title.value = dsFormSchema.title.initial;
      dsFormSchema.description.value = dsFormSchema.description.initial;
      dsFormSchema.files.value = dsFormSchema.files.initial;
      dsFormSchema.creators.value = [
        {
          name: props.user.data.name,
          email: props.user.data.email,
          affiliation: props.user.data.organization,
          default: true
        }
      ];
      dsFormSchema.keywords.value = dsFormSchema.keywords.initial;
      dsFormSchema.image.optional = true;
    }
  }, [props, initialized, dataset, datasetFiles, versionUrl, setDatasetFiles, props.client]);

  if (CoreError.isValid(datasetFiles?.error))
    return (<CoreErrorAlert error={datasetFiles.error} />);

  return <DatasetChange
    accessLevel={props.accessLevel}
    datasetFormSchema={dsFormSchema}
    edit={props.edit}
    formLocation={formLocation}
    initializeFunction={initializeFunction}
    initialized={initialized}
    model={props.model}
    onCancel={onCancel}
    overviewCommitsUrl={props.overviewCommitsUrl}
    submitCallback={submitCallback}
    versionUrl={versionUrl}
    toggleNewDataset={props.toggleNewDataset}
  />;
}
export default ChangeDataset;
