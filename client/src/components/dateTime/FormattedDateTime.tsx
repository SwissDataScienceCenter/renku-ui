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

import React, { useEffect, useState } from "react";
import { DateTime, DurationUnit, Duration, DurationObjectUnits } from "luxon";
import { ThrottledTooltip } from "../Tooltip";

interface FormattedDateTimeProps {
  dateTime: DateTime | Date | string;
  format?: DateTimeFormat;
}

type DateTimeFormat = "full-with-seconds" | "full";

export const FormattedDateTime = ({
  dateTime: dateTime_,
  format,
}: FormattedDateTimeProps) => {
  const dateTime =
    dateTime_ instanceof DateTime
      ? dateTime_
      : dateTime_ instanceof Date
      ? DateTime.fromJSDate(dateTime_)
      : DateTime.fromISO(dateTime_);
  const formatString = formats[format ?? "full-with-seconds"];

  const [randomIdForTooltip] = useState<string>(() => {
    const rand = `${Math.random()}`.slice(2);
    return `datetime-${rand}`;
  });

  if (!dateTime.isValid) return <>Invalid DateTime</>;

  const tooltipContent = (
    <>
      {dateTime
        .setLocale("en")
        .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}
    </>
  );

  return (
    <span>
      <span id={randomIdForTooltip}>
        {dateTime.setLocale("en").toFormat(formatString)}
      </span>
      <ThrottledTooltip target={randomIdForTooltip} tooltip={tooltipContent} />
    </span>
  );
};

const formats = {
  "full-with-seconds": "yyyy-LL-dd HH:mm:ss ZZZZ",
  full: "yyyy-LL-dd HH:mm ZZZZ",
} as const;

interface FormattedRelativeDateTimeProps {
  dateTime: DateTime | Date | string;
}

export const FormattedRelativeDateTime = ({
  dateTime: dateTime_,
}: FormattedRelativeDateTimeProps) => {
  const dateTime =
    dateTime_ instanceof DateTime
      ? dateTime_
      : dateTime_ instanceof Date
      ? DateTime.fromJSDate(dateTime_)
      : DateTime.fromISO(dateTime_);

  if (!dateTime.isValid) return <>Invalid DateTime</>;

  return <FormattedRelativeDateTimeInternal dateTime={dateTime} />;

  // const [randomIdForTooltip] = useState<string>(() => {
  //   const rand = `${Math.random()}`.slice(2);
  //   return `datetime-${rand}`;
  // });

  // if (!dateTime.isValid) return <>Invalid DateTime</>;

  // const tooltipContent = (
  //   <>
  //     {dateTime
  //       .setLocale("en")
  //       .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}
  //   </>
  // );

  // return (
  //   <span>
  //     <span id={randomIdForTooltip}>
  //       {dateTime.setLocale("en").toFormat(formatString)}
  //     </span>
  //     <ThrottledTooltip target={randomIdForTooltip} tooltip={tooltipContent} />
  //   </span>
  // );
};

const REFRESH_INTERVAL_MS = Duration.fromObject({ minutes: 1 }).toMillis();

const FormattedRelativeDateTimeInternal = ({
  dateTime,
}: {
  dateTime: DateTime;
}) => {
  const [now, setNow] = useState(DateTime.utc());

  //eslint-disable-next-line spellcheck/spell-checker
  const duration = now.diff(dateTime).rescale();

  // const highestUnit = getHighestUnit(duration);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const newNow = DateTime.utc();
      console.log({ newNow });
      setNow(newNow);
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return <span>{duration.toHuman({ listStyle: "long" })}</span>;
};

const getHighestUnit = (duration: Duration): keyof DurationObjectUnits => {
  if (!duration.isValid) {
    return "milliseconds";
  }

  const asObject = duration.rescale().toObject();
  const unit = orderedUnits.find((unit) => (asObject[unit] ?? 0) != 0);
  return unit ?? "milliseconds";
};

const orderedUnits: (keyof DurationObjectUnits)[] = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
];
