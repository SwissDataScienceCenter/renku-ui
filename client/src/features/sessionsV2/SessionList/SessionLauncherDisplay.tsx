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

import { skipToken } from "@reduxjs/toolkit/query";
import { useCallback, useMemo, useState } from "react";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import type { SessionType } from "../api/sessionsV2.api";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../api/sessionsV2.api";
import UpdateSessionLauncherMetadataModal from "../components/SessionModals/UpdateSessionLauncherMetadataModal";
import UpdateSessionLauncherEnvironmentModal from "../components/SessionModals/UpdateSessionLauncherModal";
import DeleteSessionV2Modal from "../DeleteSessionLauncherModal";
import {
  buildLauncherHash,
  buildLauncherJobHash,
  isAppLauncher,
  isLauncherHashOpen,
  parseLauncherHash,
  toggleLauncherHash,
} from "../session.utils";
import { SESSION_LAUNCHER_KIND } from "../sessionsV2.types";
import SessionLaunchLinkModal from "../SessionView/SessionLaunchLinkModal";
import { SessionView } from "../SessionView/SessionView";
import SessionLauncherCard from "./SessionLauncherCard";

interface SessionLauncherDisplayProps {
  launcher: SessionLauncher;
  project: Project;
}
export function SessionLauncherDisplay({
  launcher,
  project,
}: SessionLauncherDisplayProps) {
  const { name } = launcher;
  const [isUpdateEnvironmentOpen, setIsUpdateEnvironmentOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false);

  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  const toggleUpdateEnvironment = useCallback(() => {
    setIsUpdateEnvironmentOpen((open) => !open);
  }, []);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);
  const toggleShareLink = useCallback(() => {
    setIsShareLinkOpen((open) => !open);
  }, []);

  const [hash, setHash] = useLocationHash();
  const launcherHash = useMemo(
    () => buildLauncherHash(launcher.id),
    [launcher.id],
  );
  const isSessionViewOpen = useMemo(
    () => isLauncherHashOpen(hash, launcher.id),
    [hash, launcher.id],
  );
  const openJobSubmissionId = useMemo(() => {
    const parsed = parseLauncherHash(hash);
    if (parsed.launcherId !== launcher.id) {
      return undefined;
    }
    return parsed.submissionId;
  }, [hash, launcher.id]);
  const toggleSessionView = useCallback(() => {
    setHash((prev) => toggleLauncherHash(prev, launcher.id));
  }, [launcher.id, setHash]);
  const closeSessionView = useCallback(() => {
    setHash((prev) => (isLauncherHashOpen(prev, launcher.id) ? "" : prev));
  }, [launcher.id, setHash]);
  const openSessionViewWithJob = useCallback(
    (submissionId: string) => {
      setHash(buildLauncherJobHash(launcher.id, submissionId));
    },
    [launcher.id, setHash],
  );

  // Apps do not spawn per-user sessions; their runtime state comes from the
  // dedicated /apps API (fetched inside the app-specific components), so we
  // skip the sessions query entirely for app launchers.
  const isApp = isAppLauncher(launcher);
  const { data: sessions } = useGetSessionsQueryV2(
    isApp
      ? skipToken
      : // Safe cast: non-app launcher types are exactly `SessionType`.
        { sessionType: launcher.launcher_type as SessionType },
  );

  const filteredSessions = useMemo(
    () =>
      sessions != null
        ? sessions.filter(
            (session) =>
              session.launcher_id === launcher.id &&
              session.project_id === project.id,
          )
        : [],
    [launcher.id, project.id, sessions],
  );

  return (
    <>
      <SessionLauncherCard
        key={`session-item-${launcher.id}`}
        launcher={launcher}
        name={name}
        project={project}
        sessions={filteredSessions}
        toggleUpdate={toggleUpdate}
        toggleUpdateEnvironment={toggleUpdateEnvironment}
        toggleDelete={toggleDelete}
        toggleShareLink={
          launcher.launcher_type === SESSION_LAUNCHER_KIND.INTERACTIVE
            ? toggleShareLink
            : undefined
        }
        // Apps render their runtime state inline in the launcher card; the
        // session/job details offcanvas does not apply to them.
        toggleSessionView={isApp ? undefined : toggleSessionView}
        openSessionViewWithJob={openSessionViewWithJob}
      />
      {!isApp && (
        <SessionView
          id={launcherHash}
          launcher={launcher}
          project={project}
          sessions={filteredSessions}
          toggle={closeSessionView}
          isOpen={isSessionViewOpen}
          openJobSubmissionId={openJobSubmissionId}
          toggleUpdate={toggleUpdate}
          toggleDelete={toggleDelete}
          toggleUpdateEnvironment={toggleUpdateEnvironment}
        />
      )}
      {launcher && (
        <>
          <UpdateSessionLauncherEnvironmentModal
            isOpen={isUpdateEnvironmentOpen}
            launcher={launcher}
            toggle={toggleUpdateEnvironment}
          />
          <UpdateSessionLauncherMetadataModal
            isOpen={isUpdateOpen}
            launcher={launcher}
            toggle={toggleUpdate}
          />
          <DeleteSessionV2Modal
            isOpen={isDeleteOpen}
            launcher={launcher}
            toggle={toggleDelete}
            sessionsLength={filteredSessions?.length}
          />
          <SessionLaunchLinkModal
            isOpen={isShareLinkOpen}
            launcher={launcher}
            project={project}
            toggle={toggleShareLink}
          />
        </>
      )}
    </>
  );
}
