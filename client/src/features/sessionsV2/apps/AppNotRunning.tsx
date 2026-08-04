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
  /** True when a deployment exists but has settled into a failure. */
  hasFailed: boolean;
  /**
   * The launcher this lobby addresses. Undefined only when the launchers query
   * failed — the page still renders, just without a name or an action.
   */
  launcher: SessionLauncher | undefined;
  project: Project;
  projectUrl: string;
}

/**
 * What a visitor sees when the link resolves but there is nothing to open:
 * either no app has been published from this launcher, or the deployment
 * failed.
 *
 * Most people who land here followed a shared link and can do nothing about it,
 * so the first job is to explain plainly that the address is right and the app
 * is not up — rather than showing an error that reads like a broken link.
 *
 * For someone who can act, the fix is offered in place. The action is the
 * project's own LauncherActions rather than a publish button written here: that
 * component already resolves the four conditions publishing depends on
 * (permission, project visibility, one-app-per-project, image readiness) and
 * self-fetches the build data it needs. Writing them out again here would
 * create a second place that has to agree with the launcher card about when
 * publishing is allowed.
 */
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
      {/* Rendered only for members: for everyone else LauncherActions would
          resolve to a disabled control, which invites clicking at something
          that can never work. */}
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
