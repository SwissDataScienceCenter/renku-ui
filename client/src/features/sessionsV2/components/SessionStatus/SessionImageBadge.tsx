/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useMemo } from "react";
import { CircleFill } from "react-bootstrap-icons";

import { Loader } from "~/components/Loader";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import type { ResourcePoolWithId } from "../../api/computeResources.api";
import type { ImageCheckResponse } from "../../api/sessionsV2.api";
import { isImageCompatibleWith } from "../../session.utils";

interface SessionImageBadgeProps {
  data?: ImageCheckResponse | null;
  isLoading: boolean;

  resourcePool?: ResourcePoolWithId;
  isLoadingResourcePools?: boolean;
}

export default function SessionImageBadge({
  data,
  isLoading,
  resourcePool,
  isLoadingResourcePools,
}: SessionImageBadgeProps) {
  const isCompatible = useMemo(() => {
    if (data == null || resourcePool == null) {
      return "unknown";
    }
    return isImageCompatibleWith(data, resourcePool.platform);
  }, [data, resourcePool]);

  return (
    <RenkuBadge
      color={
        isLoading || isLoadingResourcePools
          ? "light"
          : isCompatible === false
          ? "danger"
          : data?.accessible
          ? "success"
          : data?.provider?.id &&
            (!data?.connection || data?.connection?.status !== "connected")
          ? "warning"
          : "danger"
      }
      className="fw-normal"
      pill
    >
      {isLoading || isLoadingResourcePools ? (
        <>
          <Loader className="me-1" size={12} inline />
          Checking image status.
        </>
      ) : (
        <>
          <CircleFill className={cx("bi", "me-1")} />
          {isCompatible === false
            ? `Image incompatible${
                resourcePool?.platform ? ` with ${resourcePool.platform}` : ""
              }`
            : data?.accessible
            ? "Image accessible"
            : data?.provider?.id &&
              (!data?.connection || data?.connection?.status !== "connected")
            ? "Integration required"
            : data?.connection?.status === "connected" ||
              data?.accessible === false
            ? "Image inaccessible"
            : "Image status unknown"}
        </>
      )}
    </RenkuBadge>
  );
}
