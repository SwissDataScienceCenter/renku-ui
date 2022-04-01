/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  renku-ui
 *
 *  DatasetAdd.present.js
 *  Presentational components.
 */


import React, { useState } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";
import { Row, Col } from "reactstrap";
import { Button } from "reactstrap";
import { ButtonGroup, Table } from "reactstrap/lib";

import { AddDatasetExistingProject } from "./addDatasetExistingProject";
import { AddDatasetNewProject } from "./addDatasetNewProject";
import { getDatasetAuthors } from "../DatasetFunctions";
import { DatasetError } from "../DatasetError";
import { Loader } from "../../utils/components/Loader";

function HeaderAddDataset({ dataset }) {
  if (!dataset) return null;
  const authors = getDatasetAuthors(dataset);
  return (
    <>
      <h2>Add dataset to project</h2>
      <Table className="mb-4 table-borderless" size="sm">
        <tbody className="text-rk-text">
          <tr>
            <td className="text-dark fw-bold" style={{ "width": "120px" }}>Title:</td>
            <td data-cy="add-dataset-to-project-title">{ dataset?.title || dataset?.name }</td>
          </tr>
          <tr>
            <td className="text-dark fw-bold" style={{ "width": "120px" }}>Authors:</td>
            <td>{ authors }</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

function DatasetAdd({ dataset, model, handlers, isDatasetValid, currentStatus, importingDataset, insideProject }) {
  const [isNewProject, setIsNewProject] = useState(false);
  const logged = useSelector((state) => state.stateModel.user.logged);

  const buttonGroup = (
    <ButtonGroup className="d-flex">
      <Button disabled={currentStatus?.status === "inProcess"}
        data-cy="add-dataset-existing-project-option-button"
        color="primary" outline active={!isNewProject} onClick={() => setIsNewProject(false)}>
        Existing Project
      </Button>
      <Button disabled={currentStatus?.status === "inProcess"}
        data-cy="add-dataset-new-project-option-button"
        color="primary" outline active={isNewProject} onClick={() => setIsNewProject(true)}>
        New Project
      </Button>
    </ButtonGroup>
  );
  const formToDisplay = !isNewProject ?
    (<AddDatasetExistingProject
      handlers={handlers}
      model={model}
      dataset={dataset}
      currentStatus={currentStatus}
      isDatasetValid={isDatasetValid}
      importingDataset={importingDataset}
    />) : <AddDatasetNewProject
      handlers={handlers}
      model={model}
      dataset={dataset}
      currentStatus={currentStatus}
      isDatasetValid={isDatasetValid}
      importingDataset={importingDataset}
    />;

  if (!dataset) return <Loader />;
  if (!dataset?.exists) {
    if (!_.isEmpty(dataset?.fetchError)) {
      return (
        <DatasetError
          fetchError={dataset?.fetchError}
          insideProject={insideProject}
          logged={logged}
        />
      );
    }
  }
  return (
    <>
      <Row className="mb-3">
        <Col sm={10} md={9} lg={8} xl={7}>
          <HeaderAddDataset dataset={dataset} />
          {buttonGroup}
          {formToDisplay}
        </Col>
      </Row>
    </>
  );
}

export default DatasetAdd;
