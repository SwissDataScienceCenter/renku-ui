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

import { InfoAlert } from "~/components/Alert";
import useResourcePoolByClassId from "../useResourcePoolByClassId.hook";
import useResourcePoolRemoteKind, {
  REMOTE_KIND_TEXT,
} from "../useResourcePoolRemoteKind.hook";

interface SessionClassRemoteAlertProps {
  className?: string;
  launcherInlineText?: string;
  resourceClassId: number | null | undefined;
}

/**
 * Informs the user when the selected resource class belongs to a remote
 * resource pool, and which platform the session image must support.
 */
export default function SessionClassRemoteAlert({
  className,
  launcherInlineText = "session",
  resourceClassId,
}: SessionClassRemoteAlertProps) {
  const { resourcePool } = useResourcePoolByClassId(resourceClassId);
  const kind = useResourcePoolRemoteKind(resourcePool);

  if (resourcePool == null || kind == null) {
    return null;
  }

  const { description } = REMOTE_KIND_TEXT[kind];

  return (
    <InfoAlert
      className={className}
      data-cy="session-class-remote-alert"
      dismissible={false}
      timeout={0}
    >
      <p className="mb-1">
        This {launcherInlineText} will run {description} using the{" "}
        <span className="fw-bold">{resourcePool.name}</span> resource pool.
      </p>
      <p className="mb-0">
        It requires an image compatible with{" "}
        <code>{resourcePool.platform}</code>.
      </p>
    </InfoAlert>
  );
}
