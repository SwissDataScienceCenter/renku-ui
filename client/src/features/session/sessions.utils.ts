/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { DateTime } from "luxon";
import { NotebooksHelper } from "../../notebooks";
import { Url } from "../../utils/helpers/url";
import { Session, Sessions } from "./sessions.types";

interface GetRunningSessionArgs {
  autostartUrl: string;
  sessions: Sessions;
}

export function getRunningSession({
  autostartUrl,
  sessions,
}: GetRunningSessionArgs) {
  const runningSessions = Object.values(sessions).filter((session) => {
    const annotations = NotebooksHelper.cleanAnnotations(
      session.annotations
    ) as Session["annotations"];

    // Filter out Renku 2.0 sessions.
    if (annotations["renkuVersion"] === "2.0") {
      return false;
    }

    const thisAutostartUrl = Url.get(Url.pages.project.session.autostart, {
      namespace: annotations.namespace,
      path: annotations.projectName,
    });
    return thisAutostartUrl.toLowerCase() === autostartUrl.toLowerCase();
  });
  const sorted = runningSessions.sort((a, b) =>
    DateTime.fromISO(b.started).diff(DateTime.fromISO(a.started)).valueOf()
  );
  return sorted.at(0);
}

export function filterSessions(
  sessions: Sessions,
  predicate: (session: Session) => unknown
) {
  return Object.entries(sessions)
    .filter(([, session]) => predicate(session))
    .reduce(
      (prev, [name, session]) => ({ ...prev, [name]: session }),
      {} as Sessions
    );
}

export function filterSessionsWithCleanedAnnotations<
  T = Session["annotations"]
>(
  sessions: Sessions,
  predicate: (item: { session: Session; annotations: T }) => unknown
) {
  return filterSessions(sessions, (session) => {
    const annotations = NotebooksHelper.cleanAnnotations(
      session.annotations
    ) as T;
    return predicate({ session, annotations });
  });
}
