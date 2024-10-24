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

import { useCallback, useMemo } from "react";

import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import sessionsApi from "../../session/sessions.api";
import { filterSessionsWithCleanedAnnotations } from "../../session/sessions.utils";
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

  const { data: sessions } = sessionsApi.endpoints.getSessions.useQueryState();
  const filteredSessions = useMemo(
    () =>
      sessions != null
        ? filterSessionsWithCleanedAnnotations<NotebookAnnotations>(
            sessions,
            ({ annotations }) =>
              annotations["renkuVersion"] === "2.0" &&
              annotations["projectId"] === project.id &&
              annotations["launcherId"] === launcher.id
          )
        : {},
    [launcher.id, project.id, sessions]
  );
  const filteredSessionsLength = useMemo(
    () => Object.keys(filteredSessions).length,
    [filteredSessions]
  );

  return (
    <>
      {filteredSessionsLength > 0 ? (
        Object.entries(filteredSessions).map(([key, session]) => (
          <SessionItem
            key={`session-item-${key}`}
            launcher={launcher}
            name={name}
            project={project}
            session={session}
            toggleSessionDetails={toggleSessionView}
          />
        ))
      ) : (
        <SessionItem
          key={`session-item-${launcher.id}`}
          launcher={launcher}
          name={name}
          project={project}
          toggleSessionDetails={toggleSessionView}
        />
      )}
      <SessionView
        id={launcherHash}
        launcher={launcher}
        project={project}
        sessions={filteredSessions}
        toggle={toggleSessionView}
        isOpen={isSessionViewOpen}
      />
    </>
  );
}
