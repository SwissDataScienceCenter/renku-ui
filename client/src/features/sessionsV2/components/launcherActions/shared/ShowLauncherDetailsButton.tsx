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

import { useCallback, useMemo } from "react";
import { Button } from "reactstrap";

import useLocationHash from "~/utils/customHooks/useLocationHash.hook";

interface ShowLauncherDetailsButtonProps {
  launcherId: string;
  className?: string;
}

export default function ShowLauncherDetailsButton({
  launcherId,
  className,
}: ShowLauncherDetailsButtonProps) {
  const [, setHash] = useLocationHash();
  const launcherHash = useMemo(() => `launcher-${launcherId}`, [launcherId]);
  const toggleLauncherView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === launcherHash;
      return isOpen ? "" : launcherHash;
    });
  }, [launcherHash, setHash]);

  return (
    <Button
      className={className}
      color="outline-primary"
      size="sm"
      onClick={toggleLauncherView}
      data-cy="open-panel-button"
    >
      Show launcher details
    </Button>
  );
}
