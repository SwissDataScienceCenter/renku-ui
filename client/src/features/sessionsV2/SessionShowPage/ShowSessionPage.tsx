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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Box,
  Briefcase,
  Clock,
  Cloud,
  ExclamationTriangle,
  FileEarmarkText,
  Link45deg,
  PauseCircle,
  Trash,
} from "react-bootstrap-icons";
import { Link, generatePath, useNavigate, useParams } from "react-router";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../../components/Loader";
import EnvironmentLogsV2 from "../../../components/LogsV2";
import { TimeCaption } from "../../../components/TimeCaption";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import RenkuFrogIcon from "../../../components/icons/RenkuIcon";
import { User } from "../../../model/renkuModels.types";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import useWindowSize from "../../../utils/helpers/UseWindowsSize";
import { displaySlice, resetFavicon, setFavicon } from "../../display";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { SessionRowResourceRequests } from "../../session/components/SessionsList";
import { StartSessionProgressBarV2 } from "../../session/components/StartSessionProgressBar";
import type { Project } from "../../projectsV2/api/projectV2.api";
import PauseOrDeleteSessionModal from "../PauseOrDeleteSessionModal";
import {
  useGetProjectsByProjectIdSessionLaunchersQuery as useGetProjectSessionLaunchersQuery,
  type SessionLauncher,
} from "../api/sessionLaunchersV2.api";

import usePollingGetSessionQuery from "../usePollingGetSessionQuery.hook";
import { getSessionFavicon } from "../session.utils";
import { SessionV2 } from "../sessionsV2.types";
import SessionLaunchLinkModal from "../SessionView/SessionLaunchLinkModal";
import SessionIframe from "./SessionIframe";
import SessionPaused from "./SessionPaused";
import SessionUnavailable from "./SessionUnavailable";

import styles from "../../session/components/ShowSession.module.scss";

interface SessionContentProps {
  isFetching: boolean;
  isLoading: boolean;
  thisSession?: SessionV2;
  toggleModalLogs: () => void;
}
function SessionContent({
  isFetching,
  isLoading,
  thisSession,
  toggleModalLogs,
}: SessionContentProps) {
  const { height } = useWindowSize();
  const iframeHeight = height ? height - 42 : 800;

  if (!isLoading && !isFetching && !thisSession) return <SessionUnavailable />;
  if (thisSession == null)
    return <StartSessionProgressBarV2 toggleLogs={toggleModalLogs} />;
  if (thisSession.status.state === "hibernated")
    return <SessionPaused session={thisSession} />;
  return (
    <>
      {thisSession.status.state !== "running" && (
        <StartSessionProgressBarV2
          session={thisSession}
          toggleLogs={toggleModalLogs}
        />
      )}
      <SessionIframe height={`${iframeHeight}px`} session={thisSession} />
    </>
  );
}

