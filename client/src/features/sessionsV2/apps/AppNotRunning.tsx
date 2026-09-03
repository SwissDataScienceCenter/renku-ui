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

import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { SessionLauncher } from "~/features/sessionsV2/api/sessionLaunchersV2.api";
import { LauncherActions } from "~/features/sessionsV2/components/launcherActions/LauncherActions";
import AppLobbyLayout, { BackToProjectLink } from "./AppLobbyLayout";

interface AppNotRunningProps {
  hasFailed: boolean;
  launcher: SessionLauncher | undefined;
  project: Project;
  projectUrl: string;
}

export default function AppNotRunning({
  hasFailed,
  launcher,
  project,
  projectUrl,
}: AppNotRunningProps) {
  const { write } = useProjectPermissions({ projectId: project.id });

  const title = hasFailed
    ? "This app failed to start"
    : "This app isn't running right now";
  const appName = launcher?.name;

  return (
    <AppLobbyLayout title={title}>
      {appName && (
        <p className={cx("fs-5", "mb-0")} data-cy="app-lobby-launcher-name">
          {appName}
        </p>
      )}
      <p className="mb-0">
        {hasFailed
          ? "The deployment did not come up."
          : "No app has been published from this launcher, or it has been stopped."}{" "}
        {write
          ? "You can start it from here."
          : "The link will start working again once someone with access to the project starts it."}
      </p>
      {write && launcher && (
        <div data-cy="app-lobby-launcher-actions">
          <LauncherActions
            placement="launcher-side-panel"
            launcher={launcher}
            project={project}
          />
        </div>
      )}
      <BackToProjectLink projectUrl={projectUrl} />
    </AppLobbyLayout>
  );
}
