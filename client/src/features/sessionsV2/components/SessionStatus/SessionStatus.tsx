/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import cx from "classnames";
import { Duration } from "luxon";
import { ReactNode, useMemo } from "react";
import {
  CheckCircleFill,
  Clock,
  ExclamationCircleFill,
  PauseCircleFill,
  XCircleFill,
} from "react-bootstrap-icons";
import { Badge } from "reactstrap";
import { Loader } from "../../../../components/Loader.tsx";
import { TimeCaption } from "../../../../components/TimeCaption.tsx";
import { NotebooksHelper } from "../../../../notebooks";
import { SessionListRowStatusExtraDetails } from "../../../../notebooks/components/SessionListStatus.tsx";
import { NotebookAnnotations } from "../../../../notebooks/components/session.types.ts";
import { ensureDateTime } from "../../../../utils/helpers/DateTimeUtils.ts";
import { MissingHibernationInfo } from "../../../session/components/status/SessionStatusText.tsx";
import {
  Session,
  SessionStatusState,
} from "../../../session/sessions.types.ts";
import { SessionLauncher } from "../../sessionsV2.types.ts";

export function SessionBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <Badge
      className={cx(
        "d-flex",
        "align-items-center",
        "gap-2",
        "fs-small",
        "fw-normal",
        className
      )}
      pill
    >
      {children}
    </Badge>
  );
}
interface ActiveSessionV2Props {
  session: Session;
}
interface ActiveSessionTitleV2Props {
  session: Session;
  launcher?: SessionLauncher;
}
export function SessionStatusV2Label({ session }: ActiveSessionV2Props) {
  const { annotations, status } = session;

  const cleanAnnotations = useMemo(
    () => NotebooksHelper.cleanAnnotations(annotations) as NotebookAnnotations,
    [annotations]
  );
  const state = status.state;
  const defaultImage = cleanAnnotations.default_image_used;

  const badge =
    state === "running" && defaultImage ? (
      <SessionBadge className="border border-warning bg-warning-subtle">
        <ExclamationCircleFill
          className={cx("bi", "me-1", "text-warning")}
          size={16}
        />
        <span className="rk-bg-warning">Running Session</span>
      </SessionBadge>
    ) : state === "running" ? (
      <SessionBadge className="border border-success bg-success-subtle">
        <CheckCircleFill
          className={cx("bi", "me-1", "text-success")}
          size={16}
        />
        <span className="text-success-emphasis">Running Session</span>
      </SessionBadge>
    ) : state === "starting" ? (
      <SessionBadge className="border border-warning bg-warning-subtle">
        <Loader size={16} className={cx("bi", "me-1", "text-warning")} inline />
        <span className="text-warning">Starting Session</span>
      </SessionBadge>
    ) : state === "stopping" ? (
      <SessionBadge className="border border-warning bg-warning-subtle">
        <Loader size={16} className={cx("bi", "me-1", "text-warning")} inline />
        <span className="text-warning">Stopping Session</span>
      </SessionBadge>
    ) : state === "hibernated" ? (
      <SessionBadge className={"border border-dark-subtle bg-light"}>
        <PauseCircleFill
          className={cx("bi", "me-1", "text-light-emphasis")}
          size={16}
        />
        <span className="text-dark">Paused Session</span>
      </SessionBadge>
    ) : state === "failed" ? (
      <SessionBadge className={"border border-danger bg-danger-subtle"}>
        <XCircleFill className={cx("bi", "me-1", "text-danger")} size={16} />
        <span className="text-danger">Error in Session</span>
      </SessionBadge>
    ) : (
      <SessionBadge className="border border-warning bg-warning-subtle">
        <ExclamationCircleFill
          className={cx("bi", "me-1", "text-warning")}
          size={16}
        />
        <span className="text-warning">Unknown status</span>
      </SessionBadge>
    );

  return (
    <div className={cx("d-flex", "flex-row", "gap-2", "align-items-center")}>
      {badge}
    </div>
  );
}
export function SessionStatusV2Description({ session }: ActiveSessionV2Props) {
  const { annotations, started, status } = session;

  const cleanAnnotations = useMemo(
    () => NotebooksHelper.cleanAnnotations(annotations) as NotebookAnnotations,
    [annotations]
  );

  const details = { message: session.status.message };

  return (
    <div
      className={cx(
        "time-caption",
        "d-flex",
        "flex-row",
        "gap-2",
        "align-items-center"
      )}
    >
      <SessionStatusV2Text
        annotations={cleanAnnotations}
        startTimestamp={started}
        status={status.state}
      />
      <SessionListRowStatusExtraDetails
        details={details}
        status={status.state}
        uid={session.name}
      />
    </div>
  );
}
export function SessionStatusV2Title({
  session,
  launcher,
}: ActiveSessionTitleV2Props) {
  const { status } = session;
  const state = status.state;

  return state === "running" && !launcher ? (
    <small>
      <i>You are currently running a orphan session</i>
    </small>
  ) : state === "running" ? (
    <small>
      <i>You are currently running a session from this launcher</i>
    </small>
  ) : state === "starting" ? (
    <small>
      <i>You are currently starting a session from this launcher</i>
    </small>
  ) : state === "stopping" ? (
    <small>
      <i>You are currently stopping a session from this launcher</i>
    </small>
  ) : state === "hibernated" ? (
    <small>
      <i>You have a paused session from this launcher</i>
    </small>
  ) : state === "failed" ? (
    <small>
      <i>An error was encountered while attempting to launch this session.</i>
    </small>
  ) : null;
}
interface SessionStatusV2TextProps {
  annotations: NotebookAnnotations;
  startTimestamp: string;
  status: SessionStatusState;
}
function SessionStatusV2Text({
  annotations,
  startTimestamp,
  status,
}: SessionStatusV2TextProps) {
  const startTimeText = (
    <TimeCaption datetime={startTimestamp} enableTooltip noCaption />
  );
  const hibernationTimestamp =
    status === "hibernated" ? annotations["hibernationDate"] ?? "" : null;
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
    hibernationDateTime &&
    hibernationThresholdDuration &&
    hibernationThresholdDuration.isValid &&
    hibernationThresholdDuration.valueOf() > 0
      ? hibernationDateTime.plus(hibernationThresholdDuration)
      : null;

  return status === "running" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>Launched {startTimeText}</span>
    </div>
  ) : status === "starting" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>Created {startTimeText}</span>
    </div>
  ) : status === "stopping" ? (
    <>Stopping Session...</>
  ) : status === "hibernated" && hibernationCullTimestamp ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Session will be stopped in{" "}
        <TimeCaption
          datetime={hibernationCullTimestamp}
          enableTooltip
          noCaption
          suffix=" "
        />
      </span>
    </div>
  ) : status === "hibernated" && hibernationTimestamp ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Paused
        <TimeCaption datetime={hibernationTimestamp} enableTooltip noCaption />
      </span>
    </div>
  ) : status === "hibernated" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Paused
        <MissingHibernationInfo />
      </span>
    </div>
  ) : status === "failed" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Error {"("}created {startTimeText}
        {")"}
      </span>
    </div>
  ) : null;
}
