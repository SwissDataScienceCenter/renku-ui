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
 *  Maintenance.js
 *  Tests for maintenance components.
 */

import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import { Maintenance } from "./Maintenance";

describe("rendering", () => {
  it("renders Maintenance without info", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <Maintenance info={null} />
      </MemoryRouter>,
      div
    );
  });

  it("renders Maintenance with info", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <Maintenance info={"Important info"} />
      </MemoryRouter>,
      div
    );
  });
});
