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
import { faLink, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import EntityCreators, { EntityCreator } from "./entities/Creators";
import EntityExecutions from "./entities/Executions";
import { Col } from "../ts-wrappers";
import { EntityType, WorkflowType } from "./entities/Entities";
import { TimeCaption } from "./TimeCaption";


interface TreeBrowserProps {
  expanded: string[];
  items: Record<string, any>;
  selected: string;
  toggleExpanded: Function;
}

function TreeBrowser({
  expanded, items = [], selected, toggleExpanded
}: TreeBrowserProps) {
  if (!items.length)
    return (<p>No elements to display</p>);

  const treeElements = items.map((item: any) => {
    let newProps: Record<string, any> = { selected, expanded, toggleExpanded, items };
    return (<TreeElement key={item.workflowId} {...item} {...newProps} />);
  });

  // ! TODO: make it shrink on select

  return (<div>{treeElements}</div>);
}


interface TreeElementProps extends TreeBrowserProps {
  children: string[],
  creators: EntityCreator[],
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
  children, creators, expanded, executions, indentation, itemType, items, lastExecuted, selected, timeCaption, title,
  toggleExpanded, url, urlSingle, workflowId, workflowType
}: TreeElementProps) {
  const newClasses = workflowId === selected ? "selected" : "";
  const isComposite = workflowType === "CompositePlan" ? true : false;

  const leftItemClasses = "mx-3 center-vertically d-flex flex-column align-items-center";
  let leftItem: React.ReactNode;
  if (isComposite) {
    const icon = expanded.includes(workflowId) ? faChevronDown : faChevronUp;
    leftItem = (
      <div className={`${leftItemClasses} interactive`} onClick={() => { toggleExpanded(workflowId); }}>
        <FontAwesomeIcon size="lg" className="me-1 text-rk-yellow" icon={icon} />
      </div>
    );
  }
  else {
    leftItem = (<div className={leftItemClasses}><span className={"circle " + itemType}></span></div>);
  }

  let childrenItems = items.filter((item: any) => children.includes(item.id));
  let childrenNodes: React.ReactNode[] = [];
  if (childrenItems.length && expanded.includes(workflowId)) {
    childrenNodes = childrenItems.map((item: any) => {
      let newProps: Record<string, any> = { selected, expanded, toggleExpanded, items, indentation: indentation + 1 };
      return (<TreeElement key={workflowId + item.workflowId} {...item} {...newProps} />);
    });
  }

  let currentIndentation = "indentation-";
  if (!indentation)
    currentIndentation += 0;
  else if (indentation >= 4)
    currentIndentation += 4;
  else
    currentIndentation += indentation;

  return (
    <>
      <div className={`d-flex flex-row rk-tree-item ${newClasses} ${currentIndentation}`}>
        {leftItem}
        <Link className="row w-100 rk-tree-item-content" to={url}>
          <Col xs={12} md={5} className="title center-vertically">
            <h5>{title}</h5>
            <EntityCreators display="tree" creators={creators} itemType={itemType} />
          </Col>
          <Col xs={12} sm={7} md={4} className="title center-vertically">
            <EntityExecutions display="tree" executions={executions} itemType={itemType} lastExecuted={lastExecuted} />
          </Col>
          <Col xs={12} sm={5} md={3} className="title center-vertically">
            <TimeCaption caption="Updated" className="text-rk-text-light" time={timeCaption} endPunctuation="" />
            <Link to={urlSingle}><FontAwesomeIcon className="text-rk-yellow float-end" icon={faLink} /></Link>
          </Col>
        </Link>
      </div>
      {childrenNodes}
    </>
  );
}

export { TreeBrowser, TreeElement };
