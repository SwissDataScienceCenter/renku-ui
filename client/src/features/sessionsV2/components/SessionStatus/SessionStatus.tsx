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

import {
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { ReactNode, useRef } from "react";
import {
  CheckCircleFill,
  CircleFill,
  Clock,
  ExclamationDiamondFill,
  GearFill,
  Hourglass,
  Icon,
} from "react-bootstrap-icons";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";

import {
  getLauncherCategoryDefinition,
  JOB_STOPPING_BUTTON_LABEL,
  JOB_STOPPING_TITLE,
  sessionLauncherKindToCategory,
} from "~/features/sessionsV2/session.utils";
import { Loader } from "../../../../components/Loader";
import { TimeCaption } from "../../../../components/TimeCaption";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import {
  JOB_TITLE,
  SESSION_STATES,
  SESSION_STYLES,
  SESSION_TITLE,
  SESSION_TITLE_DASHBOARD,
} from "../../SessionStyles.constants";
import {
  LauncherCategory,
  LauncherCategoryDefinition,
  SessionLauncherKind,
  SessionStatus,
  SessionStatusState,
  SessionV2,
} from "../../sessionsV2.types";

import statusStyles from "./SessionStatus.module.scss";

interface PrettySessionErrorMessageProps {
  message: string | null | undefined;
}
function PrettySessionErrorMessage({
  message,
}: PrettySessionErrorMessageProps) {
  // eslint-disable-next-line spellcheck/spell-checker
  if (message?.includes("Insufficient nvidia.com/gpu")) {
    return (
      <>
        <p className="mb-2">
          Scheduling error: there are not enough GPUs available to start or
          resume the session.
        </p>
        <h3 className="fs-6">Original error message:</h3>
        <p className="mb-0">{message}</p>
      </>
    );
  }

  if (
    message?.includes("nodes are available") ||
    message?.includes("The resource quota has been exceeded.")
  ) {
    return (
      <>
        <p className="mb-2">
          Scheduling error: one or more compute resources have been exhausted in
          the resource pool.
        </p>
        <h3 className="fs-6">Original error message:</h3>
        <p className="mb-0">{message}</p>
      </>
    );
  }

  return <>{message}</>;
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

export function SessionBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <Badge className={cx("border", "fs-small", "fw-normal", className)} pill>
      {children}
    </Badge>
  );
}
interface ActiveSessionV2Props {
  session: SessionV2;
  variant?: "card" | "list";
  includeIcon?: boolean;
}
interface ActiveSessionDescV2Props extends ActiveSessionV2Props {
  showInfoDetails?: boolean;
}
interface ActiveSessionTitleV2Props {
  session: SessionV2;
  launcher?: SessionLauncher;
}

function UnknownStatusBadge() {
  return (
    <SessionBadge
      className={cx(
        "border-warning",
        "bg-warning-subtle",
        "text-warning-emphasis",
      )}
    >
      <ExclamationDiamondFill
        className={cx("bi", "me-1", "text-warning-emphasis")}
      />
      Unknown status
    </SessionBadge>
  );
}

function WarningStatusBadge({
  icon,
  label,
}: {
  icon: "circle" | "icon" | "loader";
  label: string;
}) {
  return (
    <SessionBadge className={cx("border-warning", "bg-warning-subtle")}>
      {icon === "loader" && (
        <Loader
          size={14}
          className={cx("bi", "me-1", "text-warning-emphasis")}
          inline
        />
      )}
      {icon === "icon" && (
        <GearFill
          fontSize={16}
          className={cx(
            "bi",
            "me-1",
            "text-warning-emphasis",
            statusStyles.spinIcon,
          )}
        />
      )}
      {icon === "circle" && (
        <CircleFill
          fontSize={14}
          className={cx("bi", "me-1", "text-warning-emphasis")}
        />
      )}
      <span className="text-warning-emphasis">{label}</span>
    </SessionBadge>
  );
}

function LoaderStatusBadge({ label }: { label: string }) {
  return <WarningStatusBadge icon="loader" label={label} />;
}

function HibernatedStatusBadge({ label }: { label: string }) {
  return (
    <SessionBadge className={cx("border-dark-subtle", "bg-light")}>
      <CircleFill
        className={cx("bi", "me-1", "text-light-emphasis")}
        fontSize={14}
      />
      <span className="text-dark-emphasis">{label}</span>
    </SessionBadge>
  );
}

