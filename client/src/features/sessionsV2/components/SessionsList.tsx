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

export interface SessionLauncherResources {
  poolName?: string;
  name?: string;
  cpu?: number;
  memory?: number;
  gpu?: number;
  storage?: number;
}

export interface SessionResources {
  requests?: { cpu?: number; memory?: string; storage?: string };
  usage?: { cpu?: number; memory?: string; storage?: string };
}

interface SessionRowResourceRequestsProps {
  resourceRequests: SessionResources["requests"] | SessionLauncherResources;
}

export function SessionRowResourceRequests({
  resourceRequests,
}: SessionRowResourceRequestsProps) {
  if (!resourceRequests) {
    return null;
  }
  if (Object.entries(resourceRequests).length == 0) {
    return null;
  }

  const numericEntries = Object.entries(resourceRequests).filter(
    ([name]) => name !== "name" && name !== "poolName"
  );
  const { poolName, name } = resourceRequests as SessionLauncherResources;
  const resourceClassName =
    poolName && name ? (
      <>
        <span className="fw-bold">{name}</span> class from{" "}
        <span className="fw-bold">{poolName}</span> pool
      </>
    ) : name ? (
      <>
        <span className="fw-bold">{name}</span> class
      </>
    ) : null;

  return (
    <div data-cy="session-view-resource-class-description">
      {resourceClassName && (
        <span key="name">
          <span className="text-nowrap">{resourceClassName}</span>
          {" | "}
        </span>
      )}
      {numericEntries.map(([key, value], index) => (
        <span key={key}>
          <span className="text-nowrap">
            <span className="fw-bold">
              {value} {(key === "memory" || key === "storage") && "GB "}
            </span>
            {key}
          </span>
          {numericEntries.length - 1 === index ? " " : " | "}
        </span>
      ))}
    </div>
  );
}
