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
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faInfoCircle, faSortAmountDown, faSortAmountUp } from "@fortawesome/free-solid-svg-icons";

import EntityHeader from "../utils/components/entityHeader/EntityHeader";
import {
  Button, ButtonDropdown, Col, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Row,
  UncontrolledPopover, PopoverBody
} from "../utils/ts-wrappers";
import { CoreErrorAlert } from "../utils/components/errors/CoreErrorAlert";
import { Docs } from "../utils/constants/Docs";
import { EntityType } from "../utils/components/entities/Entities";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { Loader } from "../utils/components/Loader";
import { WarnAlert } from "../utils/components/Alert";
import { Url } from "../utils/helpers/url";
import { TreeBrowser } from "../utils/components/Tree";


interface WorkflowsListFiltersProps {
  ascending: boolean;
  orderBy: string;
  orderByMatrix: Record<string, string>,
  setOrderBy: Function;
  showInactive: boolean;
  toggleAscending: Function;
  toggleInactive: Function;
}

function WorkflowsListFilters({
  ascending, orderBy, orderByMatrix, setOrderBy, showInactive, toggleAscending, toggleInactive
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
          <Label className="text-rk-text me-2">
            Show inactive{" "}
            <FontAwesomeIcon id="showInactiveInfo" className="cursor-pointer align-middle" icon={faInfoCircle} />
            <UncontrolledPopover target="showInactiveInfo" trigger="legacy" placement="bottom">
              {/* <PopoverHeader>{repository.name} templates</PopoverHeader> */}
              <PopoverBody className="p-2">
                <p className="mb-1">
                  Inactive workflows don&apos;t have files in the branch&apos;s head
                </p>
                <p className="mb-0">
                  You can{" "}
                  <ExternalLink
                    role="text" iconSup={true} iconAfter={true} title="check our documentation"
                    url={Docs.rtdHowToGuide("404-missing-link")}
                  />
                  {" "}for mode details
                </p>
              </PopoverBody>
            </UncontrolledPopover>
          </Label>
          <Input type="switch"
            id="wfExcludeInactive" label="label here" className="form-check-input rounded-pill"
            checked={showInactive} onChange={() => toggleInactive()}
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


interface UnsupportedWorkflowsProps {
  fullPath: string;
}

function UnsupportedWorkflows({ fullPath }: UnsupportedWorkflowsProps) {
  const updateUrl = Url.get(Url.pages.project.overview.status, { namespace: "", path: fullPath });

  return (
    <div>
      <WarnAlert dismissible={false}>
        <p>
          Interacting with workflows in the UI requires updating your project to a newer version.
        </p>
        <p className="mb-0">
        The <Link to={updateUrl}>Project status</Link> page provides further information.
        </p>
      </WarnAlert>
    </div>
  );
}


function orderWorkflows(
  workflows: Array<Record<string, any>>, orderBy: string, ascending: boolean, showInactive: boolean
) {
  const filtered = !showInactive ? workflows.filter(w => w.active) : workflows;
  // ? we pre-sort by name to guarantee consistency since some properties could be identical
  const preSorted = filtered.sort((a, b) => (a["name"] > b["name"]) ? 1 : ((b["name"] > a["name"]) ? -1 : 0));
  const sorted = preSorted.sort((a, b) => (a[orderBy] > b[orderBy]) ? 1 : ((b[orderBy] > a[orderBy]) ? -1 : 0));
  return ascending ? sorted : sorted.reverse();
}


interface WorkflowsTreeBrowserProps {
  ascending: boolean;
  expanded: string[];
  fullPath: string;
  orderBy: string;
  orderByMatrix: Record<string, string>,
  selected: string;
  setOrderBy: Function;
  showInactive: boolean;
  toggleAscending: Function;
  toggleExpanded: Function;
  toggleInactive: Function;
  unsupported: boolean;
  waiting: boolean;
  workflows: Record<string, any>;
}

function WorkflowsTreeBrowser({
  ascending, expanded, fullPath, orderBy, orderByMatrix, selected, setOrderBy, showInactive, toggleAscending,
  toggleInactive, toggleExpanded, unsupported, waiting, workflows
}: WorkflowsTreeBrowserProps) {
  // return immediately when workflows are not supported in the current project
  if (unsupported)
    return (<UnsupportedWorkflows fullPath={fullPath} />);

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
      <TreeBrowser
        expanded={expanded}
        items={orderWorkflows(workflows.list, orderBy, ascending, showInactive)}
        selected={selected}
        toggleExpanded={toggleExpanded}
      />
    );
  }

  return (
    <div>
      <h3>Workflows List</h3>
      <WorkflowsListFilters
        ascending={ascending}
        orderBy={orderBy}
        orderByMatrix={orderByMatrix}
        setOrderBy={setOrderBy}
        showInactive={showInactive}
        toggleAscending={toggleAscending}
        toggleInactive={toggleInactive} />
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
        />
      </Col>
    );
  }

  return (<div>{content}</div>);
}


export { WorkflowDetail, WorkflowsTreeBrowser };
