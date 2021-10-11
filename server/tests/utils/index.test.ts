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

import { convertType } from "../../src/utils/index";


describe("Test utils functions", () => {
  it("Test convertType", async () => {
    // empty value
    expect(convertType(null)).toBe(null);

    // generic string left unchanged
    const stringyInput = "string";
    expect(convertType(stringyInput)).toBe(stringyInput);

    // boolean transformed -- when option is on
    expect(convertType("false")).toBe(false);
    expect(convertType("true")).toBe(true);
    expect(convertType("True")).toBe(true);
    expect(convertType("TRUE")).toBe(true);
    expect(convertType("TRUE", false, false)).not.toBe(true);

    // number transformed -- when option is on
    expect(convertType("12")).toBe(12);
    expect(convertType("0")).toBe(0);
    expect(convertType("-12")).toBe(-12);
    expect(convertType("12", false, false)).not.toBe(12);
  });
});