export default function ShowSessionPage() {
  const dispatch = useAppDispatch();
  const {
    namespace,
    slug,
    session: sessionName_,
  } = useParams<"namespace" | "slug" | "session">();
  const sessionName = sessionName_ ?? "";

  const navigate = useNavigate();

  const backUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

  const {
    isFetching,
    isLoading,
    session: thisSession,
  } = usePollingGetSessionQuery({ sessionName });

  useEffect(() => {
    const faviconByStatus = getSessionFavicon(
      thisSession?.status?.state,
      isLoading || isFetching
    );
    dispatch(setFavicon(faviconByStatus));
    return () => {
      // cleanup and set favicon to default
      dispatch(resetFavicon());
    };
  }, [thisSession?.status?.state, isLoading, isFetching, dispatch]);

  const toggleModalLogs = useCallback(() => {
    dispatch(
      displaySlice.actions.toggleSessionLogsModal({ targetServer: sessionName })
    );
  }, [dispatch, sessionName]);

  const [showModalPauseOrDeleteSession, setShowModalPauseOrDeleteSession] =
    useState(false);
  const togglePauseOrDeleteSession = useCallback(
    () => setShowModalPauseOrDeleteSession((show) => !show),
    []
  );
  const [pauseOrDeleteAction, setPauseOrDeleteAction] = useState<
    "pause" | "delete"
  >("pause");
  const openPauseSession = useCallback(() => {
    setShowModalPauseOrDeleteSession(true);
    setPauseOrDeleteAction("pause");
  }, []);
  const openDeleteSession = useCallback(() => {
    setShowModalPauseOrDeleteSession(true);
    setPauseOrDeleteAction("delete");
  }, []);
  const togglePauseOrDeleteAction = useCallback(() => {
    setPauseOrDeleteAction((prevAction) =>
      prevAction === "delete" ? "pause" : "delete"
    );
  }, []);

  // Redirect to the sessions list if the session has failed
  useEffect(() => {
    if (thisSession?.status.state === "failed") {
      navigate(backUrl);
    }
  }, [backUrl, navigate, thisSession?.status.state]);

  // Modals
  const pauseOrDeleteSessionModal = (
    <PauseOrDeleteSessionModal
      action={pauseOrDeleteAction}
      isOpen={showModalPauseOrDeleteSession}
      session={thisSession}
      sessionName={sessionName}
      toggleAction={togglePauseOrDeleteAction}
      toggleModal={togglePauseOrDeleteSession}
    />
  );
  const logs = thisSession && <EnvironmentLogsV2 name={sessionName} />;

  const backButton = (
    <Link
      className={cx(
        "align-items-center",
        "btn",
        "d-flex",
        "no-focus",
        "shadow-none",
        "p-0"
      )}
      role="button"
      to={backUrl}
    >
      <ArrowLeft className="me-1" title="back" />
      Back
    </Link>
  );

  return (
    <div className={cx("bg-white", "p-0")}>
      <div className={cx("d-lg-flex", "flex-column")}>
        <div
          className={cx("d-flex", styles.fullscreenHeader)}
          data-cy="session-header"
        >
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-grow-0",
              "gap-3",
              "px-3",
              "text-truncate"
            )}
          >
            {backButton}
            <LogsBtn toggle={toggleModalLogs} />
            <PauseSessionBtn openPauseSession={openPauseSession} />
            <DeleteSessionBtn openDeleteSession={openDeleteSession} />
            <ShareSessionLinkButton
              session={thisSession}
              namespace={namespace}
              slug={slug}
            />
          </div>
          <div
            className={cx(
              "align-items-center",
              "bg-primary",
              "d-flex",
              "flex-grow-1",
              "justify-content-between",
              "text-truncate"
            )}
          >
            <div className={cx("d-flex", "px-3", "text-truncate", "h-100")}>
              <SessionDetails
                session={thisSession}
                namespace={namespace}
                slug={slug}
              />
            </div>
            <div className={cx("pe-3", "text-white")}>
              <RenkuFrogIcon size={24} />
            </div>
          </div>
        </div>
        <div
          className={cx(styles.fullscreenContent, "w-100")}
          data-cy="session-page"
        >
          <SessionContent
            isFetching={isFetching}
            isLoading={isLoading}
            thisSession={thisSession}
            toggleModalLogs={toggleModalLogs}
          />
        </div>
      </div>
      {/* modals */}
      {logs}
      {pauseOrDeleteSessionModal}
    </div>
  );
}

interface LogsBtnProps {
  toggle: () => void;
}
function LogsBtn({ toggle }: LogsBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Button
        className={cx(
          "bg-transparent",
          "border-0",
          "no-focus",
          "p-0",
          "shadow-none",
          "text-dark"
        )}
        data-cy="resources-button"
        id="resources-button"
        innerRef={ref}
        onClick={toggle}
      >
        <FileEarmarkText className="bi" />
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        Get logs
      </UncontrolledTooltip>
    </div>
  );
}

interface PauseSessionBtnProps {
  openPauseSession: () => void;
}
function PauseSessionBtn({ openPauseSession }: PauseSessionBtnProps) {
  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const ref = useRef<HTMLButtonElement>(null);

  if (!logged) {
    return null;
  }
  const buttonId = "pause-session-button";
  const tooltip = "Pause session";

  return (
    <div>
      <Button
        className={cx(
          "bg-transparent",
          "border-0",
          "no-focus",
          "p-0",
          "shadow-none",
          "text-dark"
        )}
        data-cy={buttonId}
        id={buttonId}
        innerRef={ref}
        onClick={openPauseSession}
      >
        <PauseCircle className="bi" />
        <span className="visually-hidden">{tooltip}</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        {tooltip}
      </UncontrolledTooltip>
    </div>
  );
}

interface DeleteSessionBtnProps {
  openDeleteSession: () => void;
}
function DeleteSessionBtn({ openDeleteSession }: DeleteSessionBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const buttonId = "delete-session-button";
  const tooltip = "Shut down session";

  return (
    <div>
      <Button
        className={cx(
          "bg-transparent",
          "border-0",
          "no-focus",
          "p-0",
          "shadow-none",
          "text-dark"
        )}
        data-cy={buttonId}
        id={buttonId}
        innerRef={ref}
        onClick={openDeleteSession}
      >
        <Trash className="bi" />
        <span className="visually-hidden">{tooltip}</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        {tooltip}
      </UncontrolledTooltip>
    </div>
  );
}

