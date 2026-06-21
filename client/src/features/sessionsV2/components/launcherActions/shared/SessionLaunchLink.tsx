/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useCallback, useRef } from "react";
import { PlayCircle } from "react-bootstrap-icons";
import { Link, type To } from "react-router";
import { UncontrolledTooltip } from "reactstrap";

import { getLaunchActionTooltip } from "~/features/sessionsV2/session.utils";
import { ImageStatus } from "~/features/sessionsV2/sessionsV2.types";

interface SessionLaunchLinkProps {
  className?: string;
  isCustomLaunch?: boolean;
  isDisabled?: boolean;
  alreadyRunningSession: boolean;
  label: string;
  to: To;
  canWriteProject: boolean;
  imageStatus: ImageStatus;
}

function SessionLaunchLink({
  className,
  isCustomLaunch,
  isDisabled = false,
  label,
  to,
  alreadyRunningSession,
  canWriteProject,
  imageStatus,
}: SessionLaunchLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const tooltipContent = alreadyRunningSession
    ? "Cannot launch more than 1 session per session launcher."
    : getLaunchActionTooltip(canWriteProject, imageStatus, "session");

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.stopPropagation();
      if (isDisabled) {
        event.preventDefault();
      }
    },
    [isDisabled],
  );

  return (
    <>
      <Link
        ref={linkRef}
        aria-disabled={isDisabled || undefined}
        className={cx(className, isDisabled && "opacity-75")}
        to={to}
        data-cy={
          isCustomLaunch
            ? "start-custom-session-button"
            : "start-session-button"
        }
        onClick={handleClick}
      >
        <PlayCircle className={cx("bi", "me-1")} />
        {label}
      </Link>
      {tooltipContent ? (
        <UncontrolledTooltip target={linkRef}>
          {tooltipContent}
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}

export default SessionLaunchLink;
