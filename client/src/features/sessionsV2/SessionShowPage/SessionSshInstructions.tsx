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

import { Terminal } from "react-bootstrap-icons";
import { Link } from "react-router";

import { CommandCopy } from "~/components/commandCopy/CommandCopy";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { ensureHTTPS } from "../session.utils";
import type { SessionV2 } from "../sessionsV2.types";

interface SessionSshInstructionsProps {
  session: SessionV2;
}

export default function SessionSshInstructions({
  session,
}: SessionSshInstructionsProps) {
  let hostname = "unknown-host";
  try {
    hostname = new URL(ensureHTTPS(session.url)).hostname;
  } catch {
    // Keep the default for an invalid URL.
  }
  const port = 2222;

  const sshCommand = `ssh -p ${port} ${session.name}@${hostname}`;

  return (
    <div className="p-3" data-cy="session-ssh-instructions">
      <h2>
        <Terminal className="me-1" />
        Connect via SSH
      </h2>
      <p>
        This session does not have a web interface. Connect to it from your own
        terminal instead.
      </p>
      <div className="mb-3">
        <CommandCopy command={sshCommand} noMargin />
      </div>
      <p>
        If you need to change your SSH key, you can do so in your{" "}
        <Link to={ABSOLUTE_ROUTES.v2.keys}>SSH keys page</Link>.
      </p>
    </div>
  );
}
