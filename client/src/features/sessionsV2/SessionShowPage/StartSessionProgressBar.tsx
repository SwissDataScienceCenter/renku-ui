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
import { Button } from "reactstrap";

import { Loader } from "~/components/Loader";
import { useGetResourcePoolsQuery } from "../api/computeResources.generated-api";
import { UsageAvailable } from "../session.utils";
import { SessionV2 } from "../sessionsV2.types";

import progressBoxStyles from "~/components/progress/ProgressBox.module.scss";

interface StartSessionProgressBarV2Props {
  session?: SessionV2;
  toggleLogs: () => void;
}
export function StartSessionProgressBarV2({
  session,
  toggleLogs,
}: StartSessionProgressBarV2Props) {
  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const resourceClass = resourcePools
    ?.flatMap((pool) => pool.classes)
    .find((cls) => cls.id === session?.resource_class_id);
  const statusData = session?.status;
  const description =
    statusData?.ready_containers != null &&
    statusData?.total_containers != null &&
    statusData?.total_containers > 0
      ? `${statusData.ready_containers} of ${statusData.total_containers} session services ready`
      : "Requesting session resources";

  return (
    <div
      className={cx(
        progressBoxStyles.progressBoxSmall,
        progressBoxStyles.progressBoxSmallSteps
      )}
    >
      <div data-cy="session-status-starting">
        <h2 className="fw-bold">Launching Session</h2>
        <p className="pb-0">Starting session services</p>
        {resourceClass?.usage_available != null && (
          <UsageAvailable usageAvailableHours={resourceClass.usage_available} />
        )}
        <div className={cx("d-flex", "gap-3", "mt-3")}>
          <Loader inline={true} size={24} />
          <div>{description}</div>
        </div>
      </div>
      <div>
        <Button className="mt-3" color="outline-primary" onClick={toggleLogs}>
          Open Logs
        </Button>
      </div>
    </div>
  );
}
