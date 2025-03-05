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

import {
  DateTime,
  Duration,
  DurationLikeObject,
  DurationObjectUnits,
} from "luxon";
import { ensureDateTime } from "./DateTimeUtils";

/**
 * Converts a duration-like object to a human-readable string.
 * @param duration a Duration instance or a number of seconds
 * @returns a human-readable string
 */
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
  const rescaled = Math.floor(Math.abs(duration.as(unit)));

  if (unit === "seconds" && rescaled < 1) {
    return "< 1 second";
  }

  const unitStr = rescaled < 2 ? unit.slice(0, -1) : unit;
  return `${rescaled} ${unitStr}`;
}

/**
 * Converts a duration-like object to a human-readable string without truncating to the most significant value.
 * @param duration a Duration instance or a number of seconds
 * @param units a list of units expected in the output representation, defaults to ["years","weeks","days","hours","minutes","seconds"]
 * @returns a human-readable string
 */
export function toFullHumanDuration(
  duration: Duration | number,
  units: (keyof DurationLikeObject)[] = ["days", "hours", "minutes", "seconds"]
): string {
  const duration_ = ensureDuration(duration);

  if (!duration_.isValid) {
    return "invalid duration";
  }
  const shiftedDuration = duration_.shiftTo(...units);
  const filteredDuration = Object.fromEntries(
    Object.entries(shiftedDuration.toObject()).filter(
      ([, value]) => value !== 0
    )
  );
  return Duration.fromObject(filteredDuration)
    .toHuman({
      unitDisplay: "narrow",
      maximumFractionDigits: 0,
    })
    .replace(/, /g, " ");
}

/**
 * @param duration a Duration instance or a number of seconds
 * @returns a Duration instance
 */
export function ensureDuration(duration: Duration | number): Duration {
  return duration instanceof Duration
    ? duration
    : isFinite(duration)
    ? Duration.fromObject({ seconds: duration })
    : Duration.fromISO("");
}

type DurationUnit = keyof DurationObjectUnits;

const DURATION_ORDERED_DISPLAY_UNITS: readonly DurationUnit[] = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
] as const;

/**
 * @returns the most significant duration unit from the input
 */
export function getMostSignificantUnit(duration: Duration): DurationUnit {
  if (!duration.isValid) {
    return "seconds";
  }

  const unit = DURATION_ORDERED_DISPLAY_UNITS.find(
    (unit) => Math.abs(duration.as(unit)) >= 1
  );
  return unit ?? "seconds";
}

/**
 * Converts a duration-like object to a human-readable string,
 * clamped to 24 hours maximum ("> 24 hours").
 * @param duration a Duration instance or a number of seconds
 * @returns a human-readable string
 */
export function toShortHumanDuration({
  duration: duration_,
}: {
  duration: Duration | number;
}): string {
  const duration = ensureDuration(duration_);
  const hours = Math.abs(duration.as("hours"));

  if (hours > 24) {
    return "> 24 hours";
  }

  return toHumanDuration({ duration });
}

/**
 * Converts a datetime-like object to a human-readable string relative to the current instant,
 * e.g. "3 minutes ago", "2 days from now".
 * @param datetime a DateTime instance, a Date instance or an ISO 8601 string
 * @param now the current instant
 * @returns a human-readable string
 */
export function toHumanRelativeDuration({
  datetime: datetime_,
  now,
}: {
  datetime: DateTime | Date | string;
  now: DateTime;
}): string {
  const datetime = ensureDateTime(datetime_);

  if (!datetime.isValid) {
    return "invalid datetime";
  }

  const duration = now.diff(datetime);

  const seconds = Math.abs(duration.as("seconds"));
  if (seconds < 1) {
    return "just now";
  }

  const suffix = duration.valueOf() > 0 ? "ago" : "from now";
  const durationStr = toHumanDuration({ duration });
  return `${durationStr} ${suffix}`;
}
