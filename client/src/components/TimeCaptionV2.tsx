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

import React, { ReactNode, useRef, useState } from "react";
import cx from "classnames";
import { DateTime } from "luxon";
import { UncontrolledTooltip } from "reactstrap";
import {
  ensureDateTime,
  toHumanDateTime,
} from "../utils/helpers/DateTimeUtils";
import { toHumanRelativeDuration } from "../utils/helpers/DurationUtils";

interface TimeCaptionProps {
  className?: string;
  datetime?: DateTime | Date | string;
  enableTooltip?: boolean;
  noCaption?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function TimeCaption({
  className: className_,
  datetime: datetime_,
  enableTooltip,
  noCaption,
  prefix,
  suffix,
}: TimeCaptionProps) {
  const [now] = useState<DateTime>(DateTime.utc());

  const datetime = datetime_ ? ensureDateTime(datetime_) : null;
  const durationStr =
    datetime != null && datetime.isValid
      ? toHumanRelativeDuration({ datetime, now })
      : "at unknown time";

  const className = noCaption ? className_ : cx("time-caption", className_);

  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={ref} className={className}>
        {prefix}
        {prefix && " "}
        {durationStr}
        {suffix && " "}
        {suffix}
      </span>
      {enableTooltip && datetime?.isValid && (
        <UncontrolledTooltip target={ref}>
          {toHumanDateTime({ datetime })}
        </UncontrolledTooltip>
      )}
    </>
  );
}
