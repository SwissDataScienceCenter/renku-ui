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

const DATETIME_FORMATS = {
  "full-with-seconds": "yyyy-LL-dd HH:mm:ss ZZZZ",
  full: "yyyy-LL-dd HH:mm ZZZZ",
} as const;
type DateTimeFormat = keyof typeof DATETIME_FORMATS;

/**
 * Converts a datetime-like object to a human-readable string.
 * @param datetime a DateTime instance, a Date instance or an ISO 8601 string
 * @param format the string format to use
 * @returns a human-readable string
 */
export function toHumanDateTime({
  datetime: datetime_,
  format = "full-with-seconds",
}: {
  datetime: DateTime | Date | string;
  format?: DateTimeFormat;
}): string {
  const datetime = ensureDateTime(datetime_);
  return datetime.setLocale("en").toFormat(DATETIME_FORMATS[format]);
}

/**
 * @param datetime a DateTime instance, a Date instance or an ISO 8601 string
 * @returns a DateTime instance
 */
export function ensureDateTime(datetime: DateTime | Date | string): DateTime {
  return datetime instanceof DateTime
    ? datetime
    : datetime instanceof Date
    ? DateTime.fromJSDate(datetime)
    : DateTime.fromISO(datetime);
}
