/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { appendCustomUrlPath } from "./NotebookUrl";

describe("Test notebook URL functions", () => {
  describe("Test appendCustomUrlPath", () => {
    const notebookUrlA = "https://dev.renku.ch/sessions/user-session-id";
    const notebookUrlB =
      "https://dev.renku.ch/sessions/anon-session-id?token=anon-token";
    const customUrlPath = "/lab/tree/notebooks/MyNotebook.ipynb";

    it("Handles an empty custom path", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlA,
        customUrlPath: "",
      });
      expect(openUrl).toBe(notebookUrlA);
    });
    it("Handles an empty custom path - anon user", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlB,
        customUrlPath: "",
      });
      expect(openUrl).toBe(notebookUrlB);
    });
    it("Handles a custom path with leading /", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlA,
        customUrlPath,
      });
      expect(openUrl).toBe(
        "https://dev.renku.ch/sessions/user-session-id/lab/tree/notebooks/MyNotebook.ipynb"
      );
    });
    it("Handles a custom path with leading / - anon user", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlB,
        customUrlPath,
      });
      expect(openUrl).toBe(
        "https://dev.renku.ch/sessions/anon-session-id/lab/tree/notebooks/MyNotebook.ipynb?token=anon-token"
      );
    });
    it("Handles a custom path with leading ./", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlA,
        customUrlPath: `.${customUrlPath}`,
      });
      expect(openUrl).toBe(
        "https://dev.renku.ch/sessions/user-session-id/lab/tree/notebooks/MyNotebook.ipynb"
      );
    });
    it("Handles a custom path with leading ./ - anon user", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlB,
        customUrlPath: `.${customUrlPath}`,
      });
      expect(openUrl).toBe(
        "https://dev.renku.ch/sessions/anon-session-id/lab/tree/notebooks/MyNotebook.ipynb?token=anon-token"
      );
    });
    it("Handles a custom path with no leading /", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlA,
        customUrlPath: customUrlPath.slice(1),
      });
      expect(openUrl).toBe(
        "https://dev.renku.ch/sessions/user-session-id/lab/tree/notebooks/MyNotebook.ipynb"
      );
    });
    it("Handles a custom path with no leading / - anon user", () => {
      const openUrl = appendCustomUrlPath({
        notebookUrl: notebookUrlB,
        customUrlPath: customUrlPath.slice(1),
      });
      expect(openUrl).toBe(
        "https://dev.renku.ch/sessions/anon-session-id/lab/tree/notebooks/MyNotebook.ipynb?token=anon-token"
      );
    });
  });
});
