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
import { FontAwesomeIcon, } from "@fortawesome/react-fontawesome";
import {
  faCheck, faExclamationTriangle, faInfoCircle, faSortAmountDown, faSortAmountUp, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import {
  Button, ButtonDropdown, Card, CardBody, Col, CardHeader, DropdownItem, DropdownMenu,
  DropdownToggle, Input, Label, PopoverBody, Row, UncontrolledPopover, Table
} from "../utils/ts-wrappers";

import EntityHeader from "../utils/components/entityHeader/EntityHeader";
import Time from "../utils/helpers/Time";
import { CoreErrorAlert } from "../utils/components/errors/CoreErrorAlert";
import { Docs } from "../utils/constants/Docs";
import { EntityType } from "../utils/components/entities/Entities";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { Loader } from "../utils/components/Loader";
import { Url } from "../utils/helpers/url";
import { TreeBrowser, TreeDetails } from "../utils/components/Tree";
import { WarnAlert } from "../utils/components/Alert";


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
                  {" "}for more details
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

  // ? Pre-sort by a unique prop to guarantee consistency
  const preSorted = filtered.sort((a, b) => (a["name"] > b["name"]) ? 1 : ((b["name"] > a["name"]) ? -1 : 0));
  // ? Then second-sort by last execution
  const secondSorted = preSorted.sort((a, b) => (a["lastExecuted"] > b["lastExecuted"]) ? 1 :
    ((b["lastExecuted"] > a["lastExecuted"]) ? -1 : 0));

  // ? Final sorting
  const sorted = secondSorted.sort((a, b) => (a[orderBy] > b[orderBy]) ? 1 : ((b[orderBy] > a[orderBy]) ? -1 : 0));
  return ascending ? sorted : sorted.reverse();
}


interface WorkflowsTreeBrowserProps {
  ascending: boolean;
  expanded: string[];
  fullPath: string;
  orderBy: string;
  orderByMatrix: Record<string, string>,
  selected: string;
  selectedAvailable: boolean;
  setOrderBy: Function;
  showInactive: boolean;
  toggleAscending: Function;
  toggleExpanded: Function;
  toggleInactive: Function;
  unsupported: boolean;
  waiting: boolean;
  workflow: Record<string, any>;
  workflows: Record<string, any>;
}

