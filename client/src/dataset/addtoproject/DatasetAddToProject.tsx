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

import { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useCoreSupport } from "../../features/project/useProjectCoreSupport";
import { ImportStateMessage } from "../../utils/constants/Dataset";
import AppContext from "../../utils/context/appContext";
import { cleanGitUrl } from "../../utils/helpers/ProjectFunctions";

import { DatasetCoordinator } from "../Dataset.state";

import DatasetAdd from "./DatasetAdd.present";
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

type ProjectDetails = {
  gitUrl: string;
  branch: string;
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
  const [dataset, setDataset] = useState<AddDatasetDataset | null>(null);
  const [datasetCoordinator, setDatasetCoordinator] =
    useState<DatasetCoordinator | null>(null);
  const { client } = useContext(AppContext);
  const history = useHistory();

  const [srcProjectDetails, setSrcProjectDetails] =
    useState<ProjectDetails | null>(null);
  const [versionUrl, setVersionUrl] = useState<string | null>(null);

  const [dstProjectDetails, setDstProjectDetails] =
    useState<ProjectDetails | null>(null);

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

  /* validate project */
  const validateDatasetProject = useCallback(
    async (isSubmit = false) => {
      // check dataset has valid project url
      setCurrentStatus({
        status: isSubmit ? "importing" : "inProcess",
        text: "Checking dataset...",
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
        const urlProjectOrigin = fetchDatasetProject?.data?.all?.web_url;
        if (!urlProjectOrigin) {
          setCurrentStatus({ status: "error", text: "Invalid Dataset" });
          setIsDatasetValid(false);
          return false;
        }
        const branch = fetchDatasetProject?.data?.all?.default_branch;
        setSrcProjectDetails({ gitUrl: urlProjectOrigin, branch });
      } catch (e) {
        setCurrentStatus({ status: "error", text: "Invalid Dataset" });
        setIsDatasetValid(false);
        return false;
      }
      setIsDatasetValid(true);
    },
    [dataset, client]
  );

  useEffect(() => {
    if (dataset) validateDatasetProject();
  }, [dataset, validateDatasetProject]);

  const { coreSupport: srcCoreSupport } = useCoreSupport({
    gitUrl: srcProjectDetails?.gitUrl ?? undefined,
    branch: srcProjectDetails?.branch ?? undefined,
  });

  // check whether the selected dataset is supported
  useEffect(() => {
    if (!srcCoreSupport.computed) return;
    if (
      !srcCoreSupport.backendAvailable &&
      srcCoreSupport.backendErrorMessage != null
    ) {
      setCurrentStatus({ status: "error", text: "Invalid Dataset" });
      setIsDatasetValid(false);
      return;
    }
    setIsDatasetValid(true);
    if (!srcCoreSupport.backendAvailable) {
      setCurrentStatus({
        status: "error",
        text: `The dataset project version ${srcCoreSupport.metadataVersion} is not supported`,
      });
      return;
    }
    setCurrentStatus(null);
  }, [srcCoreSupport]);

  const validateProject = async (
    project: SubmitProject,
    _validateOrigin: boolean,
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
    // We utilize the externalUrl property, which typically doesn't include ".git".
    // However, graphql return the httpUrlToRepo, so we remove ".git".
    const gitUrl = cleanGitUrl(project.value);
    const branch = project.default_branch;
    setDstProjectDetails({ gitUrl, branch });
  };

  // check whether the target dataset is supported
  const { coreSupport: dstCoreSupport } = useCoreSupport({
    gitUrl: dstProjectDetails?.gitUrl ?? undefined,
    branch: dstProjectDetails?.branch ?? undefined,
  });
  useEffect(() => {
    if (!dstCoreSupport.computed) return;
    if (
      !dstCoreSupport.backendAvailable &&
      dstCoreSupport.backendErrorMessage != null
    ) {
      setCurrentStatus({
        status: "error",
        text: "There is a problem with the destination project that prevents adding the dataset.",
      });
      return;
    }
    if (!dstCoreSupport.backendAvailable) {
      setCurrentStatus({
        status: "error",
        text: "The target project is either too old or unavailable.",
      });
      return;
    }
    setVersionUrl(dstCoreSupport.versionUrl);

    // wait for this to be set
    if (!srcCoreSupport.computed || !srcCoreSupport.backendAvailable) return;
    if (dstCoreSupport.metadataVersion < srcCoreSupport.metadataVersion) {
      setCurrentStatus({
        status: "error",
        text: `Source project metadata version (${srcCoreSupport.metadataVersion})
                cannot be newer than the project metadata version (${dstCoreSupport.metadataVersion}) for import.`,
      });
      return;
    }
    setCurrentStatus({
      status: "validProject",
      text: "Selected project is compatible with dataset.",
    });
  }, [srcCoreSupport, dstCoreSupport]);

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
      .datasetImport(
        cleanGitUrl(selectedProject.value),
        dataset.url,
        versionUrl, // this will be undefined for a new project, so the latest version will be used
        selectedProject.default_branch
          ? selectedProject.default_branch
          : dstProjectDetails?.branch
      )
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
            dataset.slug ?? ""
          );
        }
      });
  };

  const monitorJobStatusAndHandleResponse = (
    job_id: string,
    projectPath: string,
    datasetSlug: string
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
            datasetSlug
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
    datasetSlug: string
  ) {
    if (!job) return;
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
        redirectUser(projectPath, datasetSlug);
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
    if (
      (waitedSeconds > 180 && job.state !== "IN_PROGRESS") ||
      (waitedSeconds > 360 && job.state === "IN_PROGRESS")
    ) {
      setCurrentStatus({ status: "error", text: ImportStateMessage.TOO_LONG });
      setImportingDataset(false);
      clearInterval(monitorJob);
    }
  }

  const redirectUser = (projectPath: string, datasetSlug: string) => {
    setCurrentStatus(null);
    history.push({
      pathname: `/projects/${projectPath}/datasets/${datasetSlug}`,
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
