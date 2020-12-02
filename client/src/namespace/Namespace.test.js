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
 *  Namespace.test.js
 *  Tests for namespace.
 */

import React from "react";
import { act } from "react-dom/test-utils";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import { NamespaceProjects } from "./index";
import { testClient as client } from "../api-client";

describe("rendering", () => {
  it("renders NamespaceProjects", async () => {
    const props = {
      client,
      namespace: "test"
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(<MemoryRouter>
        <NamespaceProjects {...props} />
      </MemoryRouter>, div);
    });
  });
});
