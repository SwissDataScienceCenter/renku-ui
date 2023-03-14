/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
 *  CoreErrorHelpers.js
 *  Error helpers for errors coming from renku-core.
 */


// * Identify core error * //

function isCoreError(error) {
  if (!error || !error.code)
    return false;
  if (error.code >= 1000 || error.code < 0)
    return true;
  return false;
}

function isCoreErrorNew(error) {
  if (!error || !error.code)
    return null;
  if (error.code >= 1000)
    return true;
  return false;
}

function isCoreErrorLegacy(error) {
  if (!error || !error.code)
    return null;
  if (error.code < 0)
    return true;
  return false;
}


// * Identify type of error -- only for new error format in core >= 9 * //

function isCoreErrorInput(error) {
  if (!error || !error.code)
    return null;
  if (error.code >= 1000 && error.code < 2000)
    return true;
  return false;
}

function isCoreErrorTemporary(error) {
  if (!error || !error.code)
    return null;
  if (error.code >= 2000 && error.code < 3000)
    return true;
  return false;
}

function isCoreErrorBug(error) {
  if (!error || !error.code)
    return null;
  if (error.code >= 3000)
    return true;
  return false;
}


const CoreError = {
  isBug: isCoreErrorBug,
  isInput: isCoreErrorInput,
  isLegacy: isCoreErrorLegacy,
  isNew: isCoreErrorNew,
  isTemporary: isCoreErrorTemporary,
  isValid: isCoreError
};

export { CoreError };
