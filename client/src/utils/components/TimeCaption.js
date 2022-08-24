/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import human from "human-time";
import React, { useRef } from "react";
import { ThrottledTooltip } from "./Tooltip";
import Time from "../helpers/Time";

/**
 *  renku-ui
 *
 *  TimeCaption.js
 *  TimeCaption component.
 */

function displayTimeFromDate(time) {
  if (time == null || time === "")
    return "at unknown time";

  const timeDiff = (new Date() - new Date(time)) / 1000;
  const displayTime = timeDiff < 3 ? "just now" : human(timeDiff);
  return displayTime;
}

function TimeCaption(
  { time, caption = "Updated", endCaption = "", endPunctuation = ".",
    className = "", noCaption = false, showTooltip = false }) {
  // Take a time and caption and generate a span that shows it
  const displayTime = displayTimeFromDate(time);
  const endCaptionStyled = (endCaption) ? " " + endCaption : "";
  if (!noCaption)
    className = "time-caption " + className;

  const ref = useRef(null);
  const tooltip = showTooltip ?
    <ThrottledTooltip target={ref} tooltip={Time.toIsoString(time)} /> : null;

  return (
    <>
      <span ref={ref}
        className={className}>{noCaption ? "" : caption} {displayTime}{endCaptionStyled}{endPunctuation}</span>
      {tooltip}
    </>
  );
}

export { TimeCaption };
