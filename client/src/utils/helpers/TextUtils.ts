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
// eslint-disable-next-line
function extractTextFromObject(obj: Record<string, any>): string[] {
  // eslint-disable-line
  const textValues: string[] = [];

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      textValues.push(value.charAt(0).toUpperCase() + value.slice(1));
    } else if (Array.isArray(value)) {
      for (const element of value) {
        if (typeof element === "string") {
          textValues.push(element.charAt(0).toUpperCase() + element.slice(1));
        } else if (typeof element === "object") {
          textValues.push(...extractTextFromObject(element));
        }
      }
    } else if (typeof value === "object") {
      textValues.push(...extractTextFromObject(value));
    }
  }
  return textValues;
}

export { extractTextFromObject };