function FailedStatusBadge({ label }: { label: string }) {
  return (
    <SessionBadge className={cx("border-danger", "bg-danger-subtle")}>
      <ExclamationDiamondFill
        className={cx("bi", "me-1", "text-danger-emphasis")}
        fontSize={16}
      />
      <span className="text-danger-emphasis">{label}</span>
    </SessionBadge>
  );
}

function SuccessStatusBadge({ label }: { label: string }) {
  return (
    <SessionBadge className={cx("border-success", "bg-success-subtle")}>
      <CheckCircleFill
        fontSize={16}
        className={cx("bi", "me-1", "text-success-emphasis")}
      />
      <span className="text-success-emphasis">{label}</span>
    </SessionBadge>
  );
}

interface BuildSessionStatusBadgeProps {
  state: SessionStatusState;
  launcherCategory: LauncherCategory;
  launcherDefinition: LauncherCategoryDefinition;
  image?: string;
  jobStoppingBadgeLabel: string;
}

function BuildSessionStatusBadge({
  state,
  launcherCategory,
  launcherDefinition,
  image,
  jobStoppingBadgeLabel,
}: BuildSessionStatusBadgeProps) {
  const { text } = launcherDefinition;

  switch (state) {
    case "starting":
      return (
        <LoaderStatusBadge
          label={`${text.state.starting} ${launcherCategory === "session" ? text.inline : ""}`}
        />
      );

    case "stopping":
      return (
        <LoaderStatusBadge
          label={
            launcherCategory === "job"
              ? jobStoppingBadgeLabel
              : text.delete.action
          }
        />
      );
    case "hibernated":
      return <HibernatedStatusBadge label={text.state.hibernated} />;
    case "failed":
      return <FailedStatusBadge label={text.state.failed} />;
    case "running":
      if (launcherCategory === "job") {
        return <WarningStatusBadge icon="icon" label="Running" />;
      }
      if (image) {
        return <SuccessStatusBadge label={`Running ${text.display}`} />;
      }
      return (
        <WarningStatusBadge icon="circle" label={`Running ${text.display}`} />
      );
    case "succeeded":
      if (launcherCategory !== "job") {
        return <UnknownStatusBadge />;
      }
      return <SuccessStatusBadge label="Completed" />;
    default:
      return <UnknownStatusBadge />;
  }
}

export function SessionStatusV2Badge({ session }: ActiveSessionV2Props) {
  const { status, image } = session;
  const state = status.state;
  const launcherCategory = sessionLauncherKindToCategory(session.session_type);
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);

  return (
    <div className={cx("d-flex", "flex-row", "gap-2", "align-items-center")}>
      <BuildSessionStatusBadge
        state={state}
        launcherCategory={launcherCategory}
        launcherDefinition={launcherDefinition}
        image={image}
        jobStoppingBadgeLabel={JOB_STOPPING_BUTTON_LABEL}
      />
    </div>
  );
}

function resolveSessionStatusLabel({
  state,
  variant,
  sessionType,
}: {
  state: SessionStatusState;
  variant: "card" | "list";
  sessionType: SessionLauncherKind;
}): string {
  const launcherCategory = sessionLauncherKindToCategory(sessionType);

  if (state === "stopping" && launcherCategory === "job") {
    return JOB_STOPPING_TITLE[variant];
  }

  const isSessionLauncher = launcherCategory === "session";
  const isListVariant = variant === "list";

  const titles = isSessionLauncher
    ? isListVariant
      ? SESSION_TITLE_DASHBOARD
      : SESSION_TITLE
    : JOB_TITLE;

  return titles[state] ?? titles.default;
}

interface SessionStatusStyles {
  textColorCard: string;
  textColorList: string;
  bgColor: string;
  bgOpacity: number;
  borderColor: string;
  sessionLine: string;
  sessionIcon: string;
  jobIcon: Icon;
}

