/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  ProjectNew.test.js
 *  New project test code.
 */

import { createMemoryHistory } from "history";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, it } from "vitest";

import { testClient as client } from "../../api-client";
import { StateModel, globalSchema } from "../../model";
import { generateFakeUser } from "../../user/User.test";
import AppContext from "../../utils/context/appContext";
import { ForkProject } from "./index";
import { CompatRouter } from "react-router-dom-v5-compat";

const fakeHistory = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
});
fakeHistory.push({
  pathname: "/projects",
  search: "?page=1",
});
const fakeLocation = { pathname: "" };

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const templates = { custom: false, repositories: [{}] };

  const loggedUser = generateFakeUser();
  const appContext = {
    client: client,
    params: { TEMPLATES: templates, GATEWAY_URL: "https://renkulab.io/api" },
    location: fakeLocation,
  };

  it("renders ForkProject without crashing for logged user", async () => {
    const div = document.createElement("div");
    // Fix UncontrolledTooltip error. https://github.com/reactstrap/reactstrap/issues/773
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <MemoryRouter>
            <CompatRouter>
              <AppContext.Provider value={appContext}>
                <ForkProject
                  client={client}
                  model={model}
                  history={fakeHistory}
                  user={loggedUser}
                />
              </AppContext.Provider>
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );
    });
  });
});
