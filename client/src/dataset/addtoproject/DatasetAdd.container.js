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


import React from "react";
import { addDatasetToProjectSchema } from "../../model/RenkuModels";
import { ACCESS_LEVELS } from "../../api-client";
import DatasetAdd from "./DatasetAdd.present";
import { ImportStateMessage } from "../../utils/Dataset";
import { groupBy } from "../../utils/HelperFunctions";
import _ from "lodash";

let dsFormSchema = _.cloneDeep(addDatasetToProjectSchema);

function AddDataset(props) {

  if (dsFormSchema == null)
    dsFormSchema = _.cloneDeep(addDatasetToProjectSchema);


  const closeModal = () =>{
    props.setModalOpen(false);
  };

  const onCancel = (e, handlers) =>{
    closeModal();
    handlers.removeDraft(props.formLocation);
  };

  const redirectUser = (projectPath, datasetName, handlers) => {
    handlers.setSubmitLoader({ value: false, text: "" });
    handlers.removeDraft(props.formLocation);
    props.history.push({
      pathname: `/projects/${projectPath}/datasets/${datasetName}`,
      state: { reload: true }
    });
  };

  function handleJobResponse(job, monitorJob, waitedSeconds, projectPath, datasetName, handlers) {

    if (job) {
      switch (job.state) {
        case "ENQUEUED":
          handlers.setSubmitLoader({ value: true, text: ImportStateMessage.ENQUEUED });
          break;
        case "IN_PROGRESS":
          handlers.setSubmitLoader({ value: true, text: ImportStateMessage.IN_PROGRESS });
          break;
        case "COMPLETED":
          handlers.setSubmitLoader({ value: true, text: ImportStateMessage.COMPLETED });
          clearInterval(monitorJob);
          redirectUser(projectPath, datasetName, handlers);
          break;
        case "FAILED":
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(ImportStateMessage.FAILED + job.extras.error);
          clearInterval(monitorJob);
          break;
        default:
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(ImportStateMessage.FAILED_NO_INFO);
          clearInterval(monitorJob);
          break;
      }
    }
    if ((waitedSeconds > 180 && job.state !== "IN_PROGRESS") || (waitedSeconds > 360 && job.state === "IN_PROGRESS")) {
      handlers.setSubmitLoader({ value: false, text: "" });
      handlers.setServerErrors(ImportStateMessage.TOO_LONG);
      //here change the buttons???
      // setTakingTooLong(true);
      clearInterval(monitorJob);
    }
  }

  const monitorJobStatusAndHandleResponse = (job_id, projectPath, datasetName, handlers) => {
    let cont = 0;
    const INTERVAL = 6000;
    let monitorJob = setInterval(() => {
      props.client.getJobStatus(job_id)
        .then(job => {
          cont++;
          if (job !== undefined) {
            handleJobResponse(
              job, monitorJob, cont * INTERVAL / 1000, projectPath, datasetName, handlers);
          }
        });
    }, INTERVAL);
  };

  const importDataset = (selectedProject, handlers) => {
    props.client.datasetImport(selectedProject.value, props.dataset.url)
      .then(response => {
        if (response.data.error !== undefined) {
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(response.data.error.reason);
        }
        else {
          monitorJobStatusAndHandleResponse(
            response.data.result.job_id,
            selectedProject.name,
            props.dataset.name,
            handlers
          );
        }
      });
  };


  const submitCallback = (e, mappedInputs, handlers) => {
    handlers.setServerErrors(undefined);
    handlers.setSubmitLoader({ value: true, text: ImportStateMessage.ENQUEUED });

    const projectOptions = handlers.getFormDraftFieldProperty(props.formLocation, "project", ["options"]);

    const selectedProject = projectOptions.find((project)=>
      project.value === mappedInputs.project);

    props.client.getProjectIdFromService(selectedProject.value)
      .then((response) => {
        if (response.data && response.data.error !== undefined) {
          handlers.setSubmitLoader({ value: false, text: "" });
          handlers.setServerErrors(response.data.error.reason);
        }
        else {
          props.client.performMigrationCheck(response)
            .then((response) => {
              if (response.data && response.data.error !== undefined) {
                handlers.setSubmitLoader({ value: false, text: "" });
                handlers.setServerErrors(response.data.error.reason);
              }
              else {
                if (response.data.result.migration_required) {
                  handlers.setServerWarnings(selectedProject.name);
                  handlers.setSubmitLoader(false);
                }
                else {
                  importDataset(selectedProject, handlers);
                }
              }
            });
        }
      });
  };

  const initializeFunction = (formSchema, formHandlers) => {
    let projectsField = formSchema.find(field => field.name === "project");
    projectsField.customHandlers = {
      onSuggestionsFetchRequested: ( value, reason, setSuggestions, handlers ) => {

        formHandlers.setServerErrors(undefined);
        formHandlers.setServerWarnings(undefined);

        const featured = props.projectsCoordinator.model.get("featured");
        if (!featured.fetched || (!featured.starred.length && !featured.member.length))
          return;

        const regex = new RegExp(value, "i");
        const searchDomain = featured.member.filter((project)=> project.access_level >= ACCESS_LEVELS.MAINTAINER);

        if (projectsField.options.length !== searchDomain.length) {
          projectsField.options = searchDomain.map((project)=>({
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
  };


  return (
    <DatasetAdd
      modalOpen={props.modalOpen}
      closeModal={closeModal}
      onCancel={onCancel}
      submitCallback={submitCallback}
      addDatasetToProjectSchema={dsFormSchema}
      history={props.history}
      initializeFunction={initializeFunction}
      formLocation={props.formLocation}
      model={props.model}
    />
  );
}

export default AddDataset;
