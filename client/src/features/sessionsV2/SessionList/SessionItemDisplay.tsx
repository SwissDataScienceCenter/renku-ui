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
import { useMemo, useState } from "react";

import { Project } from "../../projectsV2/api/projectV2.api";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../sessionsV2.api.ts";
import { SessionView } from "../SessionView/SessionView";
import { SessionLauncher } from "../sessionsV2.types";
import SessionItem from "./SessionItem";

interface SessionLauncherDisplayProps {
  launcher: SessionLauncher;
  project: Project;
}
export function SessionItemDisplay({
  launcher,
  project,
}: SessionLauncherDisplayProps) {
  const { name } = launcher;
  const [toggleSessionView, setToggleSessionView] = useState(false);
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
  const filteredSessionsLength = filteredSessions?.length ?? 0;

  const toggleSessionDetails = () => {
    setToggleSessionView((open: boolean) => !open);
  };

  return (
    <>
      {filteredSessionsLength > 0 ? (
        filteredSessions.map((session) => (
          <SessionItem
            key={`session-item-${session.name}`}
            launcher={launcher}
            name={name}
            project={project}
            session={session}
            toggleSessionDetails={toggleSessionDetails}
          />
        ))
      ) : (
        <SessionItem
          key={`session-item-${launcher.id}`}
          launcher={launcher}
          name={name}
          project={project}
          toggleSessionDetails={toggleSessionDetails}
        />
      )}
      <SessionView
        launcher={launcher}
        project={project}
        sessions={filteredSessions}
        setToggleSessionView={toggleSessionDetails}
        toggleSessionView={toggleSessionView}
      />
    </>
  );
}
