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
 *  Privacy.test.js
 *  Tests for privacy
 */

import { createMemoryHistory } from "history";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-test-renderer";
import { describe, it } from "vitest";

import Cookie from "./Cookie";
import RoutedContent from "./RoutedContent";

const fakeHistory = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
});
fakeHistory.push({
  pathname: "/projects",
  search: "?page=1",
});

function getParams(statement = false, content = false, layout = false) {
  let params = {};
  if (statement) params["PRIVACY_STATEMENT"] = btoa("#Privacy");
  if (content)
    params["PRIVACY_BANNER_CONTENT"] = btoa(
      'We use cookies <a href="/">here</a>.'
    );
  if (layout) params["PRIVACY_BANNER_LAYOUT"] = { fakeProp: "fakeValue" };

  return params;
}

describe("rendering", () => {
  it("renders RoutedContent with different contents", async () => {
    const contents = [null, "Plain text", 'Html with <a href="/">anchor</a>.'];

    for (const content of contents) {
      const div = document.createElement("div");
      document.body.appendChild(div);
      const root = createRoot(div);

      await act(async () => {
        root.render(
          <MemoryRouter>
            <RoutedContent history={fakeHistory} content={content} />
          </MemoryRouter>
        );
      });
    }
  });

  it("renders Cookie with and without parameters", async () => {
    for (const content of [true, false]) {
      for (const layout of [true, false]) {
        const params = getParams(false, content, layout);
        const div = document.createElement("div");
        document.body.appendChild(div);
        const root = createRoot(div);
        await act(async () => {
          root.render(
            <MemoryRouter>
              <Cookie history={fakeHistory} params={params} />
            </MemoryRouter>
          );
        });
      }
    }
  });
});
