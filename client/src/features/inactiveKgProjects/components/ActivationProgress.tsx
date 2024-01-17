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

import { Progress } from "reactstrap";

import { Loader } from "../../../components/Loader";
import type { InactiveKgProjects } from "../inactiveKgProjects.types";
import { ActivationStatusProgressError } from "../InactiveKgProjectsApi";

interface ActivationProgressProps {
  project: InactiveKgProjects;
}
function ActivationProgress({ project }: ActivationProgressProps) {
  if (project.progressActivation === null)
    return <small className="fst-italic">Not indexed</small>;

  if (project.progressActivation === ActivationStatusProgressError.UNKNOWN)
    return (
      <small className="text-danger">
        There was an error indexing this project. Please contact us for help.
      </small>
    );

  if (project.progressActivation === ActivationStatusProgressError.TIMEOUT)
    return (
      <small className="text-danger">
        The indexing status is slow to progress. Refresh this page or check the
        project later to see if indexing has completed, or contact us for help.
      </small>
    );

  if (
    project.progressActivation ===
    ActivationStatusProgressError.WEB_SOCKET_ERROR
  )
    return (
      <small className="text-danger">
        There was a problem with the connection to the server. Please refresh
        this page to see if indexing has completed.
      </small>
    );

  if (project.progressActivation === 100)
    return <small className="text-success">Activated</small>;

  const progressStyle = { height: "1rem", width: "4rem" };
  if (project.progressActivation === 0 || project.progressActivation === -1) {
    return (
      <small>
        <div className="d-flex align-items-center">
          <Loader size={16} />
          &nbsp;<div>Starting...</div>
        </div>
      </small>
    );
  }

  return (
    <Progress
      striped
      animated
      className="my-3"
      color="rk-text"
      style={progressStyle}
      value={project.progressActivation}
    />
  );
}

export default ActivationProgress;
