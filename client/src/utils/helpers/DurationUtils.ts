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

import { DateTime, Duration, DurationObjectUnits } from "luxon";
import { ensureDateTime } from "./DateTimeUtils";

const DURATION_ORDERED_DISPLAY_UNITS: readonly (keyof DurationObjectUnits)[] = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
] as const;

export function toHumanDuration({
  duration: duration_,
}: {
  duration: Duration | number;
}): string {
  const duration = ensureDuration(duration_);

  if (!duration.isValid) {
    return "invalid duration";
  }

  const unit = getMostSignificantUnit(duration);
  const rescaled = Math.round(Math.abs(duration.as(unit)));

  if (unit === "seconds" && rescaled < 1) {
    return "< 1 second";
  }

  const unitStr = rescaled < 2 ? unit.slice(0, -1) : unit;
  return `${rescaled} ${unitStr}`;
}

function ensureDuration(duration: Duration | number): Duration {
  return duration instanceof Duration
    ? duration
    : Duration.fromObject({ seconds: duration });
}

function getMostSignificantUnit(duration: Duration): keyof DurationObjectUnits {
  if (!duration.isValid) {
    return "seconds";
  }

  const asObject = duration.rescale().toObject();
  const unit = DURATION_ORDERED_DISPLAY_UNITS.find(
    (unit) => (asObject[unit] ?? 0) != 0
  );
  return unit ?? "seconds";
}

export function toShortHumanDuration({
  duration: duration_,
}: {
  duration: Duration | number;
}): string {
  const duration = ensureDuration(duration_);
  const hours = Math.abs(duration.as("hours"));

  if (hours >= 24) {
    return "> 24 hours";
  }

  return toHumanDuration({ duration });

  // return duration < Duration.fromObject({ seconds: 1 })
  //   ? "< 1 second"
  //   : duration < Duration.fromObject({ seconds: 1.5 })
  //   ? `1 second`
  //   : duration < Duration.fromObject({ minutes: 1 })
  //   ? `${Math.round(duration.shiftTo("seconds").seconds)} seconds`
  //   : duration < Duration.fromObject({ minutes: 1.5 })
  //   ? `1 minute`
  //   : duration < Duration.fromObject({ hours: 1 })
  //   ? `${Math.round(duration.shiftTo("minutes").minutes)} minutes`
  //   : duration < Duration.fromObject({ hours: 1.5 })
  //   ? `1 hour`
  //   : duration < Duration.fromObject({ hours: 24 })
  //   ? `${Math.round(duration.shiftTo("hours").hours)} hours`
  //   : "> 24 hours";
}

export function toHumanRelativeDuration({
  datetime: datetime_,
  now,
}: {
  datetime: DateTime | Date | string;
  now: DateTime;
}): string {
  const datetime = ensureDateTime(datetime_);
  const duration = now.diff(datetime);

  const seconds = Math.abs(duration.as("seconds"));
  if (seconds < 1) {
    return "just now";
  }

  const suffix = duration.valueOf() > 0 ? "ago" : "from now";
  const durationStr = toHumanDuration({ duration });
  return `${durationStr} ${suffix}`;
}
