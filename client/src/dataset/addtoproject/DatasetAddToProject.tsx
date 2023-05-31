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

import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import DatasetAdd from "./DatasetAdd.present";
import { DatasetCoordinator } from "../Dataset.state";
import { ImportStateMessage } from "../../utils/constants/Dataset";
import AppContext from "../../utils/context/appContext";
import { useGetMigrationStatusQuery } from "../../features/project/projectCoreApi";
import type { CoreCompatibilityStatus } from "../../features/project/Project.d";
import { useGetCoreVersionsQuery } from "../../features/versions/versionsApi";

import type {
  AddDatasetDataset,
  AddDatasetStatus,
  SubmitProject,
} from "./DatasetAdd.types";

type DatasetImportResponse = {
  data?: {
    result?: { job_id: string };
    error?: { userMessage?: string; reason: string };
  };
};

type AddDatasetToProjectProps = {
  datasets: unknown;
  identifier: string;
  insideProject: boolean;
  model: { subModel: (arg0: string) => unknown };
};
function DatasetAddToProject({
  datasets,
  identifier,
  insideProject,
  model,
}: AddDatasetToProjectProps) {
  const [currentStatus, setCurrentStatus] = useState<AddDatasetStatus | null>(
    null
  );
  const [importingDataset, setImportingDataset] = useState(false);
  const [isDatasetValid, setIsDatasetValid] = useState<boolean | null>(null);
  const [datasetProjectVersion, setDatasetProjectVersion] = useState<
    number | null
  >(null);
  const [dataset, setDataset] = useState<AddDatasetDataset | null>(null);
  const [datasetCoordinator, setDatasetCoordinator] =
    useState<DatasetCoordinator | null>(null);
  const { client } = useContext(AppContext);
  const history = useHistory();

  const [datasetProjectUrl, setDatasetProjectUrl] = useState<string | null>(
    null
  );
  const [versionUrl, setVersionUrl] = useState<string | null>(null);

  const coreSupport = useGetCoreVersionsQuery();
  const datasetProjectMigrationStatus = useGetMigrationStatusQuery(
    { gitUrl: datasetProjectUrl ?? "" },
    {
      skip: !datasetProjectUrl,
    }
  );
  const [targetDatasetProjectUrl, setTargetDatasetProjectUrl] = useState<
    string | null
  >(null);
  const targetDatasetProjectMigrationStatus = useGetMigrationStatusQuery(
    { gitUrl: targetDatasetProjectUrl ?? "" },
    {
      skip: !targetDatasetProjectUrl,
    }
  );

  useEffect(() => {
    setDatasetCoordinator(
      new DatasetCoordinator(client, model.subModel("dataset"))
    );
  }, [client, model]);

  useEffect(() => {
    const fetchDataset = async () => {
      if (datasetCoordinator == null) return;
      await datasetCoordinator.fetchDataset(identifier, datasets, true);
      const currentDataset = datasetCoordinator.get("metadata");
      setDataset(currentDataset);
    };

    if (datasetCoordinator && identifier) {
      const currentDataset = datasetCoordinator.get("metadata");
      if (
        currentDataset &&
        currentDataset?.identifier === identifier &&
        currentDataset.projects
      )
        setDataset(currentDataset);
      else fetchDataset();
    }
  }, [datasetCoordinator && identifier]); // eslint-disable-line

  useEffect(() => {
    if (dataset) validateDatasetProject();
  }, [dataset]); // eslint-disable-line

  /* validate project */
  const validateDatasetProject = async (isSubmit = false) => {
    // check dataset has valid project url
    setCurrentStatus({
      status: isSubmit ? "importing" : "inProcess",
      text: "Checking Dataset...",
    });
    if (!dataset?.project || !dataset?.project.path) {
      setCurrentStatus({
        status: "error",
        text: "Invalid Dataset, refresh the page to get updated values",
      });
      setIsDatasetValid(false);
      return false;
    }

    // fetch dataset project values and check it has a valid git url
    // TODO remove this request when dataset include httpUrlToRepo
    try {
      const fetchDatasetProject = await client.getProject(
        dataset.project?.path
      );
      const urlProjectOrigin = fetchDatasetProject?.data?.all?.http_url_to_repo;
      if (!urlProjectOrigin) {
        setCurrentStatus({ status: "error", text: "Invalid Dataset" });
        setIsDatasetValid(false);
        return false;
      }
      setDatasetProjectUrl(urlProjectOrigin);
    } catch (e) {
      setCurrentStatus({ status: "error", text: "Invalid Dataset" });
      setIsDatasetValid(false);
      return false;
    }
    setIsDatasetValid(true);
  };
  // check whether the selected dataset is supported
  useEffect(() => {
    if (
      !datasetProjectMigrationStatus.isUninitialized &&
      !datasetProjectMigrationStatus.isFetching
    ) {
      if (datasetProjectMigrationStatus.isError) {
        setCurrentStatus({ status: "error", text: "Invalid Dataset" });
        setIsDatasetValid(false);
      } else {
        setIsDatasetValid(true);
        const metadataVersion = parseInt(
          (
            datasetProjectMigrationStatus.data?.details
              ?.core_compatibility_status as CoreCompatibilityStatus
          )?.project_metadata_version ?? 0
        );
        if (
          metadataVersion &&
          !coreSupport.isLoading &&
          coreSupport.data?.metadataVersions &&
          coreSupport.data?.metadataVersions.includes(metadataVersion)
        ) {
          setDatasetProjectVersion(metadataVersion);
          setCurrentStatus(null);
        } else {
          setCurrentStatus({
            status: "error",
            text: `The dataset project version ${metadataVersion} is not supported`,
          });
        }
      }
    }
  }, [
    datasetProjectMigrationStatus.data,
    datasetProjectMigrationStatus.isFetching,
    datasetProjectMigrationStatus.isUninitialized,
    datasetProjectMigrationStatus.isError,
    coreSupport.isLoading,
    coreSupport.data,
  ]);

  const validateProject = async (
    project: SubmitProject,
    validateOrigin: boolean,
    isSubmit = false
  ) => {
    if (!project) return false;
    const processStatus = isSubmit ? "importing" : "inProcess";

    //  start checking project
    setCurrentStatus({
      status: processStatus,
      text: "Checking dataset/project compatibility...",
    });
    // check selected project migration status

    setTargetDatasetProjectUrl(project.value);
  };
  // check whether the target dataset is supported
  useEffect(() => {
    if (
      !targetDatasetProjectMigrationStatus.isUninitialized &&
      !targetDatasetProjectMigrationStatus.isFetching
    ) {
      if (targetDatasetProjectMigrationStatus.isError) {
        setCurrentStatus({
          status: "error",
          text: "Unexpected error with the target database.",
        });
        return;
      }
      // wait for this to be set
      if (datasetProjectVersion == null) return;

      const targetDatasetProjectVersion = parseInt(
        (
          targetDatasetProjectMigrationStatus.data?.details
            ?.core_compatibility_status as CoreCompatibilityStatus
        )?.project_metadata_version ?? 0
      );
      setVersionUrl("/" + targetDatasetProjectVersion);
      if (
        coreSupport.data?.metadataVersions == null ||
        !coreSupport.data?.metadataVersions.includes(
          targetDatasetProjectVersion
        )
      ) {
        setCurrentStatus({
          status: "error",
          text: "The target project is either too old or unavailable.",
        });
        return;
      }
      if (targetDatasetProjectVersion < datasetProjectVersion) {
        setCurrentStatus({
          status: "error",
          text: `Dataset project metadata version (${datasetProjectVersion})
                cannot be newer than the project metadata version (${targetDatasetProjectVersion}) for import.`,
        });
        return;
      }
      setCurrentStatus({
        status: "validProject",
        text: "Selected project is compatible with dataset.",
      });
    }
  }, [
    coreSupport.data,
    datasetProjectVersion,
    targetDatasetProjectMigrationStatus.isError,
    targetDatasetProjectMigrationStatus.isFetching,
    targetDatasetProjectMigrationStatus.isUninitialized,
    targetDatasetProjectMigrationStatus.data,
  ]);

  /* end validate project */

  /* import dataset */
  const submitCallback = async (project: SubmitProject) => {
    if (!project) setCurrentStatus({ status: "error", text: "Empty project" });
    setCurrentStatus({
      status: "importing",
      text: ImportStateMessage.ENQUEUED,
    });
    importDataset(project);
  };

  const importDataset = (selectedProject: SubmitProject) => {
    if (dataset == null) return;
    setImportingDataset(true);
    client
      .datasetImport(selectedProject.value, dataset.url, versionUrl)
      .then((response: DatasetImportResponse) => {
        if (response?.data?.error !== undefined) {
          const error = response.data.error;
          setCurrentStatus({
            status: "error",
            text: error.userMessage ? error.userMessage : error.reason,
          });
          setImportingDataset(false);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
          const jobId = response.data?.result?.job_id!;
          monitorJobStatusAndHandleResponse(
            jobId,
            selectedProject.name,
            dataset.name
          );
        }
      });
  };

  const monitorJobStatusAndHandleResponse = (
    job_id: string,
    projectPath: string,
    datasetName: string
  ) => {
    let cont = 0;
    const INTERVAL = 6000;
    const monitorJob = setInterval(async () => {
      try {
        const job = await client.getJobStatus(job_id, versionUrl);
        cont++;
        if (job !== undefined)
          handleJobResponse(
            job,
            monitorJob,
            (cont * INTERVAL) / 1000,
            projectPath,
            datasetName
          );
      } catch (e) {
        const error = e as { message?: string };
        setCurrentStatus({ status: "error", text: error.message });
        setImportingDataset(false);
        clearInterval(monitorJob);
      }
    }, INTERVAL);
  };

  function handleJobResponse(
    job: { state: string; extras: { error: string } },
    monitorJob: ReturnType<typeof setInterval>,
    waitedSeconds: number,
    projectPath: string,
    datasetName: string
  ) {
    if (job) {
      switch (job.state) {
        case "ENQUEUED":
          setCurrentStatus({
            status: "importing",
            text: ImportStateMessage.ENQUEUED,
          });
          break;
        case "IN_PROGRESS":
          setCurrentStatus({
            status: "importing",
            text: ImportStateMessage.IN_PROGRESS,
          });
          break;
        case "COMPLETED":
          setCurrentStatus({
            status: "completed",
            text: ImportStateMessage.COMPLETED,
          });
          setImportingDataset(false);
          clearInterval(monitorJob);
          redirectUser(projectPath, datasetName);
          break;
        case "FAILED":
          setCurrentStatus({
            status: "error",
            text: ImportStateMessage.FAILED + job.extras.error,
          });
          setImportingDataset(false);
          clearInterval(monitorJob);
          break;
        default:
          setCurrentStatus({
            status: "error",
            text: ImportStateMessage.FAILED_NO_INFO,
          });
          setImportingDataset(false);
          clearInterval(monitorJob);
          break;
      }
    }
    if (
      (waitedSeconds > 180 && job.state !== "IN_PROGRESS") ||
      (waitedSeconds > 360 && job.state === "IN_PROGRESS")
    ) {
      setCurrentStatus({ status: "error", text: ImportStateMessage.TOO_LONG });
      setImportingDataset(false);
      clearInterval(monitorJob);
    }
  }

  const redirectUser = (projectPath: string, datasetName: string) => {
    setCurrentStatus(null);
    history.push({
      pathname: `/projects/${projectPath}/datasets/${datasetName}`,
      state: { reload: true },
    });
  };
  /* end import dataset */

  const handlers = {
    setCurrentStatus,
    submitCallback,
    validateProject,
  };

  return (
    <DatasetAdd
      handlers={handlers}
      model={model}
      insideProject={insideProject}
      dataset={dataset}
      currentStatus={currentStatus}
      isDatasetValid={isDatasetValid}
      importingDataset={importingDataset}
    />
  );
}

export default DatasetAddToProject;
