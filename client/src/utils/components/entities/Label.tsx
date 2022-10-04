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

import * as React from "react";
import { EntityType, WorkflowType } from "./Entities";
import { Briefcase, CardList, Diagram3, HddStack } from "../../ts-wrappers";

/**
 *  renku-ui
 *
 *  Entity Label.tsx
 *  Entity Label component
 */
interface EntityLabelProps {
  type: EntityType;
  workflowType: WorkflowType | null;
}

function EntityLabel({ type, workflowType = null }: EntityLabelProps) {
  switch (type) {
    case "project":
      return (
        <div className="card-type-label text-rk-green gap-2 d-flex align-items-center">
          <Briefcase title="project" />
          Project
        </div>);
    case "dataset":
      return (
        <div className="card-type-label text-rk-pink gap-2 d-flex align-items-center">
          <HddStack title="dataset" />
          Dataset
        </div>
      );
    case "workflow":
      /* eslint-disable no-case-declarations */
      const icon = workflowType === "CompositePlan" ?
        (<CardList title="workflow" />) :
        (<Diagram3 title="workflow" />);
      const text = workflowType === "CompositePlan" ?
        "Composite workflow" :
        "Workflow";
      /* eslint-enable no-case-declarations */

      return (
        <div className="card-type-label text-rk-yellow gap-2 d-flex align-items-center">
          {icon} {text}
        </div>);
    default:
      return null;
  }
}

export default EntityLabel;
