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

function findReactSelectOptions(
  selectDataCy: string,
  reactSelectClassPrefix: string
) {
  return (
    cy
      .getDataCy(selectDataCy)
      // see https://stackoverflow.com/a/63844955/5804638
      .find(`.${reactSelectClassPrefix}__control`)
      .click()
      .get(`.${reactSelectClassPrefix}__menu`)
      .find(`.${reactSelectClassPrefix}__option`)
  );
}

export default function registerReactSelectCommands() {
  // This line incites a Type instantiation is excessively deep and possibly infinite.ts(2589) error
  // but we can ignore it
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Cypress.Commands.add("findReactSelectOptions", findReactSelectOptions);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      findReactSelectOptions: typeof findReactSelectOptions;
    }
  }
}
