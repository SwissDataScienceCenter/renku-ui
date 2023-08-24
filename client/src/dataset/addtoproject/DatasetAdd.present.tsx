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

import { useState } from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import _ from "lodash";
import { Row, Col } from "reactstrap";
import { Button } from "reactstrap";
import { ButtonGroup, Table } from "reactstrap";

import AddDatasetExistingProject from "./DatasetAddToExistingProject";
import AddDatasetNewProject from "./DatasetAddToNewProject";
import { getDatasetAuthors } from "../DatasetFunctions";
import { DatasetError } from "../DatasetError";
import { Loader } from "../../components/Loader";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { ContainerWrap } from "../../App";

import {
  AddDatasetDataset,
  AddDatasetHandlers,
  AddDatasetStatus,
} from "./DatasetAdd.types";

type HeaderAddDatasetProps = {
  dataset: AddDatasetDataset;
};

function HeaderAddDataset({ dataset }: HeaderAddDatasetProps) {
  if (!dataset) return null;
  const authors = getDatasetAuthors(dataset);
  return (
    <>
      <h2>Add dataset</h2>
      <p>
        Add the dataset to an already existing project, or create a new project
        and add the dataset to it.
      </p>
      <Table className="mb-4 table-borderless" size="sm">
        <tbody className="text-rk-text">
          <tr>
            <td className="text-dark fw-bold" style={{ width: "120px" }}>
              Dataset Title
            </td>
            <td data-cy="add-dataset-to-project-title">
              {dataset?.title || dataset?.name}
            </td>
          </tr>
          <tr>
            <td className="text-dark fw-bold" style={{ width: "120px" }}>
              Authors
            </td>
            <td>{authors}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

function DatasetAddMainContent({
  dataset,
  model,
  handlers,
  isDatasetValid,
  currentStatus,
  importingDataset,
}: Omit<DatasetAddProps, "insideProject">) {
  const [isNewProject, setIsNewProject] = useState(false);
  const logged = useSelector(
    (state: RootStateOrAny) => state.stateModel.user.logged
  );
  if (!logged) {
    const textIntro = "Only authenticated users can create new projects.";
    const textPost = "to create new project with dataset.";
    return (
      <LoginAlert logged={logged} textIntro={textIntro} textPost={textPost} />
    );
  }
  const disabled = ["inProcess", "importing"].includes(
    currentStatus?.status || ""
  )
    ? true
    : false;
  const formToDisplay = !isNewProject ? (
    <AddDatasetExistingProject
      handlers={handlers}
      dataset={dataset}
      currentStatus={currentStatus}
      isDatasetValid={isDatasetValid}
      importingDataset={importingDataset}
    />
  ) : (
    <AddDatasetNewProject
      handlers={handlers}
      model={model}
      dataset={dataset}
      currentStatus={currentStatus}
      isDatasetValid={isDatasetValid}
      importingDataset={importingDataset}
    />
  );
  return (
    <>
      <ButtonGroup className="d-flex">
        <Button
          disabled={disabled}
          data-cy="add-dataset-existing-project-option-button"
          className="btn-rk-green"
          active={!isNewProject}
          onClick={() => setIsNewProject(false)}
        >
          Existing Project
        </Button>
        <Button
          disabled={disabled}
          data-cy="add-dataset-new-project-option-button"
          className="btn-rk-green"
          active={isNewProject}
          onClick={() => setIsNewProject(true)}
        >
          New Project
        </Button>
      </ButtonGroup>
      {formToDisplay}
    </>
  );
}

type DatasetAddProps = {
  dataset: AddDatasetDataset | null;
  model: unknown;
  handlers: AddDatasetHandlers;
  isDatasetValid: boolean | null;
  currentStatus: AddDatasetStatus | null;
  importingDataset: boolean;
  insideProject: boolean;
};
function DatasetAdd(props: DatasetAddProps) {
  const { dataset, insideProject } = props;
  const logged = useSelector(
    (state: RootStateOrAny) => state.stateModel.user.logged
  );

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

  return (
    <ContainerWrap>
      <Row className="mb-3">
        <Col md={3}>
          <HeaderAddDataset dataset={dataset} />
        </Col>
        <Col md={9} xl={8} className="form-rk-green">
          <DatasetAddMainContent {...props} />
        </Col>
      </Row>
    </ContainerWrap>
  );
}

export default DatasetAdd;
