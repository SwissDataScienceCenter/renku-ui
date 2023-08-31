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

import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Duration } from "luxon";
import { useRef } from "react";
import { PopoverBody, PopoverHeader, UncontrolledPopover } from "reactstrap";
import { TimeCaption } from "../../../../components/TimeCaption";
import { NotebookAnnotations } from "../../../../notebooks/components/session.types";
import { ensureDateTime } from "../../../../utils/helpers/DateTimeUtils";
import { SessionStatusState } from "../../sessions.types";

interface SessionStatusTextProps {
  annotations: NotebookAnnotations;
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
  const hibernationDateTime = hibernationTimestamp
    ? ensureDateTime(hibernationTimestamp)
    : null;

  const hibernatedSecondsThreshold =
    status === "hibernated"
      ? parseInt(annotations?.hibernatedSecondsThreshold ?? "", 10)
      : null;
  const hibernationThresholdDuration =
    !hibernatedSecondsThreshold || isNaN(hibernatedSecondsThreshold)
      ? Duration.fromISO("")
      : Duration.fromObject({ seconds: hibernatedSecondsThreshold });
  const hibernationCullTimestamp =
    hibernationDateTime && hibernationThresholdDuration
      ? hibernationDateTime.plus(hibernationThresholdDuration)
      : null;

  return status === "running" ? (
    <>Running, created {startTimeText}</>
  ) : status === "starting" ? (
    <>Starting, created {startTimeText}</>
  ) : status === "stopping" ? (
    <>Deleting...</>
  ) : status === "hibernated" && hibernationCullTimestamp ? (
    <>
      Paused, will be deleted{" "}
      <TimeCaption
        datetime={hibernationCullTimestamp}
        enableTooltip
        noCaption
      />
    </>
  ) : status === "hibernated" && hibernationTimestamp ? (
    <>
      Paused{" "}
      <TimeCaption datetime={hibernationTimestamp} enableTooltip noCaption />
    </>
  ) : status === "hibernated" ? (
    <>
      Paused
      <MissingHibernationInfo />
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

function MissingHibernationInfo() {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={ref}>
        <FontAwesomeIcon className="ms-1" icon={faExclamationTriangle} />
      </span>
      <UncontrolledPopover placement="bottom" target={ref} trigger="hover">
        <PopoverHeader>Missing information</PopoverHeader>
        <PopoverBody>
          Information about when this session was paused is not available.
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}
