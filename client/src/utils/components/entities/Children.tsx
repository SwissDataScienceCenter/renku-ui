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

import { EntityType } from "./Entities";
import { Badge, UncontrolledTooltip } from "../../ts-wrappers";
// import { stylesByItemType } from "../../helpers/HelperFunctions";

/**
 *  renku-ui
 *
 *  Entity Children.tsx
 *  Entity Children component
 */


interface EntityChildrenProps {
  childrenElements?: any[];
  itemType: EntityType;
}

function EntityChildren({ childrenElements, itemType }: EntityChildrenProps) {
  const childrenNumber = childrenElements && childrenElements.length ?
    childrenElements.length :
    0;

  if (!childrenNumber)
    return null;

  if (itemType === "workflow") {
    return (
      <p className="">
        <span className="text-rk-text small rem">contains </span> {childrenNumber} step{childrenNumber > 1 ? "s" : ""}
      </p>
    );
  }
  return null;
}

interface EntityChildrenDotProps extends EntityChildrenProps {
  workflowId: string;
}

function EntityChildrenDot({ childrenElements, itemType, workflowId }: EntityChildrenDotProps) {
  const childrenNumber = childrenElements && childrenElements.length ?
    childrenElements.length :
    0;

  if (!childrenNumber)
    return null;

  if (itemType === "workflow") {
    const color = "bg-rk-yellow";
    const tooltipId = `contains-${workflowId}`;
    const toolTip = (
      <UncontrolledTooltip key={`duration-elem-${workflowId}`} placement="top" target={tooltipId}>
        <span>{childrenNumber} step{childrenNumber > 1 ? "s" : ""} in this workflow</span>
      </UncontrolledTooltip>
    );

    return (
      <Badge id={tooltipId} className={color} pill>
        {childrenNumber}
        {toolTip}
      </Badge>
    );
  }
  return null;
}


export { EntityChildren, EntityChildrenDot };
