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

import { useRef } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { toShortHumanDuration } from "../../utils/helpers/DurationUtils";

export interface EntityDurationProps {
  duration: number | null;
}

function EntityDuration({ duration }: EntityDurationProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  if (duration == null) return null;

  return (
    <>
      <p ref={ref}>
        <span className="text-rk-text small">Runs in</span>{" "}
        {toShortHumanDuration({ duration })}
      </p>
      <UncontrolledTooltip placement="top" target={ref}>
        Estimated runtime
      </UncontrolledTooltip>
    </>
  );
}

export default EntityDuration;
