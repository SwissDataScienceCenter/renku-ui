/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { Diagram3Fill } from "react-bootstrap-icons";

import LearnAboutV2Button from "~/features/projectsV2/shared/LearnAboutV2Button";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import PrimaryAlert from "../../../components/PrimaryAlert";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type { Project } from "../../projectsV2/api/projectV2.api";
import useProjectPermissions from "../utils/useProjectPermissions.hook";

function ProjectOwnerAutostartRedirectInfoContent() {
  return (
    <>
      <div>
        You have arrived here from an autostart link created on Renku Legacy.
      </div>
      <div>
        You can generate new autostart links that directly launch sessions on
        the updated platform by clicking the launcher dropdown menu and
        selecting &ldquo;Share session launch link&rdquo;.
      </div>
    </>
  );
}

function ProjectViewerAutostartRedirectInfoContent() {
  return (
    <>
      <div>
        You have arrived here from an autostart link created on Renku Legacy.
        This project has been migrated to the{" "}
        <LearnAboutV2Button>new Renku platform</LearnAboutV2Button>.
      </div>
      <div>
        <b>To launch a session</b>: Simply click &ldquo;Launch&rdquo; on any of
        the session launchers on the project page.
      </div>
    </>
  );
}

function ProjectAutostartRedirectInfoBanner({ isOwner }: { isOwner: boolean }) {
  return (
    <PrimaryAlert icon={<Diagram3Fill className="bi" />}>
      <div
        className={cx(
          "d-flex",
          "align-items-center",
          "justify-content-between",
          "flex-wrap",
          "w-100"
        )}
      >
        <div>
          <div>
            <b>Welcome to the New Renku!</b>
          </div>
          {isOwner ? (
            <ProjectOwnerAutostartRedirectInfoContent />
          ) : (
            <ProjectViewerAutostartRedirectInfoContent />
          )}
        </div>
      </div>
    </PrimaryAlert>
  );
}

export default function ProjectAutostartRedirectBanner({
  project,
}: {
  project: Project;
}) {
  const { data: currentUser } = useGetUserQueryState();
  const userPermissions = useProjectPermissions({ projectId: project.id });
  if (currentUser == null) return null;
  return (
    <>
      <PermissionsGuard
        disabled={<ProjectAutostartRedirectInfoBanner isOwner={false} />}
        enabled={<ProjectAutostartRedirectInfoBanner isOwner={true} />}
        requestedPermission="write"
        userPermissions={userPermissions}
      />
    </>
  );
}
