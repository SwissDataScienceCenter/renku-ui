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


import React, { useEffect, useState } from "react";

import { ImportStateMessage } from "../../utils/constants/Dataset";
import { migrationCheckToRenkuVersionStatus, RENKU_VERSION_SCENARIOS } from "../../project/status/MigrationUtils";
import DatasetAdd from "./DatasetAdd.present";

function AddDataset(props) {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [importingDataset, setImportingDataset] = useState(false);
  const [isProjectListReady, setIsProjectListReady] = useState(false);
  const [isDatasetValid, setIsDatasetValid] = useState(null);
  const [datasetProjectVersion, setDatasetProjectVersion] = useState(null);
  const [dataset, setDataset] = useState(null);

  const versionUrl = props.migration.core.versionUrl;

  useEffect(() => {
    const fetchDataset = async () => {
      await props.datasetCoordinator.fetchDataset(props.identifier, props.datasets, true);
      const currentDataset = props.datasetCoordinator.get("metadata");
      setDataset(currentDataset);
    };

    if (props.datasetCoordinator && props.identifier) {
      const currentDataset = props.datasetCoordinator.get("metadata");
      if (currentDataset && currentDataset?.identifier === props.identifier && currentDataset.projects)
        setDataset(currentDataset);
      else
        fetchDataset();
    }
  }, [props.datasetCoordinator && props.identifier]); // eslint-disable-line

  useEffect(() => {
    if (dataset)
      validateDatasetProject();
  }, [dataset]); // eslint-disable-line

  /* validate project */
  const validateDatasetProject = async () => {
    // check dataset has valid project url
    setCurrentStatus({ status: "inProcess", text: "Checking Dataset..." });
    if (!dataset.project || !dataset.project.path) {
      setCurrentStatus({ status: "error", text: "Invalid Dataset, refresh the page to get updated values" });
      setIsDatasetValid(false);
      return false;
    }

    // fetch dataset project values and check it has a valid git url
    // TODO remove this request when dataset include httpUrlToRepo
    let checkOrigin;
    try {
      const fetchDatasetProject = await props.client.getProject(dataset.project?.path);
      const urlProjectOrigin = fetchDatasetProject?.data?.all?.http_url_to_repo;
      if (!urlProjectOrigin) {
        setCurrentStatus({ status: "error", text: "Invalid Dataset" });
        setIsDatasetValid(false);
        return false;
      }

      // check dataset project migration status
      checkOrigin = await props.client.checkMigration(urlProjectOrigin);
      if (checkOrigin && checkOrigin.error !== undefined) {
        setCurrentStatus({ status: "error", text: checkOrigin.error.reason });
        setIsDatasetValid(false);
        return false;
      }
    }
    catch (e) {
      setCurrentStatus({ status: "error", text: "Invalid Dataset" });
      setIsDatasetValid(false);
      return false;
    }
    setIsDatasetValid(true);

    // check if the dataset project is supported
    const projectVersion = checkOrigin.result.core_compatibility_status.project_metadata_version;
    const datasetProjectVersionStatus = migrationCheckToRenkuVersionStatus(checkOrigin.result);
    if (datasetProjectVersionStatus.renkuVersionStatus === RENKU_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED) {
      setCurrentStatus({
        status: "error",
        text: `The dataset project version ${projectVersion} is not supported`
      });
      return false;
    }

    setDatasetProjectVersion(projectVersion);
    setCurrentStatus(null);
    return projectVersion;
  };
  const validateProject = async (project, validateOrigin) => {
    if (!project)
      return false;

    //  start checking project
    setCurrentStatus({ status: "checkingProject", text: null });
    setCurrentStatus({ status: "inProcess", text: "Checking dataset/project compatibility..." });
    let originProjectVersion;
    if (validateOrigin || datasetProjectVersion == null)
      originProjectVersion = await validateDatasetProject();
    else
      originProjectVersion = datasetProjectVersion;

    setCurrentStatus({ status: "inProcess", text: "Checking dataset/project compatibility..." });
    // check selected project migration status
    const checkTarget = await props.client.checkMigration(project.value);
    if (checkTarget && checkTarget.error !== undefined) {
      setCurrentStatus({ status: "error", text: checkTarget.error.reason });
      return false;
    }

    // check if the selected project doesn't need migration
    const targetProjectVersionStatus = migrationCheckToRenkuVersionStatus(checkTarget.result);
    if (targetProjectVersionStatus.renkuVersionStatus === RENKU_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED) {
      setCurrentStatus({ status: "error", text: "Operations on this project are not supported in the UI." });
      return false;
    }

    // check if dataset project version and selected project version has the same version
    const target_metadata_version = checkTarget.result.core_compatibility_status.project_metadata_version;
    if (+target_metadata_version < +originProjectVersion) {
      setCurrentStatus(
        {
          status: "error",
          text: `Dataset project metadata version (${originProjectVersion})
          cannot be newer than the project metadata version (${target_metadata_version}) for import.` });
      return false;
    }
    // check if the dataset project is supported
    if (targetProjectVersionStatus.renkuVersionStatus === RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED) {
      const backendAvailability = await props.client.checkCoreAvailability(target_metadata_version);
      if (!backendAvailability.available) {
        setCurrentStatus({ status: "errorNeedMigration", text: null });
        return false;
      }
      // Project is older, but backend is available
    }

    setCurrentStatus({ status: "validProject", text: "Selected project is compatible with dataset." });
    return true;
  };
  /* end validate project */

  /* import dataset */
  const submitCallback = async (project) => {
    if (!project)
      setCurrentStatus({ status: "error", text: "Empty project" });

    const isProjectValid = await validateProject(project, true);
    if (isProjectValid) {
      setCurrentStatus({ status: "inProcess", text: ImportStateMessage.ENQUEUED });
      importDataset(project);
    }
  };

  const importDataset = (selectedProject) => {
    setImportingDataset(true);
    props.client.datasetImport(selectedProject.value, dataset.url, versionUrl)
      .then(response => {
        if (response?.data?.error !== undefined) {
          setCurrentStatus({ status: "error", text: response.data.error.reason });
          setImportingDataset(false);
        }
        else {
          monitorJobStatusAndHandleResponse(
            response.data.result.job_id,
            selectedProject.name,
            dataset.name
          );
        }
      });
  };

  const monitorJobStatusAndHandleResponse = (job_id, projectPath, datasetName) => {
    let cont = 0;
    const INTERVAL = 6000;
    let monitorJob = setInterval(async () => {
      try {
        const job = await props.client.getJobStatus(job_id, versionUrl);
        cont++;
        if (job !== undefined)
          handleJobResponse(job, monitorJob, cont * INTERVAL / 1000, projectPath, datasetName);
      }
      catch (e) {
        setCurrentStatus({ status: "error", text: e.message });
        setImportingDataset(false);
        clearInterval(monitorJob);
      }
    }, INTERVAL);
  };

  function handleJobResponse(job, monitorJob, waitedSeconds, projectPath, datasetName) {
    if (job) {
      switch (job.state) {
        case "ENQUEUED":
          setCurrentStatus({ status: "inProcess", text: ImportStateMessage.ENQUEUED });
          break;
        case "IN_PROGRESS":
          setCurrentStatus({ status: "inProcess", text: ImportStateMessage.IN_PROGRESS });
          break;
        case "COMPLETED":
          setCurrentStatus({ status: "completed", text: ImportStateMessage.COMPLETED });
          setImportingDataset(false);
          clearInterval(monitorJob);
          redirectUser(projectPath, datasetName);
          break;
        case "FAILED":
          setCurrentStatus({ status: "error", text: ImportStateMessage.FAILED + job.extras.error });
          setImportingDataset(false);
          clearInterval(monitorJob);
          break;
        default:
          setCurrentStatus({ status: "error", text: ImportStateMessage.FAILED_NO_INFO });
          setImportingDataset(false);
          clearInterval(monitorJob);
          break;
      }
    }
    if ((waitedSeconds > 180 && job.state !== "IN_PROGRESS") || (waitedSeconds > 360 && job.state === "IN_PROGRESS")) {
      setCurrentStatus({ status: "error", text: ImportStateMessage.TOO_LONG });
      setImportingDataset(false);
      clearInterval(monitorJob);
    }
  }

  const redirectUser = (projectPath, datasetName) => {
    setCurrentStatus(null);
    props.history.push({
      pathname: `/projects/${projectPath}/datasets/${datasetName}`,
      state: { reload: true }
    });
  };
  /* end import dataset */

  return (
    <DatasetAdd
      dataset={dataset}
      submitCallback={submitCallback}
      history={props.history}
      currentStatus={currentStatus}
      setCurrentStatus={setCurrentStatus}
      importingDataset={importingDataset}
      isProjectListReady={isProjectListReady}
      setIsProjectListReady={setIsProjectListReady}
      isDatasetValid={isDatasetValid}
      validateProject={validateProject}
      projectsCoordinator={props.projectsCoordinator}
      logged={props.logged}
      insideProject={props.insideProject}
    />
  );
}

export default AddDataset;
