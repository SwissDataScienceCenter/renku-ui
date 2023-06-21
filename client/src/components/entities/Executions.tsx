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

import React, { ReactNode, forwardRef, useRef } from "react";
import cx from "classnames";
import { UncontrolledTooltip } from "reactstrap";
import Time from "../../utils/helpers/Time";
import { TimeCaption } from "../TimeCaption";
import { EntityType } from "./Entities";

export interface EntityExecutionsProps {
  display: "list" | "tree";
  executions: number | null;
  itemType: EntityType;
  lastExecuted: Date | null;
  showLastExecution?: boolean;
  showOnlyLastExecution?: boolean;
  workflowId: string;
}

export function EntityExecutions({
  display,
  executions,
  itemType,
  lastExecuted,
  showLastExecution = true,
  showOnlyLastExecution = false,
  workflowId,
}: EntityExecutionsProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  if (itemType !== "workflow") return null;

  const classNameSmall = "text-rk-text-light small";

  const lastExecution =
    lastExecuted != null ? (
      <TimeCaption
        noCaption={true}
        endPunctuation=""
        time={lastExecuted}
        className="text-rk-text-light"
      />
    ) : null;

  if (display === "list") {
    return (
      <p className={cx(classNameSmall, "my-1")}>
        <ExecutionContentList
          executions={executions}
          lastExecution={lastExecution}
        />
      </p>
    );
  }

  if (executions == null) {
    return null;
  }

  const executionContentTree = (
    <ExecutionContentTree
      executions={executions}
      showLastExecution={showLastExecution}
      showOnlyLastExecution={showOnlyLastExecution}
      classNameSmall={classNameSmall}
      lastExecution={lastExecution}
      ref={ref}
    />
  );
  if (showOnlyLastExecution) {
    return executionContentTree;
  }

  return (
    <div className="executions">
      {executionContentTree}
      {showLastExecution && workflowId && lastExecuted && (
        <UncontrolledTooltip placement="top" target={ref}>
          <span>{Time.toIsoTimezoneString(lastExecuted)}</span>
        </UncontrolledTooltip>
      )}
    </div>
  );
}

function ExecutionContentList({
  executions,
  lastExecution,
}: {
  executions: EntityExecutionsProps["executions"];
  lastExecution: ReactNode;
}) {
  if (executions == null) {
    return <span className="fst-italic">No data on executions.</span>;
  }
  if (executions === 0) {
    return <span>No executions</span>;
  }
  if (executions === 1) {
    return (
      <span>
        {executions} execution ({lastExecution})
      </span>
    );
  }
  return (
    <span>
      {executions} executions (last {lastExecution})
    </span>
  );
}

const ExecutionContentTree = forwardRef<
  HTMLParagraphElement,
  {
    executions: Exclude<EntityExecutionsProps["executions"], null>;
    showLastExecution: Exclude<
      EntityExecutionsProps["showLastExecution"],
      undefined
    >;
    showOnlyLastExecution: Exclude<
      EntityExecutionsProps["showLastExecution"],
      undefined
    >;
    classNameSmall: string;
    lastExecution: ReactNode;
  }
>(
  (
    {
      executions,
      showLastExecution,
      showOnlyLastExecution,
      classNameSmall,
      lastExecution,
    },
    ref
  ) => {
    if (executions === 0) {
      return <p>No executions</p>;
    }

    if (executions === 1) {
      const lastExec =
        showLastExecution || showOnlyLastExecution ? (
          <p ref={ref} className={classNameSmall}>
            {showOnlyLastExecution ? "last " : ""}
            {lastExecution}
          </p>
        ) : null;
      if (showOnlyLastExecution) return lastExec;
      return (
        <>
          <p>{executions} execution</p>
          {lastExec}
        </>
      );
    }

    const lastExec =
      showLastExecution || showOnlyLastExecution ? (
        <p ref={ref} className={classNameSmall}>
          last {lastExecution}
        </p>
      ) : null;
    if (showOnlyLastExecution) return lastExec;
    return (
      <>
        <p>{executions} executions</p>
        {lastExec}
      </>
    );
  }
);
ExecutionContentTree.displayName = "ExecutionContentTree";
