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
 * limitations under the License.
 */

import cx from "classnames";
import { useCallback, useMemo } from "react";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../api/sessionsV2.api";
import { SessionView } from "../SessionView/SessionView";
import SessionItem, { SessionDisplay } from "./SessionItem";
import { Card } from "reactstrap";

import styles from "./SessionItemDisplay.module.scss";
interface SessionLauncherDisplayProps {
  launcher: SessionLauncher;
  project: Project;
}
export function SessionItemDisplay({
  launcher,
  project,
}: SessionLauncherDisplayProps) {
  const { name } = launcher;

  const [hash, setHash] = useLocationHash();
  const launcherHash = useMemo(() => `launcher-${launcher.id}`, [launcher.id]);
  const isSessionViewOpen = useMemo(
    () => hash === launcherHash,
    [hash, launcherHash]
  );
  const toggleSessionView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === launcherHash;
      return isOpen ? "" : launcherHash;
    });
  }, [launcherHash, setHash]);

  const { data: sessions } = useGetSessionsQueryV2();

  const filteredSessions = useMemo(
    () =>
      sessions != null
        ? sessions.filter(
            (session) =>
              session.launcher_id === launcher.id &&
              session.project_id === project.id
          )
        : [],
    [launcher.id, project.id, sessions]
  );

  return (
    <Card
      action
      className={cx(
        styles.SessionLauncherCard,
        "mt-2",
        "cursor-pointer",
        "shadow-none",
        "rounded-0"
      )}
      data-cy="session-launcher-item"
      onClick={toggleSessionView}
    >
      <SessionItem
        key={`session-item-${launcher.id}`}
        launcher={launcher}
        name={name}
        project={project}
        toggleSessionDetails={toggleSessionView}
        hasSession={filteredSessions.length > 0}
      >
        {filteredSessions?.length > 0 &&
          filteredSessions.map((session) => (
            <SessionDisplay
              key={`session-item-${session.name}`}
              launcher={launcher}
              name={name}
              project={project}
              session={session}
              toggleSessionDetails={toggleSessionView}
            />
          ))}
      </SessionItem>
      <SessionView
        id={launcherHash}
        launcher={launcher}
        project={project}
        sessions={filteredSessions}
        toggle={toggleSessionView}
        isOpen={isSessionViewOpen}
      />
    </Card>
  );
}
