
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
import ReactDOM from "react-dom";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ACCESS_LEVELS, testClient as client } from "../../api-client";
import { StateModel, globalSchema } from "../../model";
import ChangeDataset from "./change/index";
import DatasetImport from "./import/index";
import DatasetsListView from "./DatasetsListView";
import { generateFakeUser } from "../../user/User.test";
import AppContext from "../../utils/context/appContext";

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  let spy = null;

  const loggedUser = generateFakeUser();
  const fakeHistory = createMemoryHistory({
    initialEntries: ["/"],
    initialIndex: 0,
  });
  const migration = { core: { versionUrl: "" } };
  const templates = { custom: false, repositories: [{}] };
  const fakeLocation = { pathname: "" };
  const appContext = {
    client: client,
    params: { "TEMPLATES": templates },
    location: fakeLocation,
  };

  fakeHistory.push({
    pathname: "/projects/namespace/project-name/datasets/new"
  });

  beforeEach(() => {
    // ckeditor dumps some junk to the console.error. Ignore it.
    spy = jest.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("renders datasets list without crashing", () => {
    const props = {
      client: client,
      datasets_kg: [],
      datasets: [{
        "title": "Test dataset title",
        "identifier": "79215657-4319-4fcf-82b9-58267f2a1db8",
        "name": "test-dataset-name",
        "created_at": "2021-06-04 04:20:24.287936+00:00",
        "creators": [{
          "name": "First, Creator",
          "email": null,
          "affiliation": "Some Affiliation",
        }]
      }],
      graphStatus: false,
      migration,
      user: loggedUser,
      visibility: { accessLevel: ACCESS_LEVELS.MAINTAINER }
    };
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={model.reduxStore}>
        <MemoryRouter>
          <AppContext.Provider value={appContext}>
            <DatasetsListView
              {...props}
            />
          </AppContext.Provider>
        </MemoryRouter>
      </Provider>
      , div);
  });

  it("renders NewDataset form without crashing", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
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
      , div);
  });

  it("renders DatasetImport form without crashing", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
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
      , div);
  });
});
