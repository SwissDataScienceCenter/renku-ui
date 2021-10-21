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
 *  Statuspage.test.js
 *  Tests for statuspage code.
 */

import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import { statuspage as fakeStatuspage } from "../api-client/test-samples";
import { StateModel, globalSchema } from "../model";
import { StatuspageBanner, StatuspageDisplay } from "../statuspage";

function dummyStatusSummary() {
  return { retrieved_at: new Date(), statuspage: fakeStatuspage, error: null };
}

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const statusSummary = dummyStatusSummary();
  model.subModel("statuspage").setObject(statusSummary);
  const location = { pathname: "" };

  it("renders StatuspageBanner", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <StatuspageBanner store={model.reduxStore} model={model} location={location} />
      </MemoryRouter>,
      div
    );
  });

  it("renders StatuspageDetails", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <StatuspageDisplay store={model.reduxStore} model={model} />
      </MemoryRouter>,
      div
    );
  });
});

