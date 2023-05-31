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

import React, { useEffect, useRef, useState } from "react";

import { Button } from "reactstrap";

import { ACCESS_LEVELS } from "../../api-client";
import SelectAutosuggestInput from "../../components/SelectAutosuggestInput";
import { Loader } from "../../components/Loader";
import { groupBy } from "../../utils/helpers/HelperFunctions";
import useGetUserProjects from "../../utils/customHooks/UseGetProjects";

import type {
  AddDatasetHandlers,
  AddDatasetStatus,
  ExistingProject,
} from "./DatasetAdd.types";
import DatasetAddToProjectStatus from "./DatasetAddToProjectStatus";

type THit = Record<"id" | "name" | "subgroup" | "value", string>;

type AddDatasetExistingProjectProps = {
  dataset: unknown;
  handlers: AddDatasetHandlers;
  isDatasetValid: boolean | null;
  currentStatus: AddDatasetStatus | null;
  importingDataset: boolean;
  project?: ExistingProject;
};
function AddDatasetExistingProject({
  dataset,
  handlers,
  isDatasetValid,
  currentStatus,
  importingDataset,
  project,
}: AddDatasetExistingProjectProps) {
  const [existingProject, setExistingProject] =
    useState<ExistingProject | null>(null);
  const mounted = useRef(false);
  const setCurrentStatus = handlers.setCurrentStatus;

  const projects = useGetUserProjects();
  const memberProjects = projects.projectsMember;
  const isLoadingMemberProjects = projects.isFetchingProjects;

  useEffect(() => {
    mounted.current = true;
    setCurrentStatus(null);
    return () => {
      mounted.current = false;
    };
  }, [setCurrentStatus]);

  useEffect(() => {
    if (existingProject) handlers.validateProject(existingProject, false);
    // validate origin only when start import
    else setCurrentStatus(null);
  }, [existingProject]); // eslint-disable-line

  const startImportDataset = () => {
    if (existingProject == null) return;
    handlers.submitCallback(existingProject);
  };
  const onSuggestionsFetchRequested = (
    value: string,
    setSuggestions: (suggestions: unknown) => void
  ) => {
    if (!memberProjects || isLoadingMemberProjects) return;
    const featured = { member: memberProjects };

    const regex = new RegExp(value, "i");
    const searchDomain = featured.member.filter((project: ExistingProject) => {
      return project.access_level >= ACCESS_LEVELS.MAINTAINER;
    });

    const hits: Record<string, THit> = {};
    const groupedSuggestions = [];

    searchDomain.forEach((d: ExistingProject) => {
      if (regex.exec(d.path_with_namespace) != null) {
        hits[d.path_with_namespace] = {
          value: d.http_url_to_repo,
          name: d.path_with_namespace,
          subgroup: d.path_with_namespace.split("/")[0],
          id: d.id,
        };
      }
    });

    const hitValues = Object.values(hits).sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
    const groupedHits = groupBy(hitValues, (item: THit) => item.subgroup);
    for (const [key, val] of groupedHits)
      groupedSuggestions.push({ title: key, suggestions: val });

    setCurrentStatus(null);
    setSuggestions(groupedSuggestions);
  };
  const customHandlers = { onSuggestionsFetchRequested };

  let suggestionInput;
  const isProjectListReady =
    (memberProjects != null) != null && !isLoadingMemberProjects;
  if (
    isProjectListReady &&
    isDatasetValid &&
    currentStatus?.status !== "importing"
  ) {
    suggestionInput = (
      <SelectAutosuggestInput
        alert={undefined}
        customHandlers={customHandlers}
        disabled={importingDataset || currentStatus?.status === "inProcess"}
        existingValue={existingProject?.name || null}
        help={undefined}
        label="Project"
        name="project"
        options={undefined}
        placeholder="Select a project..."
        setInputs={setExistingProject}
      />
    );
  } else if (
    isDatasetValid === null ||
    isDatasetValid === false ||
    currentStatus?.status === "importing"
  ) {
    suggestionInput = null;
  } else {
    suggestionInput = (
      <div>
        <Loader size="14" inline="true" /> Loading projects...
      </div>
    );
  }
  /* buttons */
  const addDatasetButton =
    currentStatus?.status === "importing" ? null : (
      <div className="mt-4 d-flex justify-content-end">
        <Button
          data-cy="add-dataset-submit-button"
          color="rk-pink"
          className="text-white"
          disabled={currentStatus?.status !== "validProject"}
          onClick={startImportDataset}
        >
          Add Dataset to existing Project
        </Button>
      </div>
    );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault();

  const addDatasetStatus = currentStatus ? (
    <DatasetAddToProjectStatus
      status={currentStatus.status}
      text={currentStatus.text}
      projectName={project?.name}
    />
  ) : null;

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
}

export default AddDatasetExistingProject;
