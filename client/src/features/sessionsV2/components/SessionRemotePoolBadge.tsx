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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useRef } from "react";
import { ExclamationTriangleFill, HddNetwork } from "react-bootstrap-icons";
import { Link } from "react-router";
import { PopoverBody, PopoverHeader, UncontrolledPopover } from "reactstrap";

import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import {
  useGetOauth2ConnectionsQuery,
  useGetOauth2ProvidersQuery,
} from "~/features/connectedServices/api/connectedServices.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useResourcePoolByClassId from "../useResourcePoolByClassId.hook";
import useResourcePoolRemoteKind, {
  REMOTE_KIND_TEXT,
} from "../useResourcePoolRemoteKind.hook";

interface SessionRemotePoolBadgeProps {
  className?: string;
  resourceClassId: number;
  launcherInlineText: string;
}

export default function SessionRemotePoolBadge({
  className,
  resourceClassId,
  launcherInlineText,
}: SessionRemotePoolBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { resourcePool } = useResourcePoolByClassId(resourceClassId);
  const resourceClass = resourcePool?.classes.find(
    ({ id }) => id === resourceClassId,
  );

  const kind = useResourcePoolRemoteKind(resourcePool);

  const remote = resourcePool?.remote;
  const providerId = remote?.provider_id;
  const { data: providers } = useGetOauth2ProvidersQuery(
    providerId ? undefined : skipToken,
  );
  const { data: connections } = useGetOauth2ConnectionsQuery(
    providerId ? undefined : skipToken,
  );
  const provider = providers?.find(({ id }) => id === providerId);
  const isProviderConnected =
    connections == null
      ? undefined
      : connections.some(
          (connection) =>
            connection.provider_id === providerId &&
            connection.status === "connected",
        );
  const needsConnection = providerId != null && isProviderConnected === false;

  if (resourcePool == null || kind == null) {
    return null;
  }

  const { title, description } = REMOTE_KIND_TEXT[kind];
  const providerName = provider?.display_name ?? "remote";

  return (
    <>
      <RenkuBadge
        ref={ref}
        color={needsConnection ? "warning" : "light"}
        className={cx(
          "fw-normal",
          "d-inline-flex",
          "align-items-center",
          className,
        )}
        data-cy="session-remote-pool"
        pill
        tabIndex={0}
      >
        {needsConnection ? (
          <ExclamationTriangleFill className={cx("bi", "me-1")} />
        ) : (
          <HddNetwork className={cx("bi", "me-1")} />
        )}
        Remote pool
      </RenkuBadge>
      <UncontrolledPopover
        placement="bottom"
        target={ref}
        trigger="hover focus"
      >
        <PopoverHeader>{title}</PopoverHeader>
        <PopoverBody
          data-cy="session-remote-pool-details"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-0">
            This {launcherInlineText} runs {description} using the{" "}
            <span className="fw-bold">{resourcePool.name}</span> resource pool.
          </p>
          <p className={cx("mb-0", "mt-2")}>
            It requires an image compatible with{" "}
            <code>{resourcePool.platform}</code>.
          </p>
          {resourceClass?.preemptible && (
            <p className={cx("mb-0", "mt-2")}>
              This {launcherInlineText} can be preempted by other workloads.
            </p>
          )}
          {needsConnection && (
            <p
              className={cx("mb-0", "mt-2")}
              data-cy="session-remote-pool-connect"
            >
              <ExclamationTriangleFill className={cx("bi", "me-1")} />
              Your {providerName} account is not connected. Connect it from the{" "}
              <Link to={ABSOLUTE_ROUTES.v2.integrations.root}>
                Integrations
              </Link>{" "}
              page.
            </p>
          )}
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}
