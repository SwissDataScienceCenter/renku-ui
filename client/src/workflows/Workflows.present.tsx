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

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSortAmountDown, faSortAmountUp } from "@fortawesome/free-solid-svg-icons";

import EntityHeader from "../utils/components/entityHeader/EntityHeader";
import ListDisplay from "../utils/components/List";
import {
  Button, ButtonDropdown, Col, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Row
} from "../utils/ts-wrappers";
import { CoreErrorAlert } from "../utils/components/errors/CoreErrorAlert";
import { EntityType } from "../utils/components/entities/Entities";
import { Loader } from "../utils/components/Loader";
import { WarnAlert } from "../utils/components/Alert";


interface WorkflowsListFiltersProps {
  ascending: boolean;
  excludeInactive: boolean;
  orderBy: string;
  orderByMatrix: Record<string, string>,
  setOrderBy: Function;
  toggleAscending: Function;
  toggleExcludeInactive: Function;
}

function WorkflowsListFilters({
  ascending, excludeInactive, orderBy, orderByMatrix, setOrderBy, toggleAscending, toggleExcludeInactive
}: WorkflowsListFiltersProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const toggleSortDropdownOpen = () => { setSortDropdownOpen((sortDropdownOpen) => !sortDropdownOpen); };

  const dropdownItems = Object.keys(orderByMatrix).map(item => {
    return (
      <DropdownItem key={item} value={item} onClick={() => { setOrderBy(item); }}>
        {orderBy === item ? <FontAwesomeIcon icon={faCheck} /> : null} {orderByMatrix[item]}
      </DropdownItem>
    );
  });

  return (
    <Row className="my-3">
      <Col xs={12} sm="auto" className="my-auto">
        <div className="form-check form-switch d-inline-block">
          <Label className="text-rk-text me-2">Show inactive</Label>
          <Input type="switch"
            id="wfExcludeInactive" label="label here" className="form-check-input rounded-pill"
            checked={!excludeInactive} onChange={() => toggleExcludeInactive()}
          />
        </div>
      </Col>
      <Col xs={12} sm="auto" className="my-auto">
        <Label className="text-rk-text me-2">Order by:</Label>
        <ButtonDropdown
          className="me-2"
          toggle={toggleSortDropdownOpen}
          isOpen={sortDropdownOpen}>
          <DropdownToggle caret color="rk-light">{orderByMatrix[orderBy]}</DropdownToggle>
          <DropdownMenu>{ dropdownItems }</DropdownMenu>
        </ButtonDropdown>
        <Button color="rk-white" onClick={() => toggleAscending()}>
          {ascending ?
            <FontAwesomeIcon className="m-0" icon={faSortAmountUp} /> :
            <FontAwesomeIcon className="m-0" icon={faSortAmountDown} />
          }
        </Button>
      </Col>
    </Row>
  );
}


function UnsupportedWorkflows() {
  return (
    <div>
      <WarnAlert dismissible={false}>
        <p>
          Interacting with workflows in the UI requires updating your project to a newer version.
        </p>
        {/*
        // ! TODO: add link to status overview
        <p>
          {updateInfo} should resolve the problem.
          <br />The <Link to={overviewStatusUrl}>Project status</Link> page provides further information.
        </p> */}
      </WarnAlert>
    </div>
  );
}


interface WorkflowsListProps {
  ascending: boolean;
  excludeInactive: boolean;
  orderBy: string;
  orderByMatrix: Record<string, string>,
  setOrderBy: Function;
  toggleAscending: Function;
  toggleExcludeInactive: Function;
  unsupported: boolean;
  waiting: boolean;
  workflows: Record<string, any>;
}

function orderWorkflows(
  workflows: Array<Record<string, any>>, orderBy: string, ascending: boolean, excludeInactive: boolean
) {
  const filtered = excludeInactive ? workflows.filter(w => w.active) : workflows;
  const sorted = filtered.sort((a, b) => (a[orderBy] > b[orderBy]) ? 1 : ((b[orderBy] > a[orderBy]) ? -1 : 0));
  return ascending ? sorted : sorted.reverse();
}

function WorkflowsList({
  ascending, excludeInactive, orderBy, orderByMatrix, setOrderBy, toggleAscending,
  toggleExcludeInactive, unsupported, waiting, workflows
}: WorkflowsListProps) {
  // return immediately when workflows are not supported in the current project
  if (unsupported) return (<UnsupportedWorkflows />);

  // show status: loading or error or full content
  const loading = waiting || (!workflows.fetched);
  let content: React.ReactNode;
  if (loading) {
    content = (<Loader />);
  }
  else if (workflows.error) {
    content = (<CoreErrorAlert error={workflows.error} />);
  }
  else {
    content = (
      <ListDisplay
        itemsType="workflow"
        search={null}
        currentPage={null}
        gridDisplay={true}
        totalItems={workflows.list.length}
        perPage={workflows.list.length}
        items={orderWorkflows(workflows.list, orderBy, ascending, excludeInactive)}
      />
    );
  }

  return (
    <div>
      <h3>Workflows List</h3>
      <WorkflowsListFilters
        ascending={ascending}
        excludeInactive={excludeInactive}
        orderBy={orderBy}
        orderByMatrix={orderByMatrix}
        setOrderBy={setOrderBy}
        toggleAscending={toggleAscending}
        toggleExcludeInactive={toggleExcludeInactive} />
      {content}
    </div>
  );
}


interface WorkflowDetailProps {
  waiting: boolean;
  workflow: Record<string, any>;
  workflowId: string;
}

function WorkflowDetail({ waiting, workflow, workflowId }: WorkflowDetailProps) {
  const loading = waiting || (!workflow.fetched);

  let content: React.ReactNode;
  if (loading) {
    content = (<Loader />);
  }
  else if (workflow.error) {
    content = (<CoreErrorAlert error={workflow.error} />);
  }
  else {
    content = (
      <Col className="mb-4">
        <EntityHeader
          title={workflow.details.name}
          description={workflow.details.description}
          itemType={"workflow" as EntityType}
          tagList={workflow.details.keywords}
          creators={workflow.details.creators}
          labelCaption="created"
          timeCaption={workflow.details.created}
          devAccess={false}
          url="" launchNotebookUrl="" sessionAutostartUrl=""
        // links={linksHeader}
        // otherButtons={[deleteOption, modifyButton, addToProject]}
        />
      </Col>
    );
  }

  return (<div>{content}</div>);
}


export { WorkflowDetail, WorkflowsList };
