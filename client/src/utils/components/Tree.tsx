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


import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import EntityCreators, { EntityCreator } from "./entities/Creators";
import EntityExecutions from "./entities/Executions";
import EntityDuration from "./entities/Duration";
import { Col } from "../ts-wrappers";
import { EntityType, WorkflowType } from "./entities/Entities";


interface TreeBrowserProps {
  expanded: string[];
  items: Record<string, any>;
  selected: string;
  shrunk: boolean;
  toggleExpanded: Function;
}

function TreeBrowser({
  expanded, items = [], selected, shrunk, toggleExpanded
}: TreeBrowserProps) {
  if (!items.length)
    return (<p>No elements to display</p>);

  const treeElements = items.map((item: any) => {
    let newProps: Record<string, any> = { expanded, items, selected, shrunk, toggleExpanded };
    return (<TreeElement key={item.workflowId} {...item} {...newProps} />);
  });

  return (<div className="mb-3">{treeElements}</div>);
}


interface TreeElementProps extends TreeBrowserProps {
  active: boolean;
  children: string[],
  creators: EntityCreator[],
  duration: number;
  executions: number | null;
  indentation: number;
  itemType: EntityType;
  lastExecuted: Date | null;
  timeCaption: string;
  title: string;
  url: string;
  urlSingle: string;
  workflowId: string;
  workflowType: WorkflowType;
}

function TreeElement({
  active, children, creators, duration, expanded, executions, indentation, itemType, items, lastExecuted,
  selected, shrunk, timeCaption, title, toggleExpanded, url, urlSingle, workflowId, workflowType
}: TreeElementProps) {
  const newClasses = workflowId === selected ? "selected" : "";
  const isComposite = workflowType === "CompositePlan" ? true : false;

  const leftItemClasses = "mx-3 center-vertically d-flex flex-column align-items-center";
  let leftItem: React.ReactNode;
  if (isComposite) {
    const icon = expanded.includes(workflowId) ? faChevronUp : faChevronDown;
    const color = active ? "yellow" : "text";
    leftItem = (
      <div className={`${leftItemClasses} interactive`} onClick={() => { toggleExpanded(workflowId); }}>
        <FontAwesomeIcon size="lg" className={`me-1 text-rk-${color}`} icon={icon} />
      </div>
    );
  }
  else {
    const inactive = active ? "" : "inactive";
    leftItem = (<div className={leftItemClasses}><span className={`circle ${itemType} ${inactive}`}></span></div>);
  }

  let childrenItems = items.filter((item: any) => children.includes(item.id));
  let childrenNodes: React.ReactNode[] = [];
  if (childrenItems.length && expanded.includes(workflowId)) {
    childrenNodes = childrenItems.map((item: any) => {
      let newProps: Record<string, any> = {
        expanded, items, indentation: indentation + 1, selected, shrunk, toggleExpanded
      };
      return (<TreeElement key={workflowId + item.workflowId} {...item} {...newProps} />);
    });
  }

  let currentIndentation = 0;
  if (indentation >= 4)
    currentIndentation = 4;
  else if (indentation)
    currentIndentation = indentation;
  if (shrunk)
    currentIndentation = currentIndentation / 2;
  const elementStyle = { marginLeft: `${currentIndentation}em` };

  // return either shrunk or full-size element
  if (shrunk) {
    return (
      <>
        <div className={`d-flex flex-row rk-tree-item ${newClasses}`} style={elementStyle}>
          {leftItem}
          <Link className="row w-100 rk-tree-item-content" to={url}>
            <Col xs={12} className="title center-vertically">
              <h5>{title}</h5>
            </Col>
            <Col xs={12} className="title center-vertically">
              <EntityExecutions display="tree" executions={executions} itemType={itemType}
                lastExecuted={lastExecuted} showLastExecution={false} workflowId={workflowId} />
            </Col>
          </Link>
        </div>
        {childrenNodes}
      </>
    );
  }

  return (
    <>
      <div className={`d-flex flex-row rk-tree-item ${newClasses}`} style={elementStyle}>
        {leftItem}
        <Link className="row w-100 rk-tree-item-content" to={url}>
          <Col xs={12} md={5} className="title center-vertically">
            <h5>{title}</h5>
            {/* // ! TODO: show children number for composite WF -- create element */}
            {/* // ! {children?.length ? children.length : ""} */}
            <EntityCreators display="tree" creators={creators} itemType={itemType} />
          </Col>
          <Col xs={12} sm={7} md={4} className="title center-vertically">
            <EntityExecutions display="tree" executions={executions} itemType={itemType}
              lastExecuted={lastExecuted} showLastExecution={true} workflowId={workflowId} />
          </Col>
          <Col xs={12} sm={5} md={3} className="title center-vertically">
            <EntityDuration duration={duration} workflowId={workflowId} />
          </Col>
        </Link>
      </div>
      {childrenNodes}
    </>
  );
}


interface TreeDetailsProps {
  children: React.ReactNode
}

function TreeDetails({ children }: TreeDetailsProps) {
  return (<>{ children }</>);
}

export { TreeBrowser, TreeDetails, TreeElement };
