/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";

import deleteJobImage from "~/features/sessionsV2/components/SessionModals/assets/DeleteJob.svg";
import { SessionStatusState } from "../../sessionsV2.types";

interface StopJobContentProps {
  status: SessionStatusState;
}

export default function StopJobContent({ status }: StopJobContentProps) {
  const stateLabel = status === "starting" ? "starting" : "running";
  const terminationEffect =
    status === "starting"
      ? "stop the submission and delete the job."
      : "interrupt the running processes and delete the job.";

  return (
    <>
      <img
        className={cx("d-flex", "mb-3", "mx-auto")}
        src={deleteJobImage}
        alt="delete job"
      />
      <p>
        This job is still {stateLabel}. Do you want to cancel it? This will{" "}
        {terminationEffect}
      </p>
    </>
  );
}
