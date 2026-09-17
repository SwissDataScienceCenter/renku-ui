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
import { ArrowLeft } from "react-bootstrap-icons";
import { Link } from "react-router";

import progressBoxStyles from "~/components/progress/ProgressBox.module.scss";

interface AppLobbyLayoutProps {
  title: string;
  children: ReactNode;
}

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

export function BackToProjectLink({ projectUrl }: { projectUrl: string }) {
  return (
    <Link className="mt-2" data-cy="app-lobby-back-to-project" to={projectUrl}>
      <ArrowLeft className={cx("bi", "me-1")} />
      Go to the project
    </Link>
  );
}
