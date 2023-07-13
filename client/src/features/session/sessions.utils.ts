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
    const thisAutostartUrl = Url.get(Url.pages.project.session.autostart, {
      namespace: annotations.namespace,
      path: annotations.projectName,
    });
    return thisAutostartUrl === autostartUrl;
  });
  const sorted = runningSessions.sort((a, b) =>
    DateTime.fromISO(b.started).diff(DateTime.fromISO(a.started)).valueOf()
  );
  return sorted.at(0);
}

// /**
//  * Validate if a session is running calculating the startSessionURL and comparing with the given autostartSessionUrl
//  *
//  * @param {object} sessions - sessions object that should contain annotations for each session
//  * @param {string} startSessionUrl - start session url to check if it exists in sessions object
//  * @returns {boolean | object.showSessionURL} if session exist return
//  * session object including show session url otherwise return false
//  */
// function getSessionRunning(
//     sessions: Record<string, any>,
//     startSessionUrl: string
//   ) {
//     let sessionRunning = false;
//     Object.keys(sessions).forEach((sessionName) => {
//       const session = sessions[sessionName];
//       const annotations = NotebooksHelper.cleanAnnotations(
//         session.annotations
//       ) as Record<string, string>;
//       const autoStartUrl = Url.get(Url.pages.project.session.autostart, {
//         namespace: annotations["namespace"],
//         path: annotations["projectName"],
//       });
//       if (autoStartUrl === startSessionUrl)
//         sessionRunning = {
//           ...session,
//           showSessionURL: getShowSessionURL(annotations, session.name),
//         };
//     });
//     return sessionRunning;
//   }
