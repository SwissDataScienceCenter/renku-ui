/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useContext, useEffect, useRef, useState } from "react";

import { Button } from "reactstrap";

import { AddDatasetStatus } from "./addDatasetStatus";
import { ACCESS_LEVELS } from "../../api-client";
import { ProjectsCoordinator } from "../../project/shared";
import SelectAutosuggestInput from "../../utils/components/SelectAutosuggestInput";
import { Loader } from "../../utils/components/Loader";
import AppContext from "../../utils/context/appContext";
import { groupBy } from "../../utils/helpers/HelperFunctions";
import { useSelector } from "react-redux";

/**
 *  incubator-renku-ui
 *
 *  AddDatasetExistingProject
 *  Component for add dataset to existing project
 */

const AddDatasetExistingProject = (
  { dataset, model, handlers, isDatasetValid, currentStatus, importingDataset, project }) => {

  const [existingProject, setExistingProject] = useState(null);
  const [isProjectListReady, setIsProjectListReady] = useState(false);
  const [projectsCoordinator, setProjectsCoordinator] = useState(null);
  const user = useSelector( (state) => state.stateModel.user);
  const { client } = useContext(AppContext);
  const mounted = useRef(false);
  const setCurrentStatus = handlers.setCurrentStatus;
  let projectsMonitorJob = null;

  useEffect(() => {
    setProjectsCoordinator(new ProjectsCoordinator(client, model.subModel("projects")));
  }, [client, model]);

  useEffect(() => {
    mounted.current = true;
    setCurrentStatus(null);
    return () => {
      mounted.current = false;
      clearInterval(projectsMonitorJob);
    };
  }, [setCurrentStatus, projectsMonitorJob]);

  useEffect( () => {
    if (existingProject)
      handlers.validateProject(existingProject, false); // validate origin only when start import
    else
      setCurrentStatus(null);
  }, [existingProject]); // eslint-disable-line

  useEffect(() => {
    if (dataset && projectsCoordinator && user.logged) {
      const featured = projectsCoordinator.model.get("featured");
      if (!featured.featured && !featured.fetching)
        projectsCoordinator.getFeatured();
      monitorProjectList();
    }
  }, [dataset, projectsCoordinator]); // eslint-disable-line

  // monitor to check when the list of projects is ready
  const monitorProjectList = () => {
    const INTERVAL = 1000;
    projectsMonitorJob = setInterval(() => {
      if (!projectsCoordinator) return;
      const featured = projectsCoordinator.model.get("featured");
      const isReady = !(!featured.fetched || (!featured.starred.length && !featured.member.length));
      setIsProjectListReady(isReady);
      if (isReady)
        clearInterval(projectsMonitorJob);
    }, INTERVAL);
  };

  const startImportDataset = () => handlers.submitCallback(existingProject);
  const onSuggestionsFetchRequested = ( value, setSuggestions ) => {
    const featured = projectsCoordinator.model.get("featured");
    if (!featured.fetched || (!featured.starred.length && !featured.member.length))
      return;

    const regex = new RegExp(value, "i");
    const searchDomain = featured.member.filter((project)=> {
      return project.access_level >= ACCESS_LEVELS.MAINTAINER;
    });

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
    for (const [key, val] of groupedHits)
      groupedSuggestions.push({ title: key, suggestions: val });

    setCurrentStatus(null);
    setSuggestions(groupedSuggestions);
  };
  const customHandlers = { onSuggestionsFetchRequested };

  let suggestionInput;
  if (isProjectListReady && isDatasetValid && currentStatus?.status !== "importing") {
    suggestionInput = (<SelectAutosuggestInput
      existingValue={existingProject?.name || null}
      name="project"
      label="Project"
      placeholder="Select a project..."
      customHandlers={customHandlers}
      setInputs={setExistingProject}
      disabled={importingDataset || currentStatus?.status === "inProcess"}
    />);
  }
  else if (isDatasetValid === null || isDatasetValid === false || currentStatus?.status === "importing") {
    suggestionInput = null;
  }
  else {
    suggestionInput = <div><Loader size="14" inline="true" />{" "}Loading projects...</div>;
  }
  /* buttons */
  const addDatasetButton = currentStatus?.status === "importing" ? null : (
    <div className="mt-4 d-flex justify-content-end">
      <Button
        data-cy="add-dataset-submit-button"
        color="primary"
        disabled={currentStatus?.status !== "validProject"}
        onClick={startImportDataset}>
        Add Dataset to existing Project
      </Button>
    </div>
  );

  const onSubmit = (e) => e.preventDefault();

  const addDatasetStatus = currentStatus ?
    <AddDatasetStatus
      status={currentStatus.status}
      text={currentStatus?.text || null}
      projectName={project?.name}
    /> : null;

  if (!dataset) return null;

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} className="mt-2" data-cy="form-project-exist">
        {suggestionInput}
      </form>
      {addDatasetStatus}
      {addDatasetButton}
    </div>
  );
};

export { AddDatasetExistingProject };
