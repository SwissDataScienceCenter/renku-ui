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
import JobCardActions from "./job/JobCardActions";
import JobPanelSubmit from "./job/JobPanelSubmit";
import SessionCardActions from "./session/SessionCardActions";
import SessionPanelActions from "./session/SessionPanelActions";
import type { LauncherActionsProps } from "./types";

export function LauncherActions({
  placement,
  hasSession,
  lastBuild,
  launcher,
  namespace,
  otherActions,
  slug,
  useOldImage,
}: LauncherActionsProps) {
  const category = getLauncherCategory(launcher);

  if (placement === "launcher-card") {
    return category === "session" ? (
      <SessionCardActions
        hasSession={hasSession}
        lastBuild={lastBuild}
        launcher={launcher}
        namespace={namespace}
        otherActions={otherActions}
        slug={slug}
        useOldImage={useOldImage}
      />
    ) : (
      <JobCardActions
        hasSession={hasSession}
        lastBuild={lastBuild}
        launcher={launcher}
        namespace={namespace}
        otherActions={otherActions}
        slug={slug}
        useOldImage={useOldImage}
      />
    );
  }

  return category === "session" ? (
    <SessionPanelActions
      hasSession={hasSession}
      launcher={launcher}
      namespace={namespace}
      slug={slug}
      useOldImage={useOldImage}
    />
  ) : (
    <JobPanelSubmit launcher={launcher} useOldImage={useOldImage} />
  );
}
