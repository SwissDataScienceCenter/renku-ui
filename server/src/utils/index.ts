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
 * Convert string to booloan or numbers. Useful to handle values coming from environmental variables.
 *
 * @param value - Input string.
 * @param booleans - Whether to convert booleans or not. Conversion is case insensitive.
 * @param numbers - Whether to convert numbers or not.
 * @returns converted value.
 */
function convertType(value: string, booleans = true, numbers = true): boolean | number | string {
  if (value == null)
    return value;
  if (booleans) {
    const lowercase = value.toLowerCase();
    if (lowercase === "false")
      return false;
    if (lowercase === "true")
      return true;
  }
  if (numbers) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isNaN(value as any) && !isNaN(parseFloat(value))) // ? REF: https://stackoverflow.com/a/175787/1303090
      return parseFloat(value);
  }
  return value;
}

export { convertType };
