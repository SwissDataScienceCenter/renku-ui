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

import { DateTime } from "luxon";
import { ensureDateTime, toHumanDateTime } from "./DateTimeUtils";

describe("toHumanDateTime", () => {
  it("converts an invalid datetime", () => {
    const datetime = DateTime.fromISO("not a datetime");
    expect(datetime.isValid).toBe(false);

    const datetimeStr = toHumanDateTime({ datetime });

    expect(datetimeStr).toBe("Invalid DateTime");
  });

  it("converts a valid datetime", () => {
    const datetime = DateTime.fromISO("2023-01-28T20:05:42+01:00");

    const datetimeStr = toHumanDateTime({ datetime });

    expect(datetimeStr).toBe("2023-01-28 20:05:42 GMT+1");
  });

  it("converts a valid datetime - shorter format", () => {
    const datetime = DateTime.fromISO("2022-08-19T15:36:08+02:00");

    const datetimeStr = toHumanDateTime({ datetime, format: "full" });

    expect(datetimeStr).toBe("2022-08-19 15:36 GMT+2");
  });
});

describe("ensureDateTime", () => {
  it("converts an invalid datetime", () => {
    const input = "random input";

    const datetime = ensureDateTime(input);

    expect(datetime).toBeInstanceOf(DateTime);
    expect(datetime.isValid).toBe(false);
  });

  it("keeps a DateTime instance untouched", () => {
    const input = DateTime.utc();

    const datetime = ensureDateTime(input);

    expect(datetime).toBeInstanceOf(DateTime);
    expect(datetime.isValid).toBe(true);
    expect(datetime).toBe(input);
  });

  it("converts a Date instance", () => {
    const input = new Date();

    const datetime = ensureDateTime(input);

    expect(datetime).toBeInstanceOf(DateTime);
    expect(datetime.isValid).toBe(true);
    expect(datetime.valueOf()).toBe(input.valueOf());
  });

  it("converts a string", () => {
    const input = "2023-06-17T14:05:22+02:00";

    const datetime = ensureDateTime(input);

    expect(datetime).toBeInstanceOf(DateTime);
    expect(datetime.isValid).toBe(true);
    expect(datetime.toISO()).toBe("2023-06-17T14:05:22.000+02:00");
  });
});
