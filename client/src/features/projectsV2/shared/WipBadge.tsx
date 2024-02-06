/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import uniqueIdFn from "lodash/uniqueId";
import { useState } from "react";
import { Badge } from "reactstrap";

import { ThrottledTooltip } from "../../../components/Tooltip";

export default function WipBadge() {
  const [uniqueId] = useState(`wip-tooltip-toggle-${uniqueIdFn()}`);
  return (
    <>
      <ThrottledTooltip
        target={uniqueId}
        tooltip="This feature is under development and certain pieces may not work correctly."
      />
      <Badge id={uniqueId} className="wip-badge" color="warning">
        Alpha
      </Badge>
    </>
  );
}
