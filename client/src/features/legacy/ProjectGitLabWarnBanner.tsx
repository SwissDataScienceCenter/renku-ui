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
 * limitations under the License
 */
import cx from "classnames";
import { EmojiDizzy } from "react-bootstrap-icons";

import { ExternalLink } from "~/components/ExternalLinks";
import TakeActionAlert from "~/components/TakeActionAlert";
import PermissionsGuard from "~/features/permissionsV2/PermissionsGuard";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetProjectsByProjectIdSessionLaunchersQuery } from "~/features/sessionsV2/api/sessionLaunchersV2.api";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { Links } from "~/utils/constants/Docs";

import {
  DEFAULT_INTERNAL_GITLAB_HOSTS,
  doesProjectReferenceRenkulabGitLab,
} from "./legacy.utils";

function ProjectEditorWarnBanner() {
  return (
    <>
      <TakeActionAlert className="p-2" icon={null}>
        <div className={cx("d-flex", "align-items-start", "px-4", "py-2")}>
          <div>
            <h5>
              <EmojiDizzy className={cx("bi", "me-3")} />
            </h5>
          </div>
          <div>
            <h5>You must take action to avoid losing access to your data.</h5>
            <p>
              <b>Resources in this project will be removed</b> unless you
              migrate them before the RenkuLab GitLab shut down in{" "}
              <b>January 2026</b>.
            </p>
            <div>
              <ExternalLink
                className="text-take-action"
                color="light"
                data-cy="help-save-work-button"
                role="button"
                showLinkIcon={true}
                url={Links.RENKU_2_MIGRATE_AWAY_FROM_GITLAB}
              >
                Help me save my work
              </ExternalLink>
            </div>
          </div>
        </div>
      </TakeActionAlert>
    </>
  );
}

export default function ProjectGitLabWarnBanner({
  project,
}: {
  project: Project;
}) {
  const { data: currentUser } = useGetUserQueryState();
  const userPermissions = useProjectPermissions({ projectId: project.id });
  const {
    data: launchers,
    error: launchersError,
    isLoading: isLoadingLaunchers,
  } = useGetProjectsByProjectIdSessionLaunchersQuery({ projectId: project.id });
  if (currentUser == null) return null;
  if (isLoadingLaunchers || launchersError || launchers == null) return null;
  if (
    !doesProjectReferenceRenkulabGitLab(
      project.repositories,
      launchers,
      DEFAULT_INTERNAL_GITLAB_HOSTS
    )
  )
    return null;
  return (
    <PermissionsGuard
      disabled={null}
      enabled={<ProjectEditorWarnBanner />}
      requestedPermission="write"
      userPermissions={userPermissions}
    />
  );
}
