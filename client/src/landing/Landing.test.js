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
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import { testClient as client } from "../api-client";
import { generateFakeUser } from "../user/User.test";
import Landing from "./Landing";
import { StateModel, globalSchema } from "../model";

describe("rendering", () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();
  const model = new StateModel(globalSchema);

  it("renders home without crashing for anonymous user", async () => {
    const div = document.createElement("div");
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <Landing.Home
            welcomePage={btoa("## Welcome to Renku")}
            user={anonymousUser}
            model={model}
            client={client} />
        </MemoryRouter>, div);
    });
  });

  it("renders home without crashing for logged user", async () => {
    const div = document.createElement("div");
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <Landing.Home
            welcomePage={btoa("## Welcome to Renku")}
            user={loggedUser}
            model={model}
            client={client} />
        </MemoryRouter>, div);
    });
  });
});
