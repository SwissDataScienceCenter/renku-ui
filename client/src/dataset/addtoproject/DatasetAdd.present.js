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
import { ButtonGroup, Table } from "reactstrap";

import { AddDatasetExistingProject } from "./addDatasetExistingProject";
import { AddDatasetNewProject } from "./addDatasetNewProject";
import { getDatasetAuthors } from "../DatasetFunctions";
import { DatasetError } from "../DatasetError";
import { Loader } from "../../utils/components/Loader";
import LoginAlert from "../../utils/components/loginAlert/LoginAlert";
import { ContainerWrap } from "../../App";

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
  const logged = useSelector((state) => state.user.logged);

  // Return early if there is no dataset
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

  // Set different content for logged and anonymous users
  let mainContent = null;
  if (logged) {
    const disabled = ["inProcess", "importing"].includes(currentStatus?.status) ? true : false;
    const buttonGroup = (
      <ButtonGroup className="d-flex">
        <Button disabled={disabled}
          data-cy="add-dataset-existing-project-option-button"
          color="primary" outline active={!isNewProject} onClick={() => setIsNewProject(false)}>
          Existing Project
        </Button>
        <Button disabled={disabled}
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
      />) :
      (<AddDatasetNewProject
        handlers={handlers}
        model={model}
        dataset={dataset}
        currentStatus={currentStatus}
        isDatasetValid={isDatasetValid}
        importingDataset={importingDataset}
      />);
    mainContent = (<>{buttonGroup}{formToDisplay}</>);
  }
  else {
    const textIntro = "Only authenticated users can create new projects.";
    const textPost = "to create new project with dataset.";
    mainContent = (<LoginAlert logged={logged} textIntro={textIntro} textPost={textPost} />);
  }

  return (
    <ContainerWrap>
      <Row className="mb-3">
        <Col md={10} lg={9} xl={8}>
          <HeaderAddDataset dataset={dataset} />
          {mainContent}
        </Col>
      </Row>
    </ContainerWrap>
  );
}

export default DatasetAdd;
