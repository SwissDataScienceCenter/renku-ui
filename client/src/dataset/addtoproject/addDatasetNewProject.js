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
import { AddDatasetStatus } from "./addDatasetStatus";
import { NewProject } from "../../project/new";
import { AddDatasetContext } from "./DatasetAdd.container";
import { Loader } from "../../utils/components/Loader";
import { Link } from "react-router-dom";
import { InfoAlert } from "../../utils/components/Alert";

/**
 *  incubator-renku-ui
 *
 *  AddDatasetNewProject
 *  Component for add dataset to new project
 */

const AddDatasetNewProject = (props) => {
  const [ newProject, setNewProject ] = useState(null);
  const addDatasetContext = useContext(AddDatasetContext);
  const setCurrentStatus = addDatasetContext.setCurrentStatus;

  useEffect(() => setCurrentStatus(null), [setCurrentStatus]);

  const startImportDataset = async (projectPath) => {
    if (!addDatasetContext.client)
      setCurrentStatus({ status: "error", text: "Unable to import the dataset" });
    // 1. get github url of project
    setCurrentStatus({ status: "inProcess", text: "Get new project data..." });
    const fetchProject = await addDatasetContext.client.getProject(projectPath);
    const urlProjectOrigin = fetchProject?.data?.all?.http_url_to_repo;
    if (!urlProjectOrigin) {
      setCurrentStatus(
        { status: "error", text: "Something went wrong in the creation of the project, the project is invalid" });
      return false;
    }
    // 2. create project object for importing
    const project = { value: urlProjectOrigin, name: projectPath };
    setNewProject(project);
    // 3. send to import
    addDatasetContext.submitCallback(project);
  };

  const addDatasetStatus = addDatasetContext.currentStatus ?
    <AddDatasetStatus
      status={addDatasetContext.currentStatus.status}
      text={addDatasetContext.currentStatus?.text || null}
      projectName={props.project?.name}
    /> : null;

  if (!props.dataset) return null;

  const isDataReady = !(!addDatasetContext.model || !addDatasetContext.user || !addDatasetContext.client);

  if (!isDataReady)
    return <Loader/>;

  // do not display form if is an import in process, error or the dataset is not valid
  const form = addDatasetContext.importingDataset || !addDatasetContext.isDatasetValid
    || ["inProcess", "error"].includes(addDatasetContext.currentStatus?.status) ? null :
    (
      <NewProject
        key="newProject"
        client={addDatasetContext.client}
        model={addDatasetContext.model}
        user={addDatasetContext.user}
        templates={addDatasetContext.projectTemplate}
        history={addDatasetContext.history}
        location={addDatasetContext.location}
        importingDataset={true}
        startImportDataset={startImportDataset}
      />
    );

  // in case the import fail indicate that the project was created
  const extraInfo = !addDatasetContext.importingDataset && addDatasetContext.currentStatus?.status === "error" ?
    (
      <InfoAlert timeout={0} dismissible={false}>
        <div>The project was created correctly but it was not possible to import the dataset.
          <br/>
          You can view the project <i className="pt-2"><Link to={`/projects/${newProject?.name}`}>here</Link>{" "}</i>
          or try again to import the dataset using the <b>Existing Project</b> option.
        </div>
      </InfoAlert>
    ) : null;

  return (
    <div className="mt-4 mx-3">
      {form}
      { addDatasetStatus }
      {extraInfo}
    </div>
  );
};

export { AddDatasetNewProject };
