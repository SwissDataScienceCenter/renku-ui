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

import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { StateModel, globalSchema } from "../../model";
import { generateFakeUser } from "../../user/User.test";
import { ProjectSettingsGeneral, ProjectSettingsNav } from "./index";

const model = new StateModel(globalSchema);

describe("rendering", () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();

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
    for (let user of [loggedUser, anonymousUser]) {
      const props = {
        metadata: {
          sshUrl: "SSH URL",
          httpUrl: "HTTP URL",
        },
        user,
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
    }
  });
});
