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
import { PlayCircle } from "react-bootstrap-icons";
import { Link, type To } from "react-router";

export function sessionLaunchLinkTargetId(launcherId: string) {
  return `launch-btn-${launcherId}`;
}

interface SessionLaunchLinkProps {
  className?: string;
  isCustomLaunch?: boolean;
  isPrimaryAction?: boolean;
  label: string;
  launcherId: string;
  to: To;
}

export default function SessionLaunchLink({
  className,
  isCustomLaunch,
  isPrimaryAction = false,
  label,
  launcherId,
  to,
}: SessionLaunchLinkProps) {
  const link = (
    <Link
      className={className}
      to={to}
      data-cy={
        isCustomLaunch ? "start-custom-session-button" : "start-session-button"
      }
    >
      <PlayCircle className={cx("bi", "me-1")} />
      {label}
    </Link>
  );

  if (isPrimaryAction) {
    return <span id={sessionLaunchLinkTargetId(launcherId)}>{link}</span>;
  }

  return link;
}
