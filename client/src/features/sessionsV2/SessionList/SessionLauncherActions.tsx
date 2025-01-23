/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { Button, UncontrolledTooltip } from "reactstrap";

import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import type { SessionLauncher, SessionV2 } from "../sessionsV2.types";
import StartSessionButton from "../StartSessionButton";
import { useRef } from "react";

interface SessionLauncherActionsProps {
  launcher: SessionLauncher;
  sessions: SessionV2[];
}

export default function SessionLauncherActions({
  launcher,
  sessions,
}: SessionLauncherActionsProps) {
  const { project } = useProject();

  if (sessions.length > 0) {
    return <DisabledLaunchButton />;
  }

  return (
    <StartSessionButton
      launcherId={launcher.id}
      namespace={project.namespace}
      slug={project.slug}
    />
  );
}

function DisabledLaunchButton() {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span className="d-inline-block" tabIndex={0} ref={ref}>
        <Button type="button" color="primary" disabled size="sm">
          <PlayCircle className={cx("bi", "me-1")} />
          Launch
        </Button>
      </span>
      <UncontrolledTooltip target={ref}>
        A session is already running from this launcher
      </UncontrolledTooltip>
    </>
  );
}
