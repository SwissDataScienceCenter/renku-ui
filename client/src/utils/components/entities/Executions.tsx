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
import { TimeCaption } from "../TimeCaption";


export interface EntityExecutionsProps {
  display: "list" | "tree";
  executions: number | null;
  itemType: EntityType;
  lastExecuted: Date | null;
}

function EntityExecutions({ display, executions, itemType, lastExecuted }: EntityExecutionsProps) {
  if (itemType !== "workflow") return null;
  let executionLast = lastExecuted != null ?
    (<TimeCaption noCaption={true} endPunctuation="" time={lastExecuted} className="text-rk-text-light"/>) :
    null;
  let executionContent: React.ReactNode;
  const classSmall = "text-rk-text-light small";

  if (display === "list") {
    if (executions == null)
      executionContent = (<span className="fst-italic">No data on executions.</span>);
    else if (executions === 0)
      executionContent = (<span>No executions</span>);
    else if (executions === 1)
      executionContent = (<span>{executions} execution ({executionLast})</span>);
    else
      executionContent = (<span>{executions} executions (last {executionLast})</span>);
    return (
      <p className={`${classSmall} my-1`}>{executionContent}</p>
    );
  }

  if (executions == null)
    return null;
  else if (executions === 0)
    executionContent = (<p>No executions</p>);
  else if (executions === 1)
    executionContent = (<><p>{executions} execution</p><p className={classSmall}>{executionLast}</p></>);
  else
    executionContent = (<><p>{executions} executions</p><p className={classSmall}>last {executionLast}</p></>);
  return (
    <div className="executions">{executionContent}</div>
  );
}

export default EntityExecutions;
