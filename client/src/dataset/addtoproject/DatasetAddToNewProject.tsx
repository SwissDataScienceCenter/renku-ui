/* !
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

import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { WarnAlert } from "../../components/Alert";
import { Loader } from "../../components/Loader";
import { NewProject } from "../../project/new/ProjectNew.container";
import AppContext from "../../utils/context/appContext";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import type {
  AddDatasetHandlers,
  AddDatasetStatus,
  ExistingProject,
} from "./DatasetAdd.types";
import DatasetAddToProjectStatus from "./DatasetAddToProjectStatus";

type TNewProject = {
  name: string;
};

type AddDatasetNewProjectProps = {
  dataset: unknown;
  model: unknown;
  handlers: AddDatasetHandlers;
  isDatasetValid: boolean | null;
  currentStatus: AddDatasetStatus | null;
  importingDataset: boolean;
  project?: ExistingProject;
};

function AddDatasetNewProject({
  dataset,
  model,
  handlers,
  isDatasetValid,
  currentStatus,
  importingDataset,
  project,
}: AddDatasetNewProjectProps) {
  const [newProject, setNewProject] = useState<TNewProject | null>(null);
  const setCurrentStatus = handlers.setCurrentStatus;
  const { client } = useContext(AppContext);
  const user = useLegacySelector((state) => state.stateModel.user);

  useEffect(() => setCurrentStatus(null), [setCurrentStatus]);

  const startImportDataset = async (projectPath: string) => {
    if (!client)
      setCurrentStatus({
        status: "error",
        text: "Unable to import the dataset",
      });
    // 1. get github url of project
    setCurrentStatus({ status: "importing", text: "Get new project data..." });
    const fetchProject = await client.getProject(projectPath);
    const urlProjectOrigin = fetchProject?.data?.all?.web_url; // same as externalUrl
    if (!urlProjectOrigin) {
      setCurrentStatus({
        status: "error",
        text: "Something went wrong in the creation of the project, the project is invalid",
      });
      return false;
    }
    const default_branch = fetchProject?.data?.all?.default_branch;
    // 2. create project object for importing
    const project = {
      default_branch,
      value: urlProjectOrigin,
      name: projectPath,
    };
    setNewProject(project);
    // 3. send to import dataset
    handlers.submitCallback(project);
  };

  const addDatasetStatus = currentStatus ? (
    <DatasetAddToProjectStatus
      status={currentStatus.status}
      text={currentStatus.text}
      projectName={project?.name}
    />
  ) : null;

  if (!dataset) return null;

  // if data is not ready display a loader
  if (!model || !client) return <Loader />;

  // do not display form if is an import in process, error or the dataset is not valid
  const form =
    importingDataset ||
    !isDatasetValid ||
    ["inProcess", "importing", "error"].includes(
      currentStatus?.status ?? ""
    ) ? null : (
      <NewProject
        key="newProject"
        model={model}
        importingDataset={true}
        startImportDataset={startImportDataset}
        user={user}
        client={client}
      />
    );

  // in case the import fail indicate that the project was created
  const extraInfo =
    !importingDataset && currentStatus?.status === "error" ? (
      <WarnAlert timeout={0} dismissible={false}>
        <div>
          The project was created correctly but it was not possible to import
          the dataset.
          <br />
          You can view the project{" "}
          <i className="pt-2">
            <Link to={`/projects/${newProject?.name}`}>here</Link>{" "}
          </i>
          or try again to import the dataset using the <b>Existing Project</b>{" "}
          option.
        </div>
      </WarnAlert>
    ) : null;

  return (
    <div className="mt-4">
      {form}
      {addDatasetStatus}
      {extraInfo}
    </div>
  );
}

export default AddDatasetNewProject;
