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

export function extractTextFromObject(obj: Record<string, unknown>): string[] {
  return Object.values(obj).flatMap((value) => {
    if (typeof value === "string") {
      return [(value.charAt(0).toUpperCase() + value.slice(1)) as string];
    }
    if (Array.isArray(value)) {
      return (value as unknown[]).flatMap((element) => {
        if (typeof element === "string") {
          return [
            (element.charAt(0).toUpperCase() + element.slice(1)) as string,
          ];
        }
        if (typeof element === "object") {
          return extractTextFromObject(element as Record<string, unknown>);
        }
        return [];
      });
    }
    if (typeof value === "object") {
      return extractTextFromObject(value as Record<string, unknown>);
    }
    return [];
  });
}
