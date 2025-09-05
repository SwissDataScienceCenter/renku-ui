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

import { CircleFill } from "react-bootstrap-icons";
import { Loader } from "~/components/Loader";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import { ImageCheckResponse } from "../../api/sessionsV2.generated-api";

interface SessionImageBadgeProps {
  data?: ImageCheckResponse | null;
  loading: boolean;
}

export default function SessionImageBadge({
  data,
  loading,
}: SessionImageBadgeProps) {
  return (
    <RenkuBadge
      color={
        loading
          ? "light"
          : data?.accessible
          ? "success"
          : !data?.connection || data?.connection?.status === "connected"
          ? "danger"
          : data?.connection
          ? "warning"
          : "light"
      }
      className="fw-normal"
      pill
    >
      {loading ? (
        <>
          <Loader size={12} inline /> Checking image status.
        </>
      ) : (
        <>
          <CircleFill className="bi" /> Image{" "}
          {data?.accessible
            ? "available"
            : !data?.connection || data?.connection?.status === "connected"
            ? "unavailable"
            : data?.connection
            ? "requires credentials"
            : "status unknown"}
        </>
      )}
    </RenkuBadge>
  );
}