export function getSessionStatusStyles(
  session: {
    status: { state: string };
    image?: string;
  },
  launcherCategory: LauncherCategory,
): SessionStatusStyles {
  const { status, image } = session;
  const state = status.state;

  if (state === SESSION_STATES.RUNNING && launcherCategory === "session") {
    return image ? SESSION_STYLES.SUCCESS : SESSION_STYLES.WARNING;
  }

  if (state === SESSION_STATES.RUNNING && launcherCategory === "job") {
    return SESSION_STYLES.RUNNING_JOB;
  }

  const stateStyleMap: Record<string, SessionStatusStyles> = {
    [SESSION_STATES.STARTING]: SESSION_STYLES.WARNING,
    [SESSION_STATES.STOPPING]: SESSION_STYLES.STOPPING,
    [SESSION_STATES.HIBERNATED]: SESSION_STYLES.HIBERNATED,
    [SESSION_STATES.FAILED]: SESSION_STYLES.FAILED,
    [SESSION_STATES.SUCCEEDED]: SESSION_STYLES.SUCCESS,
  };

  return stateStyleMap[state] ?? SESSION_STYLES.DEFAULT;
}

export function SessionStatusV2Label({
  session,
  variant = "card",
}: ActiveSessionV2Props) {
  const { status, image } = session;
  const launcherCategory = sessionLauncherKindToCategory(session.session_type);
  const styles = getSessionStatusStyles({ status, image }, launcherCategory);
  const statusLabel = resolveSessionStatusLabel({
    state: status.state,
    variant,
    sessionType: session.session_type,
  });

  return (
    <div
      className={cx(
        "d-flex",
        "flex-row",
        "gap-2",
        "align-items-center",
        "fs-4",
        "fw-bold",
      )}
    >
      <span
        className={
          variant === "list" ? styles.textColorList : styles.textColorCard
        }
      >
        {statusLabel}
      </span>
    </div>
  );
}

export function SessionStatusV2Description({
  session,
  showInfoDetails = true,
  includeIcon = true,
}: ActiveSessionDescV2Props) {
  const { started, status, session_type, job_completed_at } = session;
  const launcherCategory = sessionLauncherKindToCategory(session_type);
  return (
    <div
      className={cx(
        "time-caption",
        "d-flex",
        "flex-row",
        "gap-2",
        "align-items-center",
      )}
    >
      {(started || status.state === "succeeded") && (
        <SessionStatusV2Text
          startTimestamp={started ?? ""}
          jobCompletedAt={job_completed_at}
          status={status}
          launcherCategory={launcherCategory}
          includeIcon={includeIcon}
        />
      )}
      {showInfoDetails && (
        <SessionListRowStatusExtraDetailsV2 status={status} />
      )}
    </div>
  );
}

interface StatusExtraDetailsV2Props {
  status: SessionStatus;
}
function SessionListRowStatusExtraDetailsV2({
  status,
}: StatusExtraDetailsV2Props) {
  const ref = useRef<HTMLElement>(null);
  if (!status.message) return null;

  const popover = (
    <UncontrolledPopover
      target={ref}
      trigger="hover focus"
      placement="bottom"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <PopoverHeader>Kubernetes pod status</PopoverHeader>
      <PopoverBody>
        <PrettySessionErrorMessage message={status.message} />
      </PopoverBody>
    </UncontrolledPopover>
  );

  if (status.state == "failed")
    return (
      <>
        <span
          ref={ref}
          className={cx("text-muted", "cursor-pointer")}
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          (More details.)
        </span>
        {popover}
      </>
    );
  return (
    <>
      <span ref={ref}>
        <FontAwesomeIcon icon={faInfoCircle} />
      </span>
      {popover}
    </>
  );
}

export function SessionStatusV2Title({
  session,
  launcher,
}: ActiveSessionTitleV2Props) {
  const { state } = session.status;
  const launcherCategory = sessionLauncherKindToCategory(session.session_type);
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);
  const launcherText = launcherDefinition.text.inline;

  const text = getSessionStatusText(state, launcherText, !!launcher);

  return text ? <p className={cx("fst-italic", "mb-2")}>{text}</p> : null;
}

function getSessionStatusText(
  state:
    | "running"
    | "starting"
    | "stopping"
    | "failed"
    | "hibernated"
    | "succeeded",
  launcherText: string,
  hasLauncher: boolean,
): string | null {
  switch (state) {
    case "running":
      return hasLauncher
        ? `You are currently running a ${launcherText} from this launcher`
        : `You are currently running an orphan ${launcherText}`;
    case "starting":
      return `You are currently starting a ${launcherText} from this launcher`;
    case "stopping":
      return `You are currently deleting a ${launcherText} from this launcher`;
    case "hibernated":
      return `You have a paused ${launcherText} from this launcher`;
    case "failed":
      return `An error was encountered while attempting to launch this ${launcherText}.`;
    case "succeeded":
      return `You have a completed ${launcherText} from this launcher`;
    default:
      return null;
  }
}
interface SessionStatusV2TextProps {
  startTimestamp: string;
  jobCompletedAt?: string | null;
  status: SessionStatus;
  launcherCategory: LauncherCategory;
  includeIcon?: boolean;
}

