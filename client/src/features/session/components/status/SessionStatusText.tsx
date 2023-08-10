/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { useMemo } from "react";
import { NotebookAnnotations } from "../../../../notebooks/components/Session";
import { SessionStatusState } from "../../sessions.types";
import { TimeCaption } from "../../../../components/TimeCaption";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface SessionStatusTextProps {
  annotations: NotebookAnnotations;
  // defaultImage: boolean;
  startTimestamp: string;
  status: SessionStatusState;
}

export default function SessionStatusText({
  annotations,
  startTimestamp,
  status,
}: SessionStatusTextProps) {
  const startTimeText = (
    <TimeCaption datetime={startTimestamp} enableTooltip noCaption />
  );
  const hibernationTimestamp =
    status === "hibernated" ? annotations["hibernation-date"] ?? "" : null;

  return status === "running" ? (
    <>Running, created {startTimeText}</>
  ) : status === "starting" ? (
    <>Starting, created {startTimeText}</>
  ) : status === "stopping" ? (
    <>Deleting...</>
  ) : status === "hibernated" && hibernationTimestamp ? (
    <>
      Paused{" "}
      <TimeCaption datetime={hibernationTimestamp} enableTooltip noCaption />,
      created {startTimeText}
    </>
  ) : status === "hibernated" ? (
    // TODO: tooltip here
    <>
      Paused
      <FontAwesomeIcon className="ms-1" icon={faExclamationTriangle} />, created{" "}
      {startTimeText}
    </>
  ) : status === "failed" ? (
    <>
      Error {"("}created {startTimeText}
      {")"}
    </>
  ) : (
    <>Unknown state</>
  );
}
