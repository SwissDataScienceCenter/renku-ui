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

import { Duration, DateTime } from "luxon";
import {
  ensureDuration,
  getMostSignificantUnit,
  toHumanDuration,
  toHumanRelativeDuration,
  toShortHumanDuration,
} from "./DurationUtils";

describe("toHumanDuration", () => {
  it("converts an invalid duration", () => {
    const duration = Duration.fromISO("not a duration");
    expect(duration.isValid).toBe(false);

    const durationStr = toHumanDuration({ duration });

    expect(durationStr).toBe("invalid duration");
  });

  it("converts a valid duration", () => {
    const duration = Duration.fromObject({ days: 64 });

    const durationStr = toHumanDuration({ duration });

    expect(durationStr).toBe("2 months");
  });

  it("converts a valid very short duration", () => {
    const duration = Duration.fromObject({ milliseconds: 638 });

    const durationStr = toHumanDuration({ duration });

    expect(durationStr).toBe("< 1 second");
  });
});

describe("ensureDuration", () => {
  it("converts an invalid duration", () => {
    const input = NaN;

    const duration = ensureDuration(input);

    expect(duration).toBeInstanceOf(Duration);
    expect(duration.isValid).toBe(false);
  });

  it("keeps a Duration instance untouched", () => {
    const input = Duration.fromObject({ days: 4 });

    const duration = ensureDuration(input);

    expect(duration).toBeInstanceOf(Duration);
    expect(duration.isValid).toBe(true);
    expect(duration).toBe(input);
  });

  it("converts a number of seconds", () => {
    const input = 187;

    const duration = ensureDuration(input);

    expect(duration).toBeInstanceOf(Duration);
    expect(duration.isValid).toBe(true);
    expect(duration.toISO()).toBe("PT187S");
  });
});

describe("getMostSignificantUnit", () => {
  it("extracts 'years'", () => {
    const duration = Duration.fromObject({ years: 1, months: 2 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("years");
  });

  it("extracts 'months' from a quarter", () => {
    const duration = Duration.fromObject({ quarters: 1, days: 1 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("months");
  });

  it("extracts 'months'", () => {
    const duration = Duration.fromObject({ days: 37 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("months");
  });

  it("extracts 'weeks'", () => {
    const duration = Duration.fromObject({ weeks: 1, days: 1 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("weeks");
  });

  it("extracts 'days'", () => {
    const duration = Duration.fromObject({ days: 4, hours: 1 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("days");
  });

  it("extracts 'hours'", () => {
    const duration = Duration.fromObject({ hours: 3 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("hours");
  });

  it("extracts 'minutes'", () => {
    const duration = Duration.fromObject({ minutes: 59, seconds: 59 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("minutes");
  });

  it("extracts 'seconds'", () => {
    const duration = Duration.fromObject({ minutes: 0.8 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("seconds");
  });

  it("extracts 'seconds' for a very short duration", () => {
    const duration = Duration.fromObject({ milliseconds: 524 });

    const unit = getMostSignificantUnit(duration);

    expect(unit).toBe("seconds");
  });
});

describe("toShortHumanDuration", () => {
  it("converts an invalid duration", () => {
    const duration = Duration.fromISO("not a duration");
    expect(duration.isValid).toBe(false);

    const durationStr = toShortHumanDuration({ duration });

    expect(durationStr).toBe("invalid duration");
  });

  it("converts a valid duration", () => {
    const duration = Duration.fromObject({ minutes: 83 });

    const durationStr = toShortHumanDuration({ duration });

    expect(durationStr).toBe("1 hour");
  });

  it("converts a valid very short duration", () => {
    const duration = Duration.fromObject({ milliseconds: 112 });

    const durationStr = toShortHumanDuration({ duration });

    expect(durationStr).toBe("< 1 second");
  });

  it("converts a valid long duration", () => {
    const duration = Duration.fromObject({ hours: 27 });

    const durationStr = toShortHumanDuration({ duration });

    expect(durationStr).toBe("> 24 hours");
  });
});

describe("toHumanRelativeDuration", () => {
  it("converts an invalid datetime", () => {
    const datetime = DateTime.fromISO("not a datetime");
    const now = DateTime.utc();
    expect(datetime.isValid).toBe(false);

    const relativeStr = toHumanRelativeDuration({ datetime, now });

    expect(relativeStr).toBe("invalid datetime");
  });

  it("converts a valid datetime in the past", () => {
    const duration = Duration.fromObject({ seconds: 195 });
    const datetime = DateTime.utc().minus(duration);
    const now = DateTime.utc();

    const relativeStr = toHumanRelativeDuration({ datetime, now });

    expect(relativeStr).toBe("3 minutes ago");
  });

  it("converts a valid datetime in the future", () => {
    const duration = Duration.fromObject({ days: 296 });
    const datetime = DateTime.utc().plus(duration);
    const now = DateTime.utc();

    const relativeStr = toHumanRelativeDuration({ datetime, now });

    expect(relativeStr).toBe("9 months from now");
  });

  it("converts a valid datetime just now", () => {
    const datetime = DateTime.utc();
    const now = DateTime.utc();

    const relativeStr = toHumanRelativeDuration({ datetime, now });

    expect(relativeStr).toBe("just now");
  });
});
