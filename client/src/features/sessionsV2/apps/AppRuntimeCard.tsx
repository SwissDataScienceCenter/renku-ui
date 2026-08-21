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
import { useContext } from "react";
import { CircleSquare } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader } from "reactstrap";

import { CommandCopy } from "~/components/commandCopy/CommandCopy";
import { TimeCaption } from "~/components/TimeCaption";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { SessionLauncher } from "~/features/sessionsV2/api/sessionLaunchersV2.api";
import { LauncherActions } from "~/features/sessionsV2/components/launcherActions/LauncherActions";
import AppContext from "~/utils/context/appContext";
import { getAppLobbyUrl, toSecureAppUrl } from "./apps.utils";
import useAppForLauncher from "./useAppForLauncher.hook";

interface AppRuntimeCardProps {
  launcher: SessionLauncher;
  project: Project;
}

export default function AppRuntimeCard({
  launcher,
  project,
}: AppRuntimeCardProps) {
  const { app } = useAppForLauncher({
    projectId: project.id,
    launcherId: launcher.id,
  });

  const { params } = useContext(AppContext);
  const lobbyUrl = getAppLobbyUrl({
    origin: params?.BASE_URL || window.location.origin,
    namespace: project.namespace,
    slug: project.slug,
    launcherId: launcher.id,
  });

  return (
    <Card data-cy="app-runtime-card">
      <CardHeader tag="h3" className={cx("align-items-center", "d-flex")}>
        <CircleSquare className={cx("bi", "me-1")} aria-hidden="true" />
        App
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {app ? (
          <dl className={cx("mb-0", "row", "g-2")}>
            <dt className={cx("col-sm-3", "text-muted", "fw-normal")}>
              Share link
            </dt>
            <dd className={cx("col-sm-9", "mb-0")}>
              <CommandCopy command={lobbyUrl} noMargin />
              <p className={cx("form-text", "mb-0")}>
                Send this to people. It waits for the app to wake up before
                handing the visitor over.
              </p>
            </dd>
            {app.url && (
              <>
                <dt className={cx("col-sm-3", "text-muted", "fw-normal")}>
                  Direct URL
                </dt>
                <dd className={cx("col-sm-9", "mb-0")}>
                  <CommandCopy command={toSecureAppUrl(app.url)} noMargin />
                  <p className={cx("form-text", "mb-0")}>
                    The app itself, with no wake-up page. Use this for API
                    clients; a sleeping app may take a moment to answer.
                  </p>
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