function SessionDetails({
  session,
  namespace,
  slug,
}: {
  session?: SessionV2;
  namespace?: string;
  slug?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isLoadingLaunchers,
    isLoadingProject,
    launcher,
    launchersError,
    project,
  } = useSessionProjectAndLauncher({
    namespace,
    session,
    slug,
  });
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const projectUrl =
    project &&
    generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project?.namespace,
      slug: project?.slug,
    });

  if (isLoadingLaunchers || isLoadingProject) {
    return (
      <div className={cx("d-flex", "align-items-center")}>
        <p className={cx("text-white", "mb-0")}>
          <Loader inline size={16} /> Checking session details...
        </p>
      </div>
    );
  }
  if (launchersError || !launcher || !project)
    return (
      <div className={cx("d-flex", "align-items-center")}>
        <p className={cx("text-white", "mb-0")}>
          <ExclamationTriangle className="bi" /> Session details unavailable
        </p>
      </div>
    );
  const detailsModal = project && session && projectUrl && (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>Session details {launcher.name}</ModalHeader>
      <ModalBody>
        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <div>
            <p className="mb-0">
              <Briefcase className={cx("bi", "me-2")} />
              Project:{" "}
              <Link to={projectUrl}>
                <span className="fw-bold">{project.name}</span>
              </Link>
            </p>
          </div>
          {session.started && (
            <div>
              <p className="mb-0">
                <Clock className={cx("bi", "me-2")} />
                <span className="fw-bold">
                  <TimeCaption
                    prefix="Launched"
                    datetime={session.started}
                    className={cx("fs-6")}
                  />
                </span>
              </p>
            </div>
          )}
          <div
            className={cx(
              "d-block",
              "d-lg-flex",
              "gap-2",
              "align-items-center"
            )}
          >
            <div>
              <Cloud className={cx("bi", "me-2")} />
              Session resources requested:
            </div>
            <SessionRowResourceRequests
              resourceRequests={session?.resources?.requests}
            />
          </div>
          <div
            className={cx(
              "d-block",
              "d-lg-flex",
              "gap-2",
              "align-items-center"
            )}
          >
            <div>
              <Box className={cx("bi", "me-2")} />
              Container image:{" "}
            </div>
            <CommandCopy noMargin command={session.image} />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
  return (
    <>
      <Button
        className={cx(
          "bg-transparent",
          "border-0",
          "no-focus",
          "p-0",
          "shadow-none",
          "text-white",
          "w-100",
          "text-truncate"
        )}
        role="link"
        onClick={toggle}
      >
        {project?.name} / {launcher.name}
      </Button>
      {detailsModal}
    </>
  );
}

function ShareSessionLinkButton({
  session,
  namespace,
  slug,
}: {
  session?: SessionV2;
  namespace?: string;
  slug?: string;
}) {
  const { launcher, project } = useSessionProjectAndLauncher({
    namespace,
    session,
    slug,
  });
  const ref = useRef<HTMLButtonElement>(null);
  const buttonId = "share-session-button";
  const tooltip = "Share session launch link";

  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false);
  const toggleShareLink = useCallback(() => {
    setIsShareLinkOpen((open) => !open);
  }, []);

  if (launcher == null || project == null) return null;

  return (
    <div>
      <Button
        className={cx(
          "bg-transparent",
          "border-0",
          "no-focus",
          "p-0",
          "shadow-none",
          "text-dark"
        )}
        data-cy={buttonId}
        id={buttonId}
        innerRef={ref}
        onClick={toggleShareLink}
      >
        <Link45deg className="bi" />
        <span className="visually-hidden">{tooltip}</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        {tooltip}
      </UncontrolledTooltip>
      <SessionLaunchLinkModal
        isOpen={isShareLinkOpen}
        launcher={launcher}
        project={project}
        toggle={toggleShareLink}
      />
    </div>
  );
}

function useSessionProjectAndLauncher({
  namespace,
  session,
  slug,
}: {
  namespace: string | undefined;
  session: SessionV2 | undefined;
  slug: string | undefined;
}): {
  isLoadingLaunchers: boolean;
  isLoadingProject: boolean;
  launcher: SessionLauncher | undefined;
  launchersError: unknown;
  project: Project | undefined;
} {
  const { projectId, launcherId } = useMemo(() => {
    if (session == null) {
      return { projectId: undefined, launcherId: undefined };
    }
    return {
      projectId: session.project_id,
      launcherId: session.launcher_id,
    };
  }, [session]);

  const {
    data: launchers,
    isLoading: isLoadingLaunchers,
    error: launchersError,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);
  const { data: project, isLoading: isLoadingProject } =
    useGetNamespacesByNamespaceProjectsAndSlugQuery(
      namespace && slug ? { namespace, slug } : skipToken
    );

  const launcher = useMemo(
    () => launchers?.find(({ id }) => id === launcherId),
    [launcherId, launchers]
  );
  return {
    isLoadingLaunchers,
    isLoadingProject,
    launcher,
    launchersError,
    project,
  };
}
