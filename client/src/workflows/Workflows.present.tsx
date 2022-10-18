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

import EntityCreators from "../utils/components/entities/Creators";
import Time from "../utils/helpers/Time";
import { Clipboard } from "../utils/components/Clipboard";
import { CoreErrorAlert } from "../utils/components/errors/CoreErrorAlert";
import { Docs } from "../utils/constants/Docs";
import { EntityType } from "../utils/components/entities/Entities";
import { ExternalDocsLink, ExternalLink } from "../utils/components/ExternalLinks";
import { Loader } from "../utils/components/Loader";
import { Url } from "../utils/helpers/url";
import { TreeBrowser, TreeDetails } from "../utils/components/Tree";
import { InfoAlert, WarnAlert } from "../utils/components/Alert";


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


function NoWorkflows() {
  return (
    <div>
      <p>There are no workflows in this project.</p>
      <InfoAlert timeout={0}>
        <p>Renku workflows is a key feature of Renku to make code and processing pipelines reusable.</p>
        <p>
          <ExternalDocsLink url={Docs.rtdTopicGuide("workflows.html")} title="Check out our documentation" />{" "}
          on workflows if you wish to learn more about this feature.
        </p>
      </InfoAlert>
    </div>
  );
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
  const emptyElement = (<NoWorkflows />);

  // show status: loading or error or full content
  const loading = waiting || (!workflows.fetched);
  const shrunk = selectedAvailable && !!selected || workflow.error;

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
        emptyElement={emptyElement}
        expanded={expanded}
        highlightedProp={orderBy in ["name", "workflowType"] ? "lastExecution" : orderBy}
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


interface WorkflowTreeDetailRowProps {
  children: React.ReactNode;
  name: string | React.ReactNode;
}

function WorkflowTreeDetailRow({
  children, name
}: WorkflowTreeDetailRowProps) {
  return (
    <tr>
      <td className="fw-bold short">{name}</td>
      <td>{children}</td>
    </tr>
  );
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
  const details = workflow.details ? workflow.details : {};
  const isComposite = details.type === "Plan" ? false : true;

  let typeSpecificRows: React.ReactNode;
  if (isComposite) {
    typeSpecificRows = (<>
      <WorkflowTreeDetailRow name="Number of children">
        {details.plans?.length}
      </WorkflowTreeDetailRow>
    </>);
  }
  else {
    typeSpecificRows = (<>
      <WorkflowTreeDetailRow name="Number of executions">
        {details.number_of_executions}
      </WorkflowTreeDetailRow>
      <WorkflowTreeDetailRow name="Last execution">
        {Time.toIsoTimezoneString(details.last_executed)}
      </WorkflowTreeDetailRow>
      <WorkflowTreeDetailRow name="Full command">
        <code className="mb-0">
          {details.full_command}
          <Clipboard clipboardText={details.full_command} />
        </code>
      </WorkflowTreeDetailRow>
    </>);
  }

  let newerAvailable: React.ReactNode = null;
  if (details.latestUrl) {
    newerAvailable = (
      <InfoAlert timeout={0}>
        <p>A new version of this workflow is available.</p>
        <p><Link className="btn btn-info btn-sm" to={details.latestUrl}>Click here</Link> to visualize it.</p>
      </InfoAlert>
    );
  }

  return (
    <>
      <Card className="rk-tree-details mb-3">
        <CardHeader className="bg-white">
          <div className="float-end m-2">{backElement}</div>
          <h3 className="my-2">{details.name}</h3>
        </CardHeader>

        <CardBody>
          {newerAvailable}
          <Table className="table-borderless rk-tree-table mb-0" size="sm">
            <tbody>
              <WorkflowTreeDetailRow name="Author(s)">
                {
                  details.creators?.length ?
                    (
                      <EntityCreators display="plain" creators={details.creators}
                        itemType={"workflow" as EntityType}
                      />
                    ) :
                    (<span className="fst-italic text-rk-text-light">Not available</span>)
                }
              </WorkflowTreeDetailRow>
              <WorkflowTreeDetailRow name="Description">
                {
                  details.description?.length ?
                    details.description :
                    (<span className="fst-italic text-rk-text-light">None</span>)
                }
              </WorkflowTreeDetailRow>
              <WorkflowTreeDetailRow name="Keywords">
                {
                  details.keywords?.length ?
                    // (<EntityTags multiline={true} tagList={details.keywords} />) :
                    (<>{ details.keywords.join(", ") }</>) :
                    (<span className="fst-italic text-rk-text-light">None</span>)
                }
              </WorkflowTreeDetailRow>
              <WorkflowTreeDetailRow name="Creation date">
                { Time.toIsoTimezoneString(details.created)}
              </WorkflowTreeDetailRow>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card className="rk-tree-details mb-3">
        <CardHeader className="bg-white">
          <h3 className="my-2">Details</h3>
        </CardHeader>
        <CardBody>
          <Table className="table-borderless rk-tree-table mb-0" size="sm">
            <tbody>
              <WorkflowTreeDetailRow name="Workflow type">
                {isComposite ? "Workflow (Composite)" : "Single step" }
              </WorkflowTreeDetailRow>
              <WorkflowTreeDetailRow name="Estimated runtime">
                {Time.getDuration(details.duration)}
              </WorkflowTreeDetailRow>
              {typeSpecificRows}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card className="rk-tree-details mb-3">
        <CardHeader className="bg-white">
          <h3 className="my-2">Visualization</h3>
        </CardHeader>
        <CardBody>
          <WorkflowDetailVisualizer />
        </CardBody>
      </Card>
    </>
  );
}

function WorkflowDetailVisualizer() {
  return (<p className="mb-0">Not implemented yet - Work in progress...</p>);
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
      <div className="d-flex">
        <p className="m-auto mt-1">Getting workflow details...</p>
      </div>
      <Loader />
    </>);
  }
  else if (error) {
    content = (<>
      <div className="d-flex">
        <p className="m-auto mb-3 mt-1">A problem occurred while getting the workflow details.</p>
      </div>
      <CoreErrorAlert error={error} />
    </>);
  }
  else if (unknown) {
    content = (<>
      <div className="d-flex">
        <p className="m-auto mt-1">
          <FontAwesomeIcon icon={faExclamationTriangle} /> We cannot find the
          workflow you are looking for.
        </p>
        <p className="m-auto mb-1">You can use the navbar to pick another one.</p>
      </div>
    </>);
  }

  return (
    <Card className="rk-tree-details mb-3">
      <CardHeader className="bg-white">
        <div className="float-end m-2">{backElement}</div>
        <h3 className="my-2">Loading details</h3>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  );
}


export { WorkflowDetail, WorkflowsTreeBrowser };