interface SessionStatusTextPartsProps {
  state: SessionStatusState;
  launcherCategory: LauncherCategory;
  launcherCategoryDefinition: LauncherCategoryDefinition;
  status: SessionStatus;
  startTimestamp: string;
  jobCompletedAt?: string | null;
  startTimeText: ReactNode;
  elapsedTimeText: ReactNode;
}

function GetSessionStatusTextIcon({
  state,
  status,
  startTimestamp,
  jobCompletedAt,
}: Pick<
  SessionStatusTextPartsProps,
  "state" | "status" | "startTimestamp" | "jobCompletedAt"
>) {
  switch (state) {
    case "running":
    case "starting":
    case "failed":
      return <Clock fontSize={16} className="flex-shrink-0" />;
    case "hibernated":
      return status.will_delete_at ? (
        <Hourglass fontSize={16} className="flex-shrink-0" />
      ) : (
        <Clock fontSize={16} className="flex-shrink-0" />
      );
    case "succeeded":
      return startTimestamp && jobCompletedAt ? (
        <Clock fontSize={16} className="flex-shrink-0" />
      ) : (
        <CheckCircleFill fontSize={16} className="flex-shrink-0" />
      );
    default:
      return null;
  }
}

function GetSessionStatusTextContent({
  state,
  launcherCategory,
  launcherCategoryDefinition,
  status,
  startTimeText,
  elapsedTimeText,
}: SessionStatusTextPartsProps) {
  const { text } = launcherCategoryDefinition;

  switch (state) {
    case "running":
      return (
        <>
          {text.state.running} for {elapsedTimeText}
        </>
      );
    case "starting":
      return (
        <>
          {text.state.starting} since {elapsedTimeText}
        </>
      );
    case "hibernated": {
      const { will_delete_at, will_hibernate_at } = status;

      if (will_delete_at) {
        return (
          <>
            {text.state.hibernatedAndDelete}{" "}
            <TimeCaption
              datetime={will_delete_at}
              enableTooltip
              noCaption
              suffix=" "
              prefix=""
              includeRelativeSuffix={false}
            />
          </>
        );
      }

      const hibernationTimestamp = will_hibernate_at ?? "";
      if (hibernationTimestamp) {
        return (
          <>
            {text.state.hibernated}{" "}
            <TimeCaption
              datetime={hibernationTimestamp}
              enableTooltip
              noCaption
              includeRelativeSuffix={false}
            />
          </>
        );
      }

      return (
        <>
          {text.state.hibernated} <MissingHibernationInfo />
        </>
      );
    }
    case "failed":
      return launcherCategory === "session" ? (
        <>
          {text.state.failed} {"("}created {startTimeText}
          {")"}
        </>
      ) : (
        <>
          {text.state.failed} {startTimeText}
        </>
      );
    case "succeeded":
      return <>Completed {startTimeText}</>;
    default:
      return null;
  }
}

function SessionStatusV2Text({
  startTimestamp,
  jobCompletedAt,
  status,
  launcherCategory,
  includeIcon = true,
}: SessionStatusV2TextProps) {
  const { state } = status;
  const launcherCategoryDefinition =
    getLauncherCategoryDefinition(launcherCategory);
  const startTimeText = (
    <TimeCaption datetime={startTimestamp} enableTooltip noCaption />
  );
  const elapsedTimeText = (
    <TimeCaption
      datetime={startTimestamp}
      enableTooltip
      noCaption
      includeRelativeSuffix={false}
    />
  );

  const textParts: SessionStatusTextPartsProps = {
    state,
    launcherCategory,
    launcherCategoryDefinition,
    status,
    startTimestamp,
    jobCompletedAt,
    startTimeText,
    elapsedTimeText,
  };

  const content = <GetSessionStatusTextContent {...textParts} />;
  if (!content) {
    return null;
  }

  const icon = <GetSessionStatusTextIcon {...textParts} />;

  return (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      {includeIcon && icon}
      <span>{content}</span>
    </div>
  );
}
