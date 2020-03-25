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
 *  DatasetAdd.container.js
 *  Container components for add dataset to project.
 */


import React, { useState, useEffect } from "react";
import { addDatasetToProjectSchema } from "../../model/RenkuModels";
import { ACCESS_LEVELS } from "../../api-client";
import DatasetAdd from "./DatasetAdd.present";

function AddDataset(props) {

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [submitLoaderText, setSubmitLoaderText] = useState("Please wait, dataset import will start soon.");

  const closeModal = () =>{
    if (!submitLoader) {
      addDatasetToProjectSchema.project.value = undefined;
      addDatasetToProjectSchema.project.options = [];
      props.setModalOpen(false);
    }
  };

  const redirectUserAndClearInterval = (datasets, oldDatasetsList, waitForDatasetInKG, projectPath) => {
    let new_dataset = datasets.filter(ds =>
      oldDatasetsList.find(ods => ds.identifier === ods.identifier) === undefined);
    if (new_dataset.length > 0) {
      setSubmitLoader(false);
      addDatasetToProjectSchema.project.value = undefined;
      addDatasetToProjectSchema.project.options = [];
      clearInterval(waitForDatasetInKG);
      props.history.push({
        pathname: `/projects/${projectPath}/datasets/${new_dataset[0].identifier}/`,
        state: { datasets: datasets }
      })
      ;
    }
  };

  const findDatasetInKgAnRedirect = (oldDatasetsList, projectPath) => {
    let waitForDatasetInKG = setInterval(() => {
      props.client.getProjectDatasetsFromKG(projectPath)
        .then(datasets => {
          if (datasets.length !== oldDatasetsList.length)
            redirectUserAndClearInterval(datasets, oldDatasetsList, waitForDatasetInKG, projectPath);
        });
    }, 6000);
  };

  function handleJobResponse(job, monitorJob, cont, oldDatasetsList, projectPath) {
    switch (job.state) {
      case "ENQUEUED":
        setSubmitLoaderText("Dataset import will start soon.");
        break;
      case "IN_PROGRESS":
        setSubmitLoaderText("Importing dataset.");
        break;
      case "COMPLETED":
        setSubmitLoaderText("Dataset was imported, you will be redirected soon.");
        clearInterval(monitorJob);
        findDatasetInKgAnRedirect(oldDatasetsList, projectPath);
        break;
      case "FAILED":
        setSubmitLoader(false);
        setServerErrors("Dataset import failed: " + job.extras.error);
        clearInterval(monitorJob);
        break;
      default:
        setSubmitLoader(false);
        setServerErrors("Dataset import failed, plaease try again");
        clearInterval(monitorJob);
        break;
    }
    if (cont === 100) {
      setSubmitLoader(false);
      setServerErrors("Dataset import is taking too long, please check if the dataset was imported" +
      " and if it wasn't try again.");
      clearInterval(monitorJob);
    }
  }

  const monitorJobStatusAndHandleResponse = (job_id, oldDatasetsList, projectPath) => {
    let cont = 0;
    let monitorJob = setInterval(() => {
      props.client.getJobStatus(job_id)
        .then(job => {
          cont++;
          if (job !== undefined || cont === 50)
            handleJobResponse(job, monitorJob, cont, oldDatasetsList, projectPath);
        });
    }, 10000);
  };

  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    let oldDatasetsList = [];
    const selectedProject = addDatasetToProjectSchema.project.options.find((project)=>
      project.value === addDatasetToProjectSchema.project.value);
    props.client.getProjectDatasetsFromKG(selectedProject.name)
      .then(result => {
        oldDatasetsList = result;
        props.client.datasetImport(selectedProject.value, props.dataset.url)
          .then(response => {
            if (response.data.error !== undefined) {
              setSubmitLoader(false);
              setServerErrors(response.data.error.reason);
            }
            else {
              monitorJobStatusAndHandleResponse(
                response.data.result.job_id,
                oldDatasetsList,
                selectedProject.name);
            }
          });
      });
  };


  useEffect(()=> {
    if (addDatasetToProjectSchema.project.options.length === 0) {
      props.client.getProjects({ min_access_level: ACCESS_LEVELS.MAINTAINER, order_by: "last_activity_at" })
        .then((projectResponse) => {
          const projectsDropdown = projectResponse.data.map((project) => {
            return {
              "value": project.http_url_to_repo,
              "name": project.path_with_namespace
            };
          });
          addDatasetToProjectSchema.project.value = projectsDropdown[0].value;
          addDatasetToProjectSchema.project.options = projectsDropdown;
        });
    }
  });

  return (
    <DatasetAdd
      modalOpen={props.modalOpen}
      closeModal={closeModal}
      submitCallback={submitCallback}
      serverErrors={serverErrors}
      submitLoader={submitLoader}
      submitLoaderText={submitLoaderText}
      addDatasetToProjectSchema={addDatasetToProjectSchema}
    />
  );
}

export default AddDataset;
