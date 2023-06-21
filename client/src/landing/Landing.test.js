/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  Landing.test.js
 *  Tests for landing.
 */

import React from "react";
import { createRoot } from "react-dom/client";

import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import AppContext from "../utils/context/appContext";
import { testClient as client } from "../api-client";
import { generateFakeUser } from "../user/User.test";
import { StateModel, globalSchema } from "../model";
import { Provider } from "react-redux";
import { Dashboard } from "../features/dashboard/Dashboard";
import { AnonymousHome } from "./index";

const appContext = {
  client: client,
  location: { pathname: "" },
};

describe("rendering", () => {
  const anonymousUser = generateFakeUser(true);
  const model = new StateModel(globalSchema);
  const location = { pathname: "", state: "", previous: "", search: "" };

  it("renders home without crashing for anonymous user", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    const params = {
      UI_SHORT_SHA: "development",
    };
    const homeCustomized = {
      custom: { enabled: false },
      tutorialLink: "fake-tutorial-link",
      projects: null,
      urlMap: {
        siteStatusUrl: `fake-siteStatusUrl`,
      },
    };
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <AppContext.Provider value={appContext}>
            <MemoryRouter>
              <AnonymousHome
                client={client}
                homeCustomized={homeCustomized}
                location={location}
                model={model}
                params={params}
                user={anonymousUser}
              />
            </MemoryRouter>
          </AppContext.Provider>
        </Provider>
      );
    });
  });

  it("renders home without crashing for logged user", async () => {
    const loggedUser = generateFakeUser();
    const div = document.createElement("div");
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <AppContext.Provider value={appContext}>
            <MemoryRouter>
              <Dashboard client={client} model={model} user={loggedUser} />
            </MemoryRouter>
          </AppContext.Provider>
        </Provider>
      );
    });
  });
});
