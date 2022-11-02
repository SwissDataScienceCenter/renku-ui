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

import EntityCreators, { EntityCreator } from "./entities/Creators";
import EntityExecutions from "./entities/Executions";
import EntityDuration from "./entities/Duration";
import { CaretDownFill, CaretRightFill, Col, Diagram2 } from "../ts-wrappers";
import { EntityChildrenDot } from "./entities/Children";
import { EntityType, WorkflowType } from "./entities/Entities";
import { simpleHash } from "../helpers/HelperFunctions";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { IconLink } from "./ExternalLinks";


interface TreeBrowserProps {
  emptyElement: React.ReactNode;
  expanded: string[];
  highlightedProp: string;
  items: Record<string, any>;
  selected: string;
  shrunk: boolean;
  toggleExpanded: Function;
}

function TreeBrowser({
  emptyElement, expanded, highlightedProp, items = [], selected, shrunk, toggleExpanded
}: TreeBrowserProps) {
  if (!items.length)
    return (<>{emptyElement}</>);

  const treeElements = items.map((item: any) => {
    let newProps: Record<string, any> = { expanded, highlightedProp, items, selected, shrunk, toggleExpanded };
    return (<TreeElement key={item.uniqueId} {...item} {...newProps} />);
  });

  return (<div data-cy="workflows-browser" className="mb-3">{treeElements}</div>);
}


interface TreeElementProps extends TreeBrowserProps {
  active: boolean;
  children: string[],
  creators: EntityCreator[],
  duration: number;
  embed?: boolean;
  executions: number | null;
  highlightedProp: string,
  indentation: number;
  itemType: EntityType;
  lastExecuted: Date | null;
  timeCaption: string;
  title: string;
  url: string;
  uniqueId: string;
  workflowId: string;
  workflowType: WorkflowType;
}

function TreeElement({
  active, children, creators, duration, embed = false, expanded, executions, highlightedProp,
  indentation, itemType, items, lastExecuted, selected, shrunk, title,
  toggleExpanded, uniqueId, url, workflowId, workflowType
}: TreeElementProps) {
  let newClasses = workflowId === selected ? "selected" : "";
  if (embed)
    newClasses += " embed";
  const isComposite = workflowType === "CompositePlan" ? true : false;

  const leftItemClasses = "mx-3 center-vertically d-flex flex-column align-items-center";
  const lineNestedItem = indentation > 0 ? "rk-tree-item--children" : "";
  let leftItem: React.ReactNode = null;
  if (!embed) {
    if (isComposite) {
      const icon = expanded.includes(workflowId) || expanded.includes(uniqueId) ?
        <CaretDownFill /> : <CaretRightFill />;
      leftItem = (
        <div className={`${leftItemClasses} interactive`} onClick={() => toggleExpanded(uniqueId)}>
          {icon}
        </div>
      );
    }
    else {
      const inactive = active ? "" : "inactive";
      leftItem = (
        <div className={leftItemClasses}>
          <span className={`circle ${itemType} ${inactive} d-flex justify-content-center align-items-center`}>
            <Diagram2 color="white" />
          </span>
        </div>);
    }
  }

  let childrenItems = items.filter((item: any) => children.includes(item.id));
  let childrenNodes: React.ReactNode[] = [];
  if (childrenItems.length && expanded.includes(uniqueId)) {
    childrenNodes = childrenItems.map((item: any) => {
      const childUniqueId = simpleHash(uniqueId + item.uniqueId);
      let newProps: Record<string, any> = {
        expanded, highlightedProp, items, indentation: indentation + 1, selected, shrunk,
        toggleExpanded, uniqueId: childUniqueId
      };
      return (<TreeElement key={workflowId + item.workflowId} {...item} {...newProps} />);
    });
  }

  // after 3 nested levels increase the left margin by 10px
  const marginIndentation = indentation < 3 ? indentation * 30 : ((indentation - 2) * 10) + 60;
  const elementStyle = { marginLeft: `${marginIndentation}px` };

  // define actions to trigger on click
  const expandIfCollapsed = (workflowId: string) => {
    // expand composite workflows when they are collapsed
    if (isComposite) {
      if (!expanded.includes(workflowId))
        toggleExpanded(workflowId);
    }
  };


  const actionsOnClick = (workflowId: string) => {
    expandIfCollapsed(workflowId);
  };

  // return either shrunk or full-size element
  if (shrunk) {
    let details: React.ReactNode = null;
    if (highlightedProp === "authors") {
      details = (<EntityCreators display="tree" creators={creators} itemType={itemType} />);
    }
    else if (highlightedProp === "duration") {
      details = (<EntityDuration duration={duration} workflowId={uniqueId} />);
    }
    else if (highlightedProp === "executions") {
      details = (
        <EntityExecutions display="tree" executions={executions} itemType={itemType}
          lastExecuted={lastExecuted} showLastExecution={false} workflowId={uniqueId} />
      );
    }
    else {
      details = (
        <EntityExecutions display="tree" executions={executions} itemType={itemType}
          lastExecuted={lastExecuted} showOnlyLastExecution={true} workflowId={uniqueId} />
      );
    }

    return (
      <>
        <div className={`d-flex flex-row rk-tree-item ${newClasses} ${lineNestedItem}`} style={elementStyle}>
          {leftItem}
          <Link className="row w-100 rk-tree-item-content" to={url} onClick={() => actionsOnClick(workflowId)}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="d-flex flex-column">
                {title}
                <span className="text-rk-text-light">{details}</span>
              </h5>
              <EntityChildrenDot childrenElements={children} itemType={itemType} workflowId={uniqueId} />
            </div>
          </Link>
        </div>
        {childrenNodes}
      </>
    );
  }

  return (
    <>
      <div className={`d-flex flex-row rk-tree-item ${newClasses}`}>
        <Col xs={12} md={5} className="title center-vertically d-flex flex-row" >
          <div style={elementStyle} className={`d-flex rk-tree-column-child ${lineNestedItem}`}>{leftItem}</div>
          <Link className="row w-100 rk-tree-item-content rk-tree-column-child" to={url}
            onClick={() => actionsOnClick(workflowId)}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="rk-tree-title gap-2">
                {title}
                <EntityCreators display="tree" creators={creators} itemType={itemType} />
              </h5>
              <EntityChildrenDot childrenElements={children} itemType={itemType} workflowId={uniqueId} />
            </div>
          </Link>
        </Col>
        <Col xs={12} sm={7} md={4} className="title d-flex align-items-center rk-tree-column-child">
          <div className="d-flex rk-tree-column-child">
            <EntityExecutions display="tree" executions={executions} itemType={itemType}
              lastExecuted={lastExecuted} showLastExecution={true} workflowId={uniqueId} />
          </div>
        </Col>
        <Col xs={12} sm={5} md={3} className="title d-flex align-items-center rk-tree-column-child">
          <EntityDuration duration={duration} workflowId={uniqueId} />
          { embed && !isComposite ?
            <span className="ms-2">
              <IconLink tooltip="Open workflow" className="text-rk-yellow" icon={faLink} to={url} />
            </span> : null }
        </Col>
      </div>
      {childrenNodes}
    </>
  );
}


interface TreeDetailsProps {
  children: React.ReactNode
}

function TreeDetails({ children }: TreeDetailsProps) {
  return (<div data-cy="workflow-details">{children}</div>);
}

export { TreeBrowser, TreeDetails, TreeElement };
