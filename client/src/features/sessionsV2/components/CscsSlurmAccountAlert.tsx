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
import { ArrowDown } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import ExternalLink from "~/components/ExternalLink";
import { NEW_DOCS_CSCS_INTEGRATION } from "~/utils/constants/NewDocs";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { SLURM_ACCOUNT_ENV_VARIABLE } from "../session.constants";
import { hasSlurmAccount, isCscsResourcePool } from "../session.utils";
import useResourcePoolByClassId from "../useResourcePoolByClassId.hook";

interface CscsSlurmAccountAlertProps {
  className?: string;
  launcher: Pick<SessionLauncher, "env_variables" | "resource_class_id">;
  /** When set, shows a button that scrolls to the environment variables. */
  onGoToEnvVariables?: () => void;
}

/**
 * Warns when a launcher uses a CSCS resource pool without setting the
 * `SLURM_ACCOUNT` environment variable, which CSCS sessions need.
 */
export default function CscsSlurmAccountAlert({
  className,
  launcher,
  onGoToEnvVariables,
}: CscsSlurmAccountAlertProps) {
  const { resourcePool } = useResourcePoolByClassId(launcher.resource_class_id);

  if (
    resourcePool == null ||
    !isCscsResourcePool(resourcePool) ||
    hasSlurmAccount(launcher)
  ) {
    return null;
  }

  return (
    <WarnAlert
      className={cx("mb-0", className)}
      data-cy="cscs-slurm-account-alert"
      dismissible={false}
    >
      <p className="fw-bold">CSCS Slurm account required</p>
      <p>
        The <span className="fw-bold">{resourcePool.name}</span> resource pool
        runs on CSCS. Sessions there need the{" "}
        <code>{SLURM_ACCOUNT_ENV_VARIABLE}</code> environment variable set to
        your CSCS project (e.g. <code>g159</code>), otherwise the job will fail.
      </p>
      <p className={cx(onGoToEnvVariables == null && "mb-0")}>
        Add it to this launcher&apos;s environment variables. See the{" "}
        <ExternalLink href={NEW_DOCS_CSCS_INTEGRATION}>
          CSCS integration guide
        </ExternalLink>{" "}
        for details.
      </p>
      {onGoToEnvVariables != null && (
        <Button
          color="outline-primary"
          data-cy="cscs-slurm-account-go-to-env-variables"
          onClick={onGoToEnvVariables}
          size="sm"
        >
          <ArrowDown className={cx("bi", "me-1")} />
          Go to environment variables
        </Button>
      )}
    </WarnAlert>
  );
}
