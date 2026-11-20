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
import { ExclamationTriangleFill, Pencil } from "react-bootstrap-icons";
import {
  Button,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import ExternalLink from "~/components/ExternalLink";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import type { ResourcePoolWithIdFiltered } from "../api/computeResources.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import type { RemotePoolRequiredEnvVariable } from "../session.constants";
import { getMissingRequiredEnvVariables } from "../session.utils";
import useResourcePoolByClassId from "../useResourcePoolByClassId.hook";

function getTitle(missing: RemotePoolRequiredEnvVariable[]): string {
  return missing.length === 1
    ? "Environment variable required"
    : "Environment variables required";
}

export function MissingEnvVariablesDetails({
  missing,
  resourcePoolName,
}: {
  missing: RemotePoolRequiredEnvVariable[];
  resourcePoolName: string;
}) {
  const isSingle = missing.length === 1;
  return (
    <>
      <p className="mb-2">
        The <span className="fw-bold">{resourcePoolName}</span> resource pool
        requires{" "}
        {isSingle ? "this environment variable" : "these environment variables"}
        :
      </p>
      <ul className={cx("mb-0", "ps-3")}>
        {missing.map((env) => (
          <li key={env.name}>
            <code>{env.name}</code>: {env.valueDescription}
            {env.example && (
              <>
                {" "}
                (e.g. <code>{env.example}</code>)
              </>
            )}
            .
            {env.docsUrl && (
              <>
                {" "}
                See the{" "}
                <ExternalLink href={env.docsUrl}>
                  {env.platformName} guide
                </ExternalLink>
                .
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

interface RemotePoolEnvVariablesBadgeProps {
  className?: string;
  launcher: Pick<SessionLauncher, "env_variables">;
  resourcePool: ResourcePoolWithIdFiltered | undefined;
}

/**
 * Warns when a launcher does not set the environment variables required by
 * its remote resource pool (e.g. "SLURM_ACCOUNT" on CSCS).
 */
export function RemotePoolEnvVariablesBadge({
  className,
  launcher,
  resourcePool,
}: RemotePoolEnvVariablesBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const missing = getMissingRequiredEnvVariables(launcher, resourcePool);

  if (resourcePool == null || missing.length === 0) {
    return null;
  }

  return (
    <>
      <RenkuBadge
        ref={ref}
        color="danger"
        className={cx("fw-normal", className)}
        data-cy="remote-pool-env-variables-badge"
        pill
        tabIndex={0}
      >
        <ExclamationTriangleFill className="me-1" />
        Metadata missing
      </RenkuBadge>
      <UncontrolledPopover
        placement="bottom"
        target={ref}
        trigger="hover focus"
      >
        <PopoverHeader>{getTitle(missing)}</PopoverHeader>
        <PopoverBody
          data-cy="remote-pool-env-variables-details"
          onClick={(event) => event.stopPropagation()}
        >
          <MissingEnvVariablesDetails
            missing={missing}
            resourcePoolName={resourcePool.name}
          />
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

interface RemotePoolEnvVariablesAlertProps {
  className?: string;
  launcher: Pick<SessionLauncher, "env_variables" | "resource_class_id">;
  onEditEnvVariables?: () => void;
}

/**
 * Alert version of `RemotePoolEnvVariablesBadge`.
 */
export function RemotePoolEnvVariablesAlert({
  className,
  launcher,
  onEditEnvVariables,
}: RemotePoolEnvVariablesAlertProps) {
  const { resourcePool } = useResourcePoolByClassId(launcher.resource_class_id);
  const missing = getMissingRequiredEnvVariables(launcher, resourcePool);

  if (resourcePool == null || missing.length === 0) {
    return null;
  }

  return (
    <WarnAlert
      className={cx("mb-0", className)}
      data-cy="remote-pool-env-variables-alert"
      dismissible={false}
    >
      <h4 className="fw-bold">{getTitle(missing)}</h4>
      <MissingEnvVariablesDetails
        missing={missing}
        resourcePoolName={resourcePool.name}
      />
      {onEditEnvVariables != null && (
        <Button
          className="mt-3"
          color="outline-primary"
          data-cy="remote-pool-env-variables-edit"
          onClick={onEditEnvVariables}
          size="sm"
        >
          <Pencil className="me-1" />
          Edit variables
        </Button>
      )}
    </WarnAlert>
  );
}
