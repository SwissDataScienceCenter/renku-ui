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

import { skipToken } from "@reduxjs/toolkit/query";

import {
  useGetSessionsBySessionIdLogsQuery,
  useGetSessionsBySessionIdQuery,
} from "../sessionsV2/api/sessionsV2.api";
import LogsModal from "./LogsModal";

const SESSION_LOGS_MAX_LINES = 250;

interface SessionLogsModalProps {
  isOpen: boolean;
  sessionName: string;
  toggle: () => void;
}

export default function SessionLogsModal({
  isOpen,
  sessionName,
  toggle,
}: SessionLogsModalProps) {
  const { data: session } = useGetSessionsBySessionIdQuery(
    sessionName ? { sessionId: sessionName } : skipToken
  );

  const query = useGetSessionsBySessionIdLogsQuery(
    isOpen
      ? {
          sessionId: sessionName,
          maxLines: SESSION_LOGS_MAX_LINES,
        }
      : skipToken
  );

  return (
    <LogsModal
      isOpen={isOpen}
      name={sessionName}
      query={query}
      title={"Logs"}
      toggle={toggle}
      sessionState={session?.status?.state}
      sessionError={
        session?.status?.state === "failed"
          ? session?.status?.message
          : undefined
      }
      defaultTab="amalthea-session"
    />
  );
}
