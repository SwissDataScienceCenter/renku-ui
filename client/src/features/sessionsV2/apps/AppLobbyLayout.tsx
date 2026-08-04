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
import type { ReactNode } from "react";
import { Link } from "react-router";

import progressBoxStyles from "~/components/progress/ProgressBox.module.scss";

interface AppLobbyLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * Shared column layout for the lobby, so every state it can land in — waking,
 * not running, failed — puts its heading and controls in the same place. A
 * visitor following a shared link often sees two of these in succession, and
 * having them jump around reads as a page change rather than a status change.
 *
 * Borrows the width and vertical offset from the session launch screens
 * (`progressBoxSmall`) rather than setting its own. Waiting for an app to wake
 * and waiting for a session to start are the same moment to a user, so the box
 * should land in the same place on screen. The waking state goes further and
 * uses `ProgressStepsIndicator` itself; this layout covers the states that have
 * no progress to report — a load error, or an app with no address yet.
 */
export default function AppLobbyLayout({
  title,
  children,
}: AppLobbyLayoutProps) {
  return (
    <div
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-column",
        "gap-3",
        "pb-5",
        "text-center",
        progressBoxStyles.progressBoxSmall,
        progressBoxStyles.progressBoxSmallSteps,
      )}
      data-cy="app-lobby-page"
    >
      <h1 className={cx("h3", "mb-0")}>{title}</h1>
      {children}
    </div>
  );
}

/**
 * The way out of every dead end in the lobby. Always offered, because a visitor
 * who arrived on a shared link has no other navigation to fall back on.
 */
export function BackToProjectLink({ projectUrl }: { projectUrl: string }) {
  return (
    <Link className="mt-2" data-cy="app-lobby-back-to-project" to={projectUrl}>
      Go to the project
    </Link>
  );
}
