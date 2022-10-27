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
  faCheck, faExclamationTriangle, faInfoCircle, faLink, faSortAmountDown, faSortAmountUp, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import {
  Button, ButtonDropdown, Card, CardBody, Col, CardHeader, DropdownItem, DropdownMenu,
  DropdownToggle, Input, Label, PopoverBody, Row, UncontrolledPopover, UncontrolledTooltip, Table
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
import { TreeBrowser, TreeDetails, TreeElement } from "../utils/components/Tree";
import { InfoAlert, WarnAlert } from "../utils/components/Alert";
import { simpleHash } from "../utils/helpers/HelperFunctions";


/** BROWSER **/

interface WorkflowsTreeBrowserProps {
  ascending: boolean;
  expanded: string[];
  fullPath: string;
  orderBy: string;
  orderByMatrix: Record<string, string>,
  selected: string;
  selectedAvailable: boolean;
  setDetailExpanded: Function;
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
  ascending, expanded, fullPath, orderBy, orderByMatrix, selected, selectedAvailable, setDetailExpanded, setOrderBy,
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
          <Col xs={12} md={7} lg={8}>
            <WorkflowDetail
              fullPath={fullPath}
              selectedAvailable={selectedAvailable}
              setDetailExpanded={setDetailExpanded}
              waiting={waitingDetails}
              workflow={workflow}
              workflowId={selected}
              workflows={workflows}
            />
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


/** FILTERS AND SPECIAL CASES **/

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

function orderWorkflows(
  workflows: Array<Record<string, any>>, orderBy: string, ascending: boolean, showInactive: boolean
) {
  const filtered = !showInactive ? workflows.filter(w => w.active) : workflows;

  // ? Pre-sort by a unique prop to guarantee consistency
  const preSorted = filtered.sort((a, b) => (a["name"] > b["name"]) ? 1 : ((b["name"] > a["name"]) ? -1 : 0));
  // ? Then second-sort by last execution
  const secondSorted = preSorted.sort((a, b) => (a["lastExecuted"] < b["lastExecuted"]) ? 1 :
    ((b["lastExecuted"] < a["lastExecuted"]) ? -1 : 0));

  // ? Final sorting
  const sorted = secondSorted.sort((a, b) => (a[orderBy] > b[orderBy]) ? 1 : ((b[orderBy] > a[orderBy]) ? -1 : 0));
  return ascending ? sorted : sorted.reverse();
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


/** DETAILS **/

interface WorkflowDetailProps {
  fullPath: string;
  selectedAvailable: boolean;
  setDetailExpanded: Function;
  waiting: boolean;
  workflow: Record<string, any>;
  workflowId: string;
  workflows: Record<string, any>;
}

function WorkflowDetail({
  fullPath, selectedAvailable, setDetailExpanded, waiting, workflow, workflowId, workflows
}: WorkflowDetailProps) {
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
          fullPath={fullPath}
          setDetailExpanded={setDetailExpanded}
          waiting={waiting}
          workflow={workflow}
          workflowId={workflowId}
          workflows={workflows}
        />
      </TreeDetails>
    );
  }

  return (<div id="workflowsDetailsContent">{content}</div>);
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
  fullPath: string;
  setDetailExpanded: Function;
  waiting: boolean;
  workflow: Record<string, any>;
  workflowId: string;
  workflows: Record<string, any>;
}

function WorkflowTreeDetail({
  backElement, fullPath, setDetailExpanded, waiting, workflow, workflowId, workflows
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
              <WorkflowTreeDetailRow name="Renku command">
                <code className="mb-0">
                  {details.renkuCommand}
                  <Clipboard clipboardText={details.renkuCommand} />
                </code>
              </WorkflowTreeDetailRow>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card className="rk-tree-details mb-3">
        <CardHeader className="bg-white">
          <h3 className="my-2">Visualization</h3>
        </CardHeader>
        <CardBody>
          <WorkflowDetailVisualizer
            details={details}
            expanded={workflow.expanded}
            fullPath={fullPath}
            isComposite={isComposite}
            setDetailExpanded={setDetailExpanded}
            workflows={workflows}
          />
        </CardBody>
      </Card>
    </>
  );
}


/** VISUALIZER **/


function UnavailableDetail({ className = "", text = "None" }) {
  return (
    <span className={`fst-italic text-rk-text-light ${className}`}>{text}</span>
  );
}

interface WorkflowDetailVisualizerProps {
  details: Record<string, any>;
  expanded: Record<string, any>
  fullPath: string;
  isComposite: boolean;
  setDetailExpanded: Function;
  workflows: Record<string, any>;
}

function WorkflowDetailVisualizer({
  details, expanded, fullPath, isComposite, setDetailExpanded, workflows
}: WorkflowDetailVisualizerProps) {
  const command = details.command ?
    (<code className="mb-0">{details.command} <Clipboard clipboardText={details.command} /></code>) :
    (<UnavailableDetail />);

  if (isComposite) {
    // compute the children -- we can use a different visualization if we wish
    const childrenWorkflowsIds = details.plans?.length ? details.plans.map((p: Record<string, any>) => p.id) : [];
    const childrenWorkflowsObjects = workflows.list.filter(
      (w: Record<string, any>) => childrenWorkflowsIds.includes(w.id)
    );
    const childrenWorkflowsElements = childrenWorkflowsObjects.map((w: any) => {
      let newProps: Record<string, any> = {
        embed: true,
        expanded: [],
        items: workflows.list,
        uniqueId: `wf-children-details-${w.workflowId}`,
        toggleExpanded: () => { }
      };
      return (<TreeElement key={"wf-children-details-" + w.workflowId} {...w} {...newProps} />);
    });
    return (<>
      <Row>
        <WorkflowVisualizerSimpleBox large={true} title="Steps">
          {childrenWorkflowsElements}
        </WorkflowVisualizerSimpleBox>
        <WorkflowVisualizerSimpleBox large={true} title="Mappings">
          <VisualizerMappings data={details.mappings} expanded={expanded}
            setDetailExpanded={setDetailExpanded} workflows={workflows} />
        </WorkflowVisualizerSimpleBox>
        {/* <WorkflowVisualizerSimpleBox large={true} title="Links">
          <p className="p-2 m-0">LINKS -- not implemented yet...</p>
        </WorkflowVisualizerSimpleBox> */}
      </Row>
      <VisualizerMappingExpanded data={expanded} workflows={workflows} />
    </>);
  }

  return (<>
    <Table className="table-borderless rk-tree-table mb-3" size="sm">
      <tbody>
        <WorkflowTreeDetailRow name="Base command">
          {command}
        </WorkflowTreeDetailRow>
      </tbody>
    </Table>
    <Row>
      <WorkflowVisualizerSimpleBox title="Inputs">
        <VisualizerCommandEntities data={details.inputs} expanded={expanded}
          setDetailExpanded={setDetailExpanded} />
      </WorkflowVisualizerSimpleBox>
      <WorkflowVisualizerSimpleBox title="Outputs">
        <VisualizerCommandEntities data={details.outputs} expanded={expanded}
          setDetailExpanded={setDetailExpanded} />
      </WorkflowVisualizerSimpleBox>
      <WorkflowVisualizerSimpleBox title="Parameters">
        <VisualizerCommandEntities data={details.parameters} expanded={expanded}
          setDetailExpanded={setDetailExpanded} />
      </WorkflowVisualizerSimpleBox>
    </Row>
    <VisualizerDetailExpanded data={expanded} fullPath={fullPath} />
  </>);
}

interface VisualizerMappingsProps {
  data: Record<string, any>[]
  expanded: Record<string, any>
  setDetailExpanded: Function;
  workflows: Record<string, any>;
}

function VisualizerMappings({
  data, expanded, setDetailExpanded, workflows
}: VisualizerMappingsProps) {
  if (!data?.length)
    return (<p className="m-2"><UnavailableDetail /></p>);
  const elements = data.map((element: any) => {
    const elemClass = (expanded.type === element.type && expanded.name === element.name) ?
      "selected" : "";
    return (
      <div key={element.name} className={`p-2 rk-clickable ${elemClass}`}
        onClick={() => { setDetailExpanded(element); }}>
        <p className="mb-0"><b>{element.name}</b>: {element.default_value}</p>
      </div>
    );
  });

  return (<>{elements}</>);
}

interface WorkflowVisualizerSimpleBoxProps {
  children: React.ReactNode;
  large?: boolean;
  title: string;
}

function WorkflowVisualizerSimpleBox({ children, large = false, title }: WorkflowVisualizerSimpleBoxProps) {
  return (
    <Col xs={12} lg={large ? 12 : 4}>
      <Card className="border border-rk-light mb-3">
        <CardHeader className="bg-white p-2">
          <h4 className="m-1">{title}</h4>
        </CardHeader>
        <CardBody className="p-1">
          {children}
        </CardBody>
      </Card>
    </Col>
  );
}


interface VisualizerCommandEntitiesProps {
  data: Record<string, any>[]
  expanded: Record<string, any>
  setDetailExpanded: Function;
}

function VisualizerCommandEntities({
  data, expanded, setDetailExpanded
}: VisualizerCommandEntitiesProps) {
  if (!data?.length)
    return (<p className="m-2"><UnavailableDetail /></p>);
  const elements = data.map((i: any) => {
    return (
      <VisualizerCommandEntity key={i.plan_id + i.name} element={i}
        expanded={expanded} setDetailExpanded={setDetailExpanded}
      />
    );
  });
  return (<>{elements}</>);
}

interface VisualizerCommandEntityProps {
  element: Record<string, any>
  expanded: Record<string, any>
  setDetailExpanded: Function;
}

function VisualizerCommandEntity({ element, expanded, setDetailExpanded }: VisualizerCommandEntityProps) {
  const elemClass = (expanded.type === element.type && expanded.name === element.name) ?
    "selected" : "";
  let valueClass = "";
  let link: React.ReactNode = null;
  if (element.encoding_format && !element.exists)
    valueClass = "text-rk-text-light";
  return (
    <div className={`p-2 rk-clickable ${elemClass}`} onClick={() => { setDetailExpanded(element); }}>
      <p className="mb-0"><b>{element.name}</b>: <span className={valueClass}>{element.default_value}</span> {link}</p>
    </div>
  );
}


interface VisualizerDetailExpandedProps {
  data: Record<string, any>
  fullPath: string;
}

function VisualizerDetailExpanded({ data, fullPath }: VisualizerDetailExpandedProps) {
  if (!data?.name)
    return null;

  let defaultValue = data.default_value ? data.default_value : <UnavailableDetail />;
  if (data.default_value && data.encoding_format) {
    if (data.exists) {
      const fileUrl = Url.get(Url.pages.project.file, { namespace: "", path: fullPath, target: data.default_value });
      defaultValue = (
        <span>{defaultValue} <Link to={fileUrl}>
          <FontAwesomeIcon className="text-rk-yellow" icon={faLink} />
        </Link></span>
      );
    }
    else {
      const keyTooltip = "param-gone-info-" + simpleHash(data.plan_id + data.name);
      defaultValue = (
        <>
          {defaultValue}{" "}
          <span id={keyTooltip} className="text-rk-text">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </span>
          <UncontrolledTooltip key={keyTooltip} placement="top" target={keyTooltip}>
            <span>The file was manually removed and not avilable in the repository.</span>
          </UncontrolledTooltip>
        </>
      );
    }
  }
  const description = data.description ? data.description : <UnavailableDetail />;
  const prefix = data.prefix ? data.prefix : <UnavailableDetail />;
  const position = data.position ? data.position : <UnavailableDetail />;
  // ? add back: const format = data.format ? data.format : <UnavailableDetail text="Unknown" />;
  const typeElem = data.type ? data.type : <UnavailableDetail />;
  let mappedToElement: React.ReactNode = null;
  if (Object.keys(data).includes("mapped_to")) {
    const mappedTo = data.mapped_to ? data.mapped_to : <UnavailableDetail text="Nothing" />;
    mappedToElement = (<WorkflowTreeDetailRow name="Mapped to">{mappedTo}</WorkflowTreeDetailRow>);
  }
  return (
    <Row>
      <WorkflowVisualizerSimpleBox title="Details" large={true}>
        <Table className="table-borderless rk-tree-table mb-0" size="sm">
          <tbody>
            <WorkflowTreeDetailRow name="Name">{data.name}</WorkflowTreeDetailRow>
            <WorkflowTreeDetailRow name="Type">{typeElem}</WorkflowTreeDetailRow>
            <WorkflowTreeDetailRow name="Default value">{defaultValue}</WorkflowTreeDetailRow>
            <WorkflowTreeDetailRow name="Description">{description}</WorkflowTreeDetailRow>
            <WorkflowTreeDetailRow name="Prefix">{prefix}</WorkflowTreeDetailRow>
            <WorkflowTreeDetailRow name="Position">{position}</WorkflowTreeDetailRow>
            {mappedToElement}
          </tbody>
        </Table>
      </WorkflowVisualizerSimpleBox>
    </Row>
  );
}


interface VisualizerMappingExpandedProps {
  data: Record<string, any>
  workflows: Record<string, any>;
}

function VisualizerMappingExpanded({ data, workflows }: VisualizerMappingExpandedProps) {
  if (!data?.name)
    return null;

  const defaultValue = data.default_value ? data.default_value : <UnavailableDetail />;
  const description = data.description ? data.description : <UnavailableDetail />;
  let targets: React.ReactNode;
  if (!data?.targets?.length) {
    targets = (<UnavailableDetail text="None" />);
  }
  else {
    targets = (
      data.targets.map((t: any) => {
        try {
          const targetWorkflow = workflows?.list?.length ?
            workflows.list.find((w: any) => (w.id === t.plan_id)) :
            null;
          const subItem = t.id.replace(targetWorkflow.id + "/", "");
          const newName = `[WF: ${targetWorkflow.name}] @ ${subItem.replace("/", " #")}`;
          const url = targetWorkflow.url; // ! (**restore here**) + t.id.replace(targetWorkflow.id, "");
          const link = (<Link to={url}>
            <FontAwesomeIcon className="text-rk-yellow" icon={faLink} />
          </Link>);
          return (<span key={simpleHash(t.id + t.name)}>{newName} {link}</span>);
        }
        catch {
          return (<span key={simpleHash(t.id + t.name)}>{t.id}</span>);
        }
      })
    );
  }

  return (
    <WorkflowVisualizerSimpleBox title="Details" large={true}>
      <Table className="table-borderless rk-tree-table mb-0" size="sm">
        <tbody>
          <WorkflowTreeDetailRow name="Name">{data.name}</WorkflowTreeDetailRow>
          <WorkflowTreeDetailRow name="Default value">{defaultValue}</WorkflowTreeDetailRow>
          <WorkflowTreeDetailRow name="Description">{description}</WorkflowTreeDetailRow>
          <WorkflowTreeDetailRow name="Targets">{targets}</WorkflowTreeDetailRow>
        </tbody>
      </Table>
    </WorkflowVisualizerSimpleBox>
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
      <CardBody className="text-break">{content}</CardBody>
    </Card>
  );
}


export { WorkflowDetail, WorkflowsTreeBrowser };
