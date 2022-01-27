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
import React, { Component } from "react";

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

class TimeCaption extends Component {
  // Take a time and caption and generate a span that shows it
  render() {
    const displayTime = displayTimeFromDate(this.props.time);
    let caption = (this.props.caption) ? this.props.caption : "Updated";
    const endCaption = (this.props.endCaption) ? " " + this.props.endCaption : "";
    const endPunctuation = (this.props.endPunctuation) ? this.props.endPunctuation : ".";
    let className = this.props.className || "";
    const noCaption = this.props.noCaption;
    if (noCaption)
      caption = "";
    else
      className = "time-caption " + className;
    return <span className={className}>{caption} {displayTime}{endCaption}{endPunctuation}</span>;
  }
}

export { TimeCaption };
