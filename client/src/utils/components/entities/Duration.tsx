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

import React from "react";

import Time from "../../helpers/Time";
import { UncontrolledTooltip } from "../../ts-wrappers";


export interface EntityDurationProps {
  duration: number | null;
  workflowId: string;
}

function EntityDuration({
  duration, workflowId
}: EntityDurationProps) {
  if (duration == null)
    return null;
  const elemId = `duration-${workflowId}`;

  return (
    <>
      <p id={elemId}>
        <span className="text-rk-text small">Runs in</span> {Time.getDuration(duration)}
      </p>
      <UncontrolledTooltip key={`duration-elem-${elemId}`} placement="top" target={elemId}>
        <span>Esitmated runtime</span>
      </UncontrolledTooltip>
    </>
  );
}

export default EntityDuration;
