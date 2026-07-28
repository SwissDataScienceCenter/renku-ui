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

import { getLauncherCategory } from "~/features/sessionsV2/session.utils";
import JobLauncherActions from "./job/JobLauncherActions";
import SessionLauncherActions from "./session/SessionLauncherActions";
import type { LauncherActionsProps } from "./types";

export function LauncherActions({
  placement,
  builds,
  hasSession,
  lastBuild,
  launcher,
  otherActions,
  project,
}: LauncherActionsProps) {
  const category = getLauncherCategory(launcher);
  return category === "session" ? (
    <SessionLauncherActions
      builds={builds}
      hasSession={hasSession}
      lastBuild={lastBuild}
      launcher={launcher}
      otherActions={placement === "launcher-card" && otherActions}
      project={project}
      displayBuildActions={placement === "launcher-card"}
      alwaysShowLaunchAction={placement === "launcher-side-panel"}
    />
  ) : (
    <JobLauncherActions
      builds={builds}
      hasSession={hasSession}
      lastBuild={lastBuild}
      launcher={launcher}
      otherActions={placement === "launcher-card" && otherActions}
      project={project}
      displayBuildActions={placement === "launcher-card"}
    />
  );
}
