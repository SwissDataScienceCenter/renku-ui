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

import PermissionsGuard from "~/features/permissionsV2/PermissionsGuard";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import { SessionLauncher } from "~/features/sessionsV2/api/sessionLaunchersV2.api";
import InternalGitLabReferenceWarnBadge from "./InternalGitLabWarnBadge";
import { doesProjectReferenceRenkulabGitLab } from "./legacy.utils";

type SessionEnvironmentGitLabWarningBadgeForLauncherProps = {
  launcher: SessionLauncher;
};
function SessionEnvironmentGitLabWarningBadgeForLauncher({
  launcher,
}: SessionEnvironmentGitLabWarningBadgeForLauncherProps) {
  const userPermissions = useProjectPermissions({
    projectId: launcher.project_id,
  });

  return (
    <PermissionsGuard
      disabled={null}
      enabled={<InternalGitLabReferenceWarnBadge />}
      requestedPermission="write"
      userPermissions={userPermissions}
    />
  );
}

interface SessionEnvironmentGitLabWarningBadgeProps {
  launcher: SessionLauncher | null | undefined;
}

export default function SessionEnvironmentGitLabWarningBadge({
  launcher,
}: SessionEnvironmentGitLabWarningBadgeProps) {
  if (!launcher) return null;
  if (!doesProjectReferenceRenkulabGitLab(undefined, [launcher])) return null;
  return (
    <SessionEnvironmentGitLabWarningBadgeForLauncher launcher={launcher} />
  );
}
