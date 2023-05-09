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

import React, { useState } from "react";
import { Duration } from "luxon";
import { ThrottledTooltip } from "../Tooltip";

interface FormattedDurationProps {
  duration: Duration | number;
}

export const FormattedDuration = ({
  duration: duration_,
}: FormattedDurationProps) => {
  const duration = (
    duration_ instanceof Duration
      ? duration_
      : Duration.fromObject({ seconds: duration_ })
  )
    //eslint-disable-next-line spellcheck/spell-checker
    .rescale();

  const [randomIdForTooltip] = useState<string>(() => {
    const rand = `${Math.random()}`.slice(2);
    return `duration-${rand}`;
  });

  if (!duration.isValid) return <>Invalid Duration</>;

  const formatted =
    duration < Duration.fromObject({ seconds: 1 })
      ? "< 1 second"
      : duration < Duration.fromObject({ seconds: 1.5 })
      ? `1 second`
      : duration < Duration.fromObject({ minutes: 1 })
      ? `${Math.round(duration.shiftTo("seconds").seconds)} seconds`
      : duration < Duration.fromObject({ minutes: 1.5 })
      ? `1 minute`
      : duration < Duration.fromObject({ hours: 1 })
      ? `${Math.round(duration.shiftTo("minutes").minutes)} minutes`
      : duration < Duration.fromObject({ hours: 1.5 })
      ? `1 hour`
      : duration < Duration.fromObject({ hours: 24 })
      ? `${Math.round(duration.shiftTo("hours").hours)} hours`
      : "> 24 hours";

  const tooltipContent = <>{duration.toHuman({ listStyle: "long" })}</>;

  return (
    <span>
      <span id={randomIdForTooltip}>{formatted}</span>
      <ThrottledTooltip target={randomIdForTooltip} tooltip={tooltipContent} />
    </span>
  );
};
