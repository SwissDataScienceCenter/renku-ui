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
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import {
  ProjectSettingsGeneral,
  ProjectSettingsNav,
  ProjectSettingsSessions,
} from "./index";
import { testClient as client } from "../../api-client";
import { StateModel, globalSchema } from "../../model";
import { Provider } from "react-redux";

const model = new StateModel(globalSchema);
const fakeLocation = { pathname: "" };

describe("rendering", () => {
  it("renders ProjectSettingsNav", async () => {
    const props = {
      settingsUrl: "",
      settingsSessionsUrl: "",
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProjectSettingsNav {...props} />
        </MemoryRouter>
      );
    });
  });

  it("renders ProjectSettingsGeneral", async () => {
    const props = {
      metadata: {},
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <MemoryRouter>
            <ProjectSettingsGeneral {...props} />
          </MemoryRouter>
        </Provider>
      );
    });
  });

  it("renders ProjectSettingsSessions", async () => {
    const props = {
      client,
      location: fakeLocation,
      model,
      store: model.reduxStore,
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <MemoryRouter>
            <ProjectSettingsSessions {...props} />
          </MemoryRouter>
        </Provider>
      );
    });
  });
});
