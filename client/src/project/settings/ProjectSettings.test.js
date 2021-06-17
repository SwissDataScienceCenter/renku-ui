/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  ProjectSettings.test.js
 *  Tests for project settings.
 */

import React from "react";
import { act } from "react-dom/test-utils";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import { ProjectSettingsGeneral, ProjectSettingsNav, ProjectSettingsSessions } from "./index";
import { testClient as client } from "../../api-client";
import { StateModel, globalSchema } from "../../model";


const model = new StateModel(globalSchema);
const fakeLocation = { pathname: "" };

describe("rendering", () => {
  it("renders ProjectSettingsNav", async () => {
    const props = {
      settingsUrl: "",
      settingsSessionsUrl: ""
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(<MemoryRouter>
        <ProjectSettingsNav {...props} />
      </MemoryRouter>, div);
    });
  });

  it("renders ProjectSettingsGeneral", async () => {
    const props = {
      core: {},
      system: {}
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(<MemoryRouter>
        <ProjectSettingsGeneral {...props} />
      </MemoryRouter>, div);
    });
  });

  it("renders ProjectSettingsSessions", async () => {
    const props = {
      client,
      location: fakeLocation,
      model
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(<MemoryRouter>
        <ProjectSettingsSessions {...props} />
      </MemoryRouter>, div);
    });
  });
});
