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

import cx from "classnames";
import { Offcanvas, OffcanvasBody } from "reactstrap";

import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import { SessionRowResourceRequests } from "../../session/components/SessionsList";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "../components/SessionStatus/SessionStatus";
import { getShowSessionUrlByProject } from "../SessionsV2";
import type { SessionLauncher, SessionV2 } from "../sessionsV2.types";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";

interface SessionViewV2Props {
  isOpen: boolean;
  toggle: () => void;

  launcher: SessionLauncher;
  session: SessionV2;
}

export default function SessionViewV2({
  isOpen,
  toggle,
  launcher,
  session,
}: SessionViewV2Props) {
  const { project } = useProject();

  return (
    <Offcanvas isOpen={isOpen} toggle={toggle} direction="end" backdrop>
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="get-back-session-view"
            data-bs-dismiss="offcanvas"
            onClick={toggle}
          />
        </div>

        <div className={cx("d-flex", "flex-column", "gap-4")}>
          <div>
            <div>
              <div className={cx("float-end", "mt-1", "ms-1")}>
                <ActiveSessionButton
                  session={session}
                  showSessionUrl={getShowSessionUrlByProject(
                    project,
                    session.name
                  )}
                />
              </div>
              <h2
                className={cx("m-0", "text-break")}
                data-cy="session-view-title"
              >
                {launcher.name}
              </h2>
            </div>

            <SessionStatusV2Label session={session} />
          </div>

          <SessionStatusV2Description session={session} />

          <div>
            <h4 className={cx("mb-0", "me-2")}>Session resources</h4>
            <SessionRowResourceRequests
              resourceRequests={session.resources.requests}
            />
          </div>

          <div>
            <h4 className={cx("mb-0", "me-2")}>Container image</h4>
            <CommandCopy command={session.image} />
          </div>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
