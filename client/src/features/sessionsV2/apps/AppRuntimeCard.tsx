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
import { CircleSquare } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader } from "reactstrap";

import { CommandCopy } from "~/components/commandCopy/CommandCopy";
import { TimeCaption } from "~/components/TimeCaption";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { SessionLauncher } from "~/features/sessionsV2/api/sessionLaunchersV2.api";
import { LauncherActions } from "~/features/sessionsV2/components/launcherActions/LauncherActions";
import { toSecureAppUrl } from "./apps.utils";
import useAppForLauncher from "./useAppForLauncher.hook";

interface AppRuntimeCardProps {
  launcher: SessionLauncher;
  project: Project;
}

/**
 * The running-deployment card for an app launcher — the app-shaped counterpart
 * to SessionView's "Launched session" card. Shows the deployment's public URL,
 * start time, and image when one exists, and always renders the status
 * indicator + primary action (Open / Start / Stop) via the shared
 * LauncherActions dispatcher (which routes apps to AppLauncherActions). The app
 * is read through the shared useAppForLauncher query, so this does not add a
 * second request — it collapses into the launcher card's existing /apps read.
 */
export default function AppRuntimeCard({
  launcher,
  project,
}: AppRuntimeCardProps) {
  const { app } = useAppForLauncher({
    projectId: project.id,
    launcherId: launcher.id,
  });
  const appUrl = app?.url ? toSecureAppUrl(app.url) : undefined;

  return (
    <Card data-cy="app-runtime-card">
      <CardHeader tag="h3" className={cx("align-items-center", "d-flex")}>
        <CircleSquare className={cx("bi", "me-1")} aria-hidden="true" />
        App
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {app ? (
          <dl className={cx("mb-0", "row", "g-2")}>
            {appUrl && (
              <>
                <dt className={cx("col-sm-3", "text-muted", "fw-normal")}>
                  Public URL
                </dt>
                <dd className={cx("col-sm-9", "mb-0")}>
                  <CommandCopy command={appUrl} noMargin />
                </dd>
              </>
            )}
            {app.started && (
              <>
                <dt className={cx("col-sm-3", "text-muted", "fw-normal")}>
                  Started
                </dt>
                <dd className={cx("col-sm-9", "mb-0")}>
                  <TimeCaption datetime={app.started} enableTooltip />
                </dd>
              </>
            )}
            {app.image && (
              <>
                <dt className={cx("col-sm-3", "text-muted", "fw-normal")}>
                  Image
                </dt>
                <dd className={cx("col-sm-9", "mb-0")}>
                  <CommandCopy command={app.image} noMargin />
                </dd>
              </>
            )}
          </dl>
        ) : (
          <p className="mb-0">No app is running from this launcher.</p>
        )}
        <div className={cx("d-flex", "justify-content-end")}>
          <LauncherActions
            placement="launcher-side-panel"
            launcher={launcher}
            project={project}
          />
        </div>
      </CardBody>
    </Card>
  );
}
