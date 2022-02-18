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
import SelectAutosuggestInput from "../../utils/components/SelectAutosuggestInput";
import { Loader } from "../../utils/components/Loader";
import { Button } from "reactstrap/lib";
import { ACCESS_LEVELS } from "../../api-client";
import { groupBy } from "../../utils/helpers/HelperFunctions";
import { AddDatasetStatus } from "./addDatasetStatus";
import { AddDatasetContext } from "./DatasetAdd.container";

/**
 *  incubator-renku-ui
 *
 *  AddDatasetExistingProject
 *  Component for add dataset to existing project
 */

const AddDatasetExistingProject = (props) => {

  const [existingProject, setExistingProject] = useState(null);
  const [isProjectListReady, setIsProjectListReady] = useState(false);
  const addDatasetContext = useContext(AddDatasetContext);
  const setCurrentStatus = addDatasetContext.setCurrentStatus;
  const mounted = useRef(false);
  let projectsMonitorJob = null;

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
      props.validateProject(existingProject, false); // validate origin only when start import
    else
      setCurrentStatus(null);
  }, [existingProject]); // eslint-disable-line

  useEffect(() => {
    if (props.dataset)
      monitorProjectList();
  }, [props.dataset]); // eslint-disable-line

  // monitor to check when the list of projects is ready
  const monitorProjectList = () => {
    const INTERVAL = 1000;
    projectsMonitorJob = setInterval(() => {
      if (!addDatasetContext.projectsCoordinator) return;
      const featured = addDatasetContext.projectsCoordinator.model.get("featured");
      const isReady = !(!featured.fetched || (!featured.starred.length && !featured.member.length));
      setIsProjectListReady(isReady);
      if (isReady)
        clearInterval(projectsMonitorJob);
    }, INTERVAL);
  };

  const startImportDataset = () => addDatasetContext.submitCallback(existingProject);
  const onSuggestionsFetchRequested = ( value, setSuggestions ) => {
    const featured = addDatasetContext.projectsCoordinator.model.get("featured");
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
  if (isProjectListReady && addDatasetContext.isDatasetValid) {
    suggestionInput = (<SelectAutosuggestInput
      existingValue={existingProject?.name || null}
      name="project"
      label="Project"
      placeholder="Select a project..."
      customHandlers={customHandlers}
      setInputs={setExistingProject}
      disabled={addDatasetContext.importingDataset || addDatasetContext.currentStatus?.status === "inProcess"}
    />);
  }
  else if (addDatasetContext.isDatasetValid === null || addDatasetContext.isDatasetValid === false) {
    suggestionInput = null;
  }
  else {
    suggestionInput = <div><Loader size="14" inline="true" />{" "}Loading projects...</div>;
  }
  /* buttons */
  const addDatasetButton = (
    <div className="mt-4 d-flex justify-content-end">
      <Button
        color="primary"
        disabled={addDatasetContext.currentStatus?.status !== "validProject" || addDatasetContext.importingDataset}
        onClick={startImportDataset}>
        Add Dataset to existing Project
      </Button>
    </div>
  );

  const onSubmit = (e) => e.preventDefault();

  const addDatasetStatus = addDatasetContext.currentStatus ?
    <AddDatasetStatus
      status={addDatasetContext.currentStatus.status}
      text={addDatasetContext.currentStatus?.text || null}
      projectName={props.project?.name}
    /> : null;

  if (!props.dataset) return null;

  return (
    <div className="mt-4 mx-3">
      <form onSubmit={onSubmit} className={"mt-2"}>
        {suggestionInput}
      </form>
      { addDatasetStatus }
      { addDatasetButton }
    </div>
  );
};

export { AddDatasetExistingProject };