function WorkflowsTreeBrowser({
  ascending, expanded, fullPath, orderBy, orderByMatrix, selected, selectedAvailable, setOrderBy,
  showInactive, toggleAscending, toggleInactive, toggleExpanded, unsupported, waiting, workflow, workflows
}: WorkflowsTreeBrowserProps) {
  // return immediately when workflows are not supported in the current project
  if (unsupported)
    return (<UnsupportedWorkflows fullPath={fullPath} />);

  // show status: loading or error or full content
  const loading = waiting || (!workflows.fetched);
  const shrunk = selectedAvailable && !!selected;
  let content: React.ReactNode;
  if (loading) {
    content = (<Loader />);
  }
  else if (workflows.error) {
    content = (<CoreErrorAlert error={workflows.error} />);
  }
  else {
    const treeBrowser = (
      <TreeBrowser
        expanded={expanded}
        items={orderWorkflows(workflows.list, orderBy, ascending, showInactive)}
        selected={selected}
        shrunk={shrunk}
        toggleExpanded={toggleExpanded}
      />
    );

    if (!shrunk) {
      content = treeBrowser;
    }
    else {
      const waitingDetails = waiting || workflow.fetching || !workflow.fetched;
      content = (
        <Row>
          <Col xs={12} md={5} lg={4}>
            {treeBrowser}
          </Col>
          <Col fluid="true">
            <WorkflowDetail
              fullPath={fullPath}
              selectedAvailable={selectedAvailable}
              waiting={waitingDetails}
              workflow={workflow}
              workflowId={selected} />
          </Col>
        </Row>
      );
    }
  }

  return (
    <div>
      <h3>Workflows</h3>
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
  fullPath: string;
  selectedAvailable: boolean;
  waiting: boolean;
  workflow: Record<string, any>;
  workflowId: string;
}

function WorkflowDetail({ fullPath, selectedAvailable, waiting, workflow, workflowId }: WorkflowDetailProps) {
  const backUrl = Url.get(Url.pages.project.workflows, { namespace: "", path: fullPath });
  const backElement = (
    <div>
      <Link to={backUrl}>
        <FontAwesomeIcon className="cursor-pointer" icon={faTimesCircle} />
      </Link>
    </div>
  );

  let content: React.ReactNode;
  if (waiting) {
    content = (<WorkflowDetailPlaceholder backElement={backElement} waiting={true} />);
  }
  else if (workflow.error) {
    content = (<WorkflowDetailPlaceholder backElement={backElement} error={workflow.error} />);
  }
  else if (workflowId && !selectedAvailable) {
    content = (<WorkflowDetailPlaceholder backElement={backElement} unknown={true} />);
  }
  else {
    content = (
      <TreeDetails>
        <WorkflowTreeDetail
          backElement={backElement}
          waiting={waiting}
          workflow={workflow}
          workflowId={workflowId} />
      </TreeDetails>
    );
  }

  return (<>{content}</>);
}


interface WorkflowTreeDetailsProps {
  backElement: React.ReactNode;
  waiting: boolean;
  workflow: Record<string, any>;
  workflowId: string;
}

function WorkflowTreeDetail({
  backElement, waiting, workflow, workflowId
}: WorkflowTreeDetailsProps) {
  const executions = workflow.details?.executions ?
    (<Col xs={12} lg={6}>
      <span className="text-dark">
        <span className="fw-bold">Number of Executions</span>
        {workflow.details.executions}
      </span>
    </Col>) :
    null;
  return (
    <>
      <Card className="rk-tree-details mb-3">
        <div className="rk-tree-details-back">
          <div className="rk-tree-details-back-container">{backElement}</div>
        </div>
        <EntityHeader
          creators={workflow.details.creators}
          description={workflow.details.description}
          devAccess={false}
          itemType={"workflow" as EntityType}
          labelCaption="created"
          launchNotebookUrl=""
          sessionAutostartUrl=""
          showFullHeader={false}
          tagList={workflow.details.keywords}
          timeCaption={workflow.details.created}
          title={workflow.details.name}
          url=""
        />
      </Card>

      <Card className="rk-tree-details mb-3">
        <CardHeader className="bg-white">
          <h3 className="my-2">Details</h3>
        </CardHeader>
        <CardBody>
          <Row>
            {executions}
          </Row>
          <Table className="mb-4 table-borderless" size="sm">
            <tbody className="text-rk-text">
              <tr>
                <td className="text-dark fw-bold" style={{ "width": "200px" }}>
                  Number of Executions
                </td>
                <td>
                  {workflow.details.number_of_executions}
                </td>
              </tr>
              <tr>
                <td className="text-dark fw-bold" style={{ "width": "200px" }}>
                  Last Execution
                </td>
                <td>
                  {
                    workflow.details?.last_executed ?
                      Time.toIsoTimezoneString(workflow.details.last_executed) :
                      null
                  }
                </td>
              </tr>
              <tr>
                <td className="text-dark fw-bold" style={{ "width": "200px" }}>
                  Type
                </td>
                <td>
                  {workflow.details.type}
                </td>
              </tr>
              <tr>
                <td className="text-dark fw-bold" style={{ "width": "200px" }}>
                  Full Command
                </td>
                <td>
                  <code>
                    {workflow.details.full_command}
                  </code>
                </td>
              </tr>
              {workflow.details.id != workflow.details.latest
                ?
                <tr>
                  <td className="text-dark fw-bold" style={{ "width": "200px" }}></td>
                  <td>
                    You are viewing an outdated version of this Workflow Plan.&nbsp;
                    {/* <Link to={Url.get(Url.pages.project.workflows.single, {
                      // TODO: Use PLANS_PREFIX here
                      namespace: "", path: fullPath, target: "/" + workflow.details.latest.replace("/plans/", "")
                    })}
                      className="col text-decoration-none">
                      Go to newest version
                    </Link> */}
                  </td>
                </tr>
                : null
              }
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}

interface WorkflowDetailPlaceholderProps {
  backElement: React.ReactNode;
  error?: Record<string, any>;
  unknown?: boolean;
  waiting?: boolean;
}

function WorkflowDetailPlaceholder({
  backElement, error, unknown, waiting
}: WorkflowDetailPlaceholderProps) {
  let content: React.ReactNode;
  if (waiting) {
    content = (<>
      <div className="float-end m-1">{backElement}</div>
      <div className="d-flex">
        <p className="m-auto mt-1">Loading workflow details...</p>
      </div>
      <Loader />
    </>);
  }
  else if (error) {
    content = (<>
      <div className="float-end m-1">{backElement}</div>
      <div className="d-flex">
        <p className="m-auto mb-3 mt-1">A problem occurred while getting the workflow details.</p>
      </div>
      <CoreErrorAlert error={error} />
    </>);
  }
  else if (unknown) {
    content = (<>
      <div className="float-end m-1">{backElement}</div>
      <div className="d-flex">
        <p className="m-auto mt-1">
          <FontAwesomeIcon icon={faExclamationTriangle} /> We cannot find the
          workflow you are looking for.
        </p>
        <p className="m-auto mb-1">You can use the navbar to pick another one.</p>
      </div>
    </>);
  }

  return (<Card><CardBody>{content}</CardBody></Card>);
}


export { WorkflowDetail, WorkflowsTreeBrowser };
