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
import { useRef } from "react";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { PopoverBody, PopoverHeader, UncontrolledPopover } from "reactstrap";

import ExternalLink from "~/components/ExternalLink";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import { NEW_DOCS_CSCS_INTEGRATION } from "~/utils/constants/NewDocs";
import type { ResourcePoolWithIdFiltered } from "../api/computeResources.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { SLURM_ACCOUNT_ENV_VARIABLE } from "../session.constants";
import { hasSlurmAccount, isCscsResourcePool } from "../session.utils";

interface CscsSlurmAccountBadgeProps {
  className?: string;
  launcher: Pick<SessionLauncher, "env_variables">;
  resourcePool: ResourcePoolWithIdFiltered | undefined;
}

/**
 * Warns when a launcher uses a CSCS resource pool without setting the
 * `SLURM_ACCOUNT` environment variable, which CSCS sessions need.
 */
export default function CscsSlurmAccountBadge({
  className,
  launcher,
  resourcePool,
}: CscsSlurmAccountBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (
    resourcePool == null ||
    !isCscsResourcePool(resourcePool) ||
    hasSlurmAccount(launcher)
  ) {
    return null;
  }

  return (
    <>
      <RenkuBadge
        ref={ref}
        color="danger"
        className={cx("fw-normal", className)}
        data-cy="cscs-slurm-account-badge"
        pill
        tabIndex={0}
      >
        <ExclamationTriangleFill className="me-1" />
        Slurm account missing
      </RenkuBadge>
      <UncontrolledPopover
        placement="bottom"
        target={ref}
        trigger="hover focus"
      >
        <PopoverHeader>CSCS Slurm account required</PopoverHeader>
        <PopoverBody
          data-cy="cscs-slurm-account-details"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-2">
            The <span className="fw-bold">{resourcePool.name}</span> resource
            pool runs on CSCS. Sessions there need the{" "}
            <code>{SLURM_ACCOUNT_ENV_VARIABLE}</code> environment variable set
            to your CSCS project (e.g. <code>g159</code>), otherwise the job
            will fail.
          </p>
          <p className="mb-0">
            Add it to this launcher&apos;s environment variables. See the{" "}
            <ExternalLink href={NEW_DOCS_CSCS_INTEGRATION}>
              CSCS integration guide
            </ExternalLink>{" "}
            for details.
          </p>
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}
