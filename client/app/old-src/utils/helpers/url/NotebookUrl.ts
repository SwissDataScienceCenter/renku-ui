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

export const appendCustomUrlPath = (args: {
  notebookUrl: string;
  customUrlPath: string;
}): string => {
  const { notebookUrl, customUrlPath } = args;
  if (!customUrlPath) return notebookUrl;

  try {
    const baseUrl = new URL(notebookUrl);
    if (!baseUrl.pathname.endsWith("/"))
      baseUrl.pathname = `${baseUrl.pathname}/`;
    const withFullPath = new URL(
      customUrlPath.startsWith("/") ? `.${customUrlPath}` : customUrlPath,
      baseUrl
    );
    baseUrl.pathname = withFullPath.pathname;
    return baseUrl.href;
  } catch (error) {
    if (error instanceof TypeError) return notebookUrl;
    throw error;
  }
};
