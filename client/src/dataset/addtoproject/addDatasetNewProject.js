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

import React, { useContext, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { AddDatasetStatus } from "./addDatasetStatus";
import { NewProject } from "../../project/new";
import { Loader } from "../../utils/components/Loader";
import { WarnAlert } from "../../utils/components/Alert";
import AppContext from "../../utils/context/appContext";

/**
 *  incubator-renku-ui
 *
 *  AddDatasetNewProject
 *  Component for add dataset to new project
 */

const AddDatasetNewProject = (
  { dataset, model, handlers, isDatasetValid, currentStatus, importingDataset, project }) => {

  const [ newProject, setNewProject ] = useState(null);
  const setCurrentStatus = handlers.setCurrentStatus;
  const { client } = useContext(AppContext);
  const user = useSelector( (state) => state.stateModel.user);

  useEffect(() => setCurrentStatus(null), [setCurrentStatus]);

  const startImportDataset = async (projectPath) => {
    if (!client)
      setCurrentStatus({ status: "error", text: "Unable to import the dataset" });
    // 1. get github url of project
    setCurrentStatus({ status: "importing", text: "Get new project data..." });
    const fetchProject = await client.getProject(projectPath);
    const urlProjectOrigin = fetchProject?.data?.all?.http_url_to_repo;
    if (!urlProjectOrigin) {
      setCurrentStatus(
        { status: "error", text: "Something went wrong in the creation of the project, the project is invalid" });
      return false;
    }
    // 2. create project object for importing
    const project = { value: urlProjectOrigin, name: projectPath };
    setNewProject(project);
    // 3. send to import dataset
    handlers.submitCallback(project);
  };

  const addDatasetStatus = currentStatus ?
    <AddDatasetStatus
      status={currentStatus.status}
      text={currentStatus?.text || null}
      projectName={project?.name}
    /> : null;

  if (!dataset) return null;

  // if data is not ready display a loader
  if (!model || !client)
    return <Loader/>;

  // do not display form if is an import in process, error or the dataset is not valid
  const form = importingDataset || !isDatasetValid
    || ["inProcess", "importing", "error"].includes(currentStatus?.status) ? null :
    (
      <NewProject
        key="newProject"
        model={model}
        importingDataset={true}
        startImportDataset={startImportDataset}
        user={user}
      />
    );

  // in case the import fail indicate that the project was created
  const extraInfo = !importingDataset && currentStatus?.status === "error" ?
    (
      <WarnAlert timeout={0} dismissible={false}>
        <div>The project was created correctly but it was not possible to import the dataset.
          <br/>
          You can view the project <i className="pt-2"><Link to={`/projects/${newProject?.name}`}>here</Link>{" "}</i>
          or try again to import the dataset using the <b>Existing Project</b> option.
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
};

export { AddDatasetNewProject };
