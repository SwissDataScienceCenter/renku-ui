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
import { useCallback, useMemo } from "react";
import { CaretRightFill } from "react-bootstrap-icons";
import { ListGroupItem } from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { SessionStatusV2Label } from "../components/SessionStatus/SessionStatus";
import type { SessionLauncher, SessionV2 } from "../sessionsV2.types";
import SessionViewV2 from "../SessionView/SessionViewV2";

interface SessionItemV2Props {
  launcher: SessionLauncher;
  session: SessionV2;
}

export default function SessionItemV2({
  launcher,
  session,
}: SessionItemV2Props) {
  const [hash, setHash] = useLocationHash();
  const sessionHash = useMemo(
    () => `session-v2-${session.name}`,
    [session.name]
  );
  const isSessionViewOpen = useMemo(
    () => hash === sessionHash,
    [hash, sessionHash]
  );
  const toggleSessionView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === sessionHash;
      return isOpen ? "" : sessionHash;
    });
  }, [sessionHash, setHash]);

  return (
    <>
      <ListGroupItem
        action
        className={cx(
          "cursor-pointer",
          "d-flex",
          "flex-row",
          "align-items-center"
        )}
        data-cy="session-v2-item"
        tag="button"
        onClick={toggleSessionView}
      >
        <CaretRightFill className={cx("bi", "me-1")} />
        <SessionStatusV2Label session={session} />
      </ListGroupItem>
      <SessionViewV2
        isOpen={isSessionViewOpen}
        toggle={toggleSessionView}
        launcher={launcher}
        session={session}
      />
    </>
  );
}
