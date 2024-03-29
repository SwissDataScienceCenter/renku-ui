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

import { NotebooksHelper } from "../../notebooks";

// ? Consider moving this under /features/session(s)/helpers

export interface Session {
  annotations: Record<string, unknown>;
  name: string;
}

interface NotebookAnnotations {
  default_image_used: string;
  branch: string;
  "commit-sha": string;
  gitlabProjectId: string;
  renkuVersion?: string;
}
function getFormattedSessionsAnnotations(sessions: Record<string, Session>) {
  const sessionsFormatted: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const sessionKey of Object.keys(sessions)) {
    const session = sessions[sessionKey];
    const annotations = NotebooksHelper.cleanAnnotations(
      session.annotations
    ) as NotebookAnnotations;

    // Filter out Renku 2.0 sessions
    if (annotations["renkuVersion"] === "2.0") {
      continue;
    }

    sessionsFormatted.push({ ...session, annotations });
  }
  return sessionsFormatted;
}

export { getFormattedSessionsAnnotations };
