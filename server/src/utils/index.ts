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


/**
 * Return target cookies if matched.
 *
 * @param cookies - cookies string containing all cookies
 * @param target - target cookie name
 * @returns value of the target cookie. Null if unmatched
 */
function getCookieValueByName(cookies: string, target: string): string {
  if (!cookies || !target || cookies.length < 1 || target.length < 1)
    return null;
  const match = cookies.match(new RegExp("(^| )" + target + "=([^;]+)"));
  return match ? match[2] : null;
}


/**
 * Simulate a sleep function.
 * @param {number} seconds - length of the sleep time span in seconds
 * @example await sleep(0.5) // sleep for 0.5 seconds
 */
async function sleep(seconds: number): Promise<void> {
  await new Promise(r => setTimeout(r, seconds * 1000));
}


const RELEASE_UNKNOWN = "unknown";
const RELEASE_DEV = "-dev";

/**
 * Return the release definition.
 *
 * @param {string} [version] - server UI version in the format "<major>.<minor>.<patch>-<short-SHA>".
 */
function getRelease(version: string): string {
  // Check input validity
  if (!version || typeof version !== "string")
    return RELEASE_UNKNOWN;

  // Check format validity
  const regValid = new RegExp(/^\d*(\.\d*){0,2}(-[a-f0-9]{7,32})?$/);
  const resValid = version.match(regValid);
  if (!resValid || !resValid[0])
    return RELEASE_UNKNOWN;

  // Extract information
  const regRelease = new RegExp(/^\d*(\.\d*){0,2}/);
  const resRelease = version.match(regRelease);
  const release = (!resRelease || !resRelease[0]) ?
    RELEASE_UNKNOWN :
    resRelease[0];
  const regPatch = new RegExp(/-[a-f0-9]{6,32}$/);
  const resPatch = version.match(regPatch);
  const patch = (!resPatch || !resPatch[0]) ?
    "" :
    RELEASE_DEV;
  return release + patch;
}

export { convertType, getCookieValueByName, getRelease, sleep };
