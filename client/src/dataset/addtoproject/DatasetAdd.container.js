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


import React, { useState } from "react";
import { addDatasetToProjectSchema } from "../../model/RenkuModels";
import { ACCESS_LEVELS } from "../../api-client";
import DatasetAdd from "./DatasetAdd.present";
import { ImportStateMessage } from "../../utils/Dataset";
import { groupBy } from "../../utils/HelperFunctions";

function AddDataset(props) {

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [submitLoaderText, setSubmitLoaderText] = useState(ImportStateMessage.ENQUEUED);
  const [takingTooLong, setTakingTooLong] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  const closeModal = () =>{
    if (!submitLoader) {
      addDatasetToProjectSchema.project.value = "";
      addDatasetToProjectSchema.project.options = [];
      setServerErrors(undefined);
      setTakingTooLong(false);
      props.setModalOpen(false);
      setMigrationNeeded(false);
    }
  };

  const redirectUser = (projectPath, datasetName) => {
    setSubmitLoader(false);
    addDatasetToProjectSchema.project.value = "";
    addDatasetToProjectSchema.project.options = [];
    props.history.push({
      pathname: `/projects/${projectPath}/datasets/${datasetName}`,
      state: { reload: true }
    });
  };

  function handleJobResponse(job, monitorJob, waitedSeconds, projectPath, datasetName) {
    if (job) {
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
          redirectUser(projectPath, datasetName);
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
    }
    if ((waitedSeconds > 180 && job.state !== "IN_PROGRESS") || (waitedSeconds > 360 && job.state === "IN_PROGRESS")) {
      setSubmitLoader(false);
      setServerErrors(ImportStateMessage.TOO_LONG);
      setTakingTooLong(true);
      clearInterval(monitorJob);
    }
  }

  const monitorJobStatusAndHandleResponse = (job_id, projectPath, datasetName) => {
    let cont = 0;
    const INTERVAL = 6000;
    let monitorJob = setInterval(() => {
      props.client.getJobStatus(job_id)
        .then(job => {
          cont++;
          if (job !== undefined) {
            handleJobResponse(
              job, monitorJob, cont * INTERVAL / 1000, projectPath, datasetName);
          }
        });
    }, INTERVAL);
  };

  const importDataset = (selectedProject) => {
    props.client.datasetImport(selectedProject.value, props.dataset.url)
      .then(response => {
        if (response.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(response.data.error.reason);
        }
        else {
          monitorJobStatusAndHandleResponse(
            response.data.result.job_id,
            selectedProject.name,
            props.dataset.name
          );
        }
      });
  };

  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);

    const selectedProject = addDatasetToProjectSchema.project.options.find((project)=>
      project.value === addDatasetToProjectSchema.project.value);

    props.client.getProjectIdFromService(selectedProject.value)
      .then((response) => {
        if (response.data && response.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(response.data.error.reason);
        }
        else {
          props.client.performMigrationCheck(response)
            .then((response) => {
              if (response.data && response.data.error !== undefined) {
                setSubmitLoader(false);
                setServerErrors(response.data.error.reason);
              }
              else {
                if (response.data.result.migration_required) {
                  setMigrationNeeded(true);
                  setSubmitLoader(false);
                }
                else {
                  importDataset(selectedProject);
                }
              }
            });
        }
      });
  };

  addDatasetToProjectSchema.project.customHandlers = {
    onSuggestionsFetchRequested: ( value, reason, setSuggestions ) => {

      setMigrationNeeded(false);
      setServerErrors(undefined);
      setTakingTooLong(false);

      const featured = props.projectsCoordinator.model.get("featured");
      if (!featured.fetched || (!featured.starred.length && !featured.member.length))
        return;

      const regex = new RegExp(value, "i");
      const searchDomain = featured.member.filter((project)=> project.access_level >= ACCESS_LEVELS.MAINTAINER);

      if (addDatasetToProjectSchema.project.options.length !== searchDomain.length) {
        addDatasetToProjectSchema.project.options = searchDomain.map((project)=>({
          "value": project.http_url_to_repo, "name": project.path_with_namespace, "id": project.id
        }));
      }

      const hits = {};
      const groupedSuggestions = [];

      searchDomain.forEach(d => {
        if (regex.exec(d.path_with_namespace) != null) {
          hits[d.path_with_namespace] = {
            "value": d.http_url_to_repo,
            "name": d.path_with_namespace,
            "subgroup": d.path_with_namespace.split("/")[0],
            "id": d.id
          };
        }
      });

      const hitValues = Object.values(hits).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
      const groupedHits = groupBy(hitValues, item => item.subgroup);
      for (var [key, val] of groupedHits) {
        groupedSuggestions.push({
          title: key,
          suggestions: val
        });
      }
      setSuggestions(groupedSuggestions);
    }
  };


  return (
    <DatasetAdd
      modalOpen={props.modalOpen}
      closeModal={closeModal}
      submitCallback={submitCallback}
      serverErrors={serverErrors}
      submitLoader={submitLoader}
      submitLoaderText={submitLoaderText}
      addDatasetToProjectSchema={addDatasetToProjectSchema}
      takingTooLong={takingTooLong}
      migrationNeeded={migrationNeeded}
      history={props.history}
    />
  );
}

export default AddDataset;
