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

import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import type { SessionLauncher } from "../../../api/sessionLaunchersV2.api";
import JobSubmitButton from "./JobSubmitButton";

interface JobPanelSubmitProps {
  launcher: SessionLauncher;
  useOldImage?: boolean;
}

export default function JobPanelSubmit({
  launcher,
  useOldImage,
}: JobPanelSubmitProps) {
  const { isLaunchButtonDisabled } = useLauncherEnvironmentReadiness({
    launcher,
    useOldImage,
  });

  const permissions = useProjectPermissions({ projectId: launcher.project_id });

  const tooltip = isLaunchButtonDisabled
    ? `No image available. ${
        permissions.write
          ? "Run the Build action"
          : "Contact the project administrator "
      } to generate an image.`
    : undefined;

  return (
    <JobSubmitButton
      launcherId={launcher.id}
      disabled={isLaunchButtonDisabled}
      tooltip={tooltip}
    />
  );
}
