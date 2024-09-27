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
  PauseCircle,
  Trash,
} from "react-bootstrap-icons";
import {
  Link,
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { EnvironmentLogs } from "../../components/Logs";
import { TimeCaption } from "../../components/TimeCaption";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import RenkuFrogIcon from "../../components/icons/RenkuIcon";
import { User } from "../../model/renkuModels.types";
import { NotebooksHelper } from "../../notebooks";
import { NotebookAnnotations } from "../../notebooks/components/session.types";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import useWindowSize from "../../utils/helpers/UseWindowsSize";
import { displaySlice, resetFavicon, setFavicon } from "../display";
import { useGetProjectBySlugQuery } from "../projectsV2/api/projectsV2.api";
import SessionHibernated from "../session/components/SessionHibernated";
import SessionJupyter from "../session/components/SessionJupyter";
import SessionUnavailable from "../session/components/SessionUnavailable";
import { SessionRowResourceRequests } from "../session/components/SessionsList";
import styles from "../session/components/ShowSession.module.scss";
import StartSessionProgressBar from "../session/components/StartSessionProgressBar";
import { useGetSessionsQuery } from "../session/sessions.api";
import { Session } from "../session/sessions.types";

import PauseOrDeleteSessionModal from "./PauseOrDeleteSessionModal";
import { getSessionFavicon } from "./session.utils";
import { useGetProjectSessionLaunchersQuery } from "./sessionsV2.api";

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

  const { data: sessions, isLoading } = useGetSessionsQuery();
  const thisSession = useMemo(() => {
    if (sessions == null) {
      return undefined;
    }
    return Object.values(sessions).find(({ name }) => name === sessionName);
  }, [sessionName, sessions]);

  useEffect(() => {
    const faviconByStatus = getSessionFavicon(
      thisSession?.status?.state,
      isLoading
    );
    dispatch(setFavicon(faviconByStatus));
    return () => {
      // cleanup and set favicon to default
      dispatch(resetFavicon());
    };
  }, [thisSession?.status?.state, isLoading, dispatch]);

  const [isTheSessionReady, setIsTheSessionReady] = useState(false);

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

  const { height } = useWindowSize();
  const iframeHeight = height ? height - 42 : 800;

  useEffect(() => {
    // Wait 4 seconds before setting `isTheSessionReady` for session view
    if (thisSession?.status.state === "running") {
      const timeout = window.setTimeout(() => {
        setIsTheSessionReady(true);
      }, 4_000);
      return () => window.clearTimeout(timeout);
    }
    setIsTheSessionReady(false);
  }, [thisSession?.status.state]);

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
  const logs = thisSession && (
    <EnvironmentLogs
      name={sessionName}
      annotations={thisSession?.annotations}
    />
  );

  const content =
    !isLoading && thisSession == null ? (
      <SessionUnavailable />
    ) : thisSession?.status.state === "hibernated" ? (
      <SessionHibernated session={thisSession} />
    ) : thisSession != null ? (
      <>
        {!isTheSessionReady && (
          <StartSessionProgressBar
            includeStepInTitle={false}
            session={thisSession}
            toggleLogs={toggleModalLogs}
          />
        )}
        <SessionJupyter
          height={`${iframeHeight}px`}
          isSessionReady={isTheSessionReady}
          session={thisSession}
        />
      </>
    ) : (
      <StartSessionProgressBar
        includeStepInTitle={false}
        toggleLogs={toggleModalLogs}
      />
    );

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
        <div className={cx("d-flex", styles.fullscreenHeader)}>
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
        <div className={cx(styles.fullscreenContent, "w-100")}>{content}</div>
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
  const tooltip = "Delete session";

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
  session?: Session;
  namespace?: string;
  slug?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { projectId, launcherId } = useMemo(() => {
    if (session == null) {
      return { projectId: undefined, launcherId: undefined };
    }
    const annotations = NotebooksHelper.cleanAnnotations(
      session.annotations
    ) as NotebookAnnotations;
    return {
      projectId: annotations.projectId,
      launcherId: annotations.launcherId,
    };
  }, [session]);

  const {
    data: launchers,
    isLoading: isLoadingLaunchers,
    error: launchersError,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);
  const { data: project, isLoading: isLoadingProject } =
    useGetProjectBySlugQuery(
      namespace && slug ? { namespace, slug } : skipToken
    );

  const launcher = useMemo(
    () => launchers?.find(({ id }) => id === launcherId),
    [launcherId, launchers]
  );
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
              resourceRequests={session.resources.requests}
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
