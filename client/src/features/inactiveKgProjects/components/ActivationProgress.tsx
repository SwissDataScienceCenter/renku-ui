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

import { Progress } from "../../../utils/ts-wrappers";
import React from "react";
import { InactiveKgProjects } from "../InactiveKgProjects";

interface ActivationProgressProps {
  project: InactiveKgProjects;
}
function ActivationProgress({ project }: ActivationProgressProps) {
  if (project.progressActivation === -2)
    return <small className="text-danger">There was an error in activating the KG. Please contact us for help. </small>;

  if (project.progressActivation === 100)
    return <small className="text-success">Activated</small>;

  if (project.progressActivation === null)
    return <small className="fst-italic">Inactive</small>;

  if (project.progressActivation === 0 || project.progressActivation === -1) {
    return <Progress
      animated
      striped
      className="my-3"
      color="rk-text"
      style={{ height: "12px", width: "200px" }}
      value={100}
    />;
  }

  return <Progress
    striped animated
    className="my-3"
    color="rk-text"
    style={{ height: "12px", width: "200px" }}
    value={project.progressActivation}
  />;
}

export default ActivationProgress;
