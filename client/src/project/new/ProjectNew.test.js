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

import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";

import { StateModel, globalSchema } from "../../model";
import { NewProject } from "../new";
import { testClient as client } from "../../api-client";


const fakeHistory = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
});
fakeHistory.push({
  pathname: "/projects",
  search: "?page=1"
});

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const templates = { custom: false, repositories: [{}] };

  it("renders NewProject without crashing for logged user", () => {
    const div = document.createElement("div");
    // Fix UncontrolledTooltip error. https://github.com/reactstrap/reactstrap/issues/773
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <NewProject
          client={client}
          model={model}
          history={fakeHistory}
          templates={templates}
        />
      </MemoryRouter>
      , div);
  });
});
