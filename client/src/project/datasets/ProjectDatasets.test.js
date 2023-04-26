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
 *  ProjectDatasets.test.js
 *  Tests for datasets inside projects.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { createMemoryHistory } from "history";
import { act } from "react-test-renderer";

import { MemoryRouter } from "react-router-dom";
import { ACCESS_LEVELS, testClient as client } from "../../api-client";
import { StateModel, globalSchema } from "../../model";
import ChangeDataset from "./change/index";
import DatasetImport from "./import/index";
import { generateFakeUser } from "../../user/User.test";

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  let spy = null;

  const loggedUser = generateFakeUser();
  const fakeHistory = createMemoryHistory({
    initialEntries: ["/"],
    initialIndex: 0,
  });
  const migration = { core: { versionUrl: "" } };

  fakeHistory.push({
    pathname: "/projects/namespace/project-name/datasets/new",
  });

  beforeEach(() => {
    // ckeditor dumps some junk to the console.error. Ignore it.
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // eslint-disable-line @typescript-eslint/ban-types
    });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("renders NewDataset form without crashing", async () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ChangeDataset
            client={client}
            edit={false}
            location={fakeHistory}
            maintainer={ACCESS_LEVELS.maintainer}
            migration={migration}
            model={model}
            params={{ UPLOAD_THRESHOLD: { soft: 104857600 } }}
            user={loggedUser}
          />
        </MemoryRouter>
      );
    });
  });

  it("renders DatasetImport form without crashing", async () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DatasetImport
            client={client}
            edit={false}
            location={fakeHistory}
            maintainer={ACCESS_LEVELS.maintainer}
            migration={migration}
            model={model}
            user={loggedUser}
          />
        </MemoryRouter>
      );
    });
  });
});
