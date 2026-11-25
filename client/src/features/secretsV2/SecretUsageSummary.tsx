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

import { TimeCaption } from "../../components/TimeCaption";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetNamespacesByNamespaceSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import type { SecretWithId } from "../usersV2/api/users.api";
import UserAvatar from "../usersV2/show/UserAvatar";

interface SecretUsageSummaryProps {
  className?: string;
  projects: Project[] | undefined;
  secret: SecretWithId;
}

/** One-line summary of where a user secret is used and when it was edited. */
export default function SecretUsageSummary({
  className,
  projects,
  secret,
}: SecretUsageSummaryProps) {
  const isUnused = secret.session_secret_slot_ids.length === 0;
  const [first, ...others] = projects ?? [];

  return (
    <div
      className={cx(
        "d-flex",
        "flex-wrap",
        "align-items-center",
        "column-gap-2",
        "small",
        "text-body-secondary",
        className,
      )}
      data-cy="secret-usage-summary"
    >
      {isUnused ? (
        <span>Not used in a project</span>
      ) : (
        first && (
          <>
            <SecretUsageProject project={first} />
            {others.length > 0 && (
              <span className={cx("border", "rounded-pill", "px-2")}>
                +{others.length} more
              </span>
            )}
          </>
        )
      )}
      {(isUnused || first) && <span aria-hidden>•</span>}
      <span>
        Edited{" "}
        <TimeCaption
          datetime={secret.modification_date}
          enableTooltip
          noCaption
        />
      </span>
    </div>
  );
}

function SecretUsageProject({ project }: { project: Project }) {
  const { data: namespace } = useGetNamespacesByNamespaceSlugQuery({
    namespaceSlug: project.namespace,
  });
  return (
    <span className={cx("d-inline-flex", "align-items-center", "gap-1")}>
      <span className={cx("fw-medium", "text-body")}>{project.name}</span>
      <span aria-hidden>·</span>
      <UserAvatar namespace={project.namespace} size="xs" />
      <span>{namespace?.name ?? project.namespace}</span>
    </span>
  );
}
