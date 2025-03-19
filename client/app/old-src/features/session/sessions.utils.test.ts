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

import { describe, expect, it } from "vitest";

import { Sessions } from "./sessions.types";
import { getRunningSession } from "./sessions.utils";

describe("Test the session.utils functions", () => {
  it("function getRunningSession ", () => {
    const sessions = {
      "uppercase-random-name-1234": {
        annotations: {
          "renku.io/namespace": "uppercase-group/upper",
          "renku.io/projectName": "uppercase-namespace",
        },
        cloudstorage: [],
        image: "registry.dev.renku.ch/something",
        name: "some-name",
        resources: {},
        started: "2023-10-31T10:46:31+00:00",
        state: {},
        status: {
          details: [],
          readyNumContainers: 7,
          state: "running",
          totalNumContainers: 7,
          warnings: [],
        },
        url: "https://some-url",
      },
    } as Sessions;

    // ? mind uppercase namespaces were creating problems cause renku-notebooks lowers them.
    const values = [
      {
        url: "/projects/uppercase-group/upper/uppercase-namespace/sessions/new?autostart=1",
        match: true,
      },
      {
        url: "/projects/uppercase-group/UPPER/uppercase-namespace/sessions/new?autostart=1",
        match: true,
      },
      {
        url: "/projects/uppercase-group/FAKE-PROJECT/sessions/new?autostart=1",
        match: false,
      },
      {
        url: "",
        match: false,
      },
    ];

    for (const value of values) {
      const runningSessions = getRunningSession({
        autostartUrl: value.url,
        sessions,
      });
      if (value.match) expect(runningSessions).toBeTruthy();
      else expect(runningSessions).toBeFalsy();
    }
  });
});
