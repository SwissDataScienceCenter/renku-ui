/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
 *  InputValidator.js
 *
 */

function checkAtLeastLength(input, length) {
  return (input != null) && input.trim().length >= length;
}

function checkCreatorIsValid(input) {
  return input.value.find(creator =>
    creator.email && (creator.name.length <= 0 || creator.email.length <= 0)) === undefined;
}

export default {
  isNotEmpty: input => checkAtLeastLength(input.value, 1),
  isAtLeastLength: (input, minLength) => checkAtLeastLength(input.value, minLength),
  filesReady: (input) => {
    return input.value.filter(file => file.file_status !== "added").length
    === input.internalValues?.displayFiles?.length ||
    (input.value.filter(file => file.file_status !== "added").length === 0
    && input.internalValues?.displayFiles?.length === undefined);
  },
  optionExists: (input) => input.options.find(option => option.value === input.value) !== undefined,
  creatorIsValid: (input) => checkCreatorIsValid(input)
};
