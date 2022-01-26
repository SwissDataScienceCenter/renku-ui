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

import { convertType, getCookieValueByName, getRelease } from "../../src/utils";


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

  it("Test getCookieValueByName", async () => {
    const target = "anon-id";
    const values = [
      {
        cookies: "ui-server-session=0f2-5feef-a50B9; session=35184a0_630.XL56xeF4pmsLMI; anon-id=anon-ODvRAo6Ukj0ZE",
        result: "anon-ODvRAo6Ukj0ZE"
      },
      {
        cookies: "ui-server-session=0f2-5feef-a50B9; anon-id=anon-ODvRAo6Ukj0ZE; session=35184a0_630.XL56xeF4pmsLMI",
        result: "anon-ODvRAo6Ukj0ZE"
      },
      {
        cookies: "ui-server-session=062a726c-6737-4dae-8786-2b378a06c66c",
        result: null
      },
      {
        cookies: "anon-id=anon-aL84skoIRyaLvkhoBBwb2ZYkAXOo9IyhKEj5bDH7UPE",
        result: "anon-aL84skoIRyaLvkhoBBwb2ZYkAXOo9IyhKEj5bDH7UPE"
      },
      {
        cookies: "anon-id=anon-aL84skoIRyaLvkhoBBwb2ZYkAXOo9IyhKEj5bDH7UPE;",
        result: "anon-aL84skoIRyaLvkhoBBwb2ZYkAXOo9IyhKEj5bDH7UPE"
      },
      {
        cookies: "ui-server-session=062a726c-6737-4dae-8786-2b378a06c66c",
        result: null
      },
      {
        cookies: "",
        result: null
      },
      {
        cookies: null,
        result: null
      }
    ];
    for (const value of values)
      expect(getCookieValueByName(value.cookies, target)).toBe(value.result);
  });

  it("Test get release", () => {
    expect(getRelease("1.3.0-n24.h376dd06")).toBe("1.3.0-dev");
    expect(getRelease("1.3.0")).toBe("1.3.0");
    expect(getRelease("")).toBe("unknown");
    expect(getRelease(undefined)).toBe("unknown");
    expect(getRelease("abc")).toBe("unknown");
  });
});
