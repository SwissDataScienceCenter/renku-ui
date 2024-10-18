/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowClockwise,
  Briefcase,
  Journals,
  Save,
} from "react-bootstrap-icons";
import { Redirect, useLocation, useParams } from "react-router";
import { Button, Row, UncontrolledTooltip } from "reactstrap";

import SessionPausedIcon from "../../../components/icons/SessionPausedIcon";
import { User } from "../../../model/renkuModels.types";
import { SESSION_TABS } from "../../../notebooks/Notebooks.present";
import { GoBackBtn } from "../../../notebooks/components/SessionButtons";
import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import useWindowSize from "../../../utils/helpers/UseWindowsSize";
import { Url } from "../../../utils/helpers/url";
import { useGetSessionsQuery } from "../sessions.api";
import AboutSessionModal from "./AboutSessionModal";
import AnonymousSessionsDisabledNotice from "./AnonymousSessionsDisabledNotice";
import PauseOrDeleteSessionModal from "./PauseOrDeleteSessionModal";
import PullSessionModal from "./PullSessionModal";
import ResourcesSessionModal from "./ResourcesSessionModal";
import SaveSessionModal from "./SaveSessionModal";
import SessionHibernated from "./SessionHibernated";
import SessionJupyter from "./SessionJupyter";
import SessionUnavailable from "./SessionUnavailable";
import styles from "./ShowSession.module.scss";
import StartSessionProgressBar from "./StartSessionProgressBar";

const logo = "/static/public/img/logo.svg";

export default function ShowSession() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled =
    params?.ANONYMOUS_SESSIONS ?? DEFAULT_APP_PARAMS.ANONYMOUS_SESSIONS;

  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const { server: sessionName } = useParams<{ server: string }>();

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <Row>
        <AnonymousSessionsDisabledNotice />
      </Row>
    );
  }

  return (
    <Row>
      <ShowSessionFullscreen sessionName={sessionName} />
    </Row>
  );
}

interface ShowSessionFullscreenProps {
  sessionName: string;
}

function ShowSessionFullscreen({ sessionName }: ShowSessionFullscreenProps) {
  const pathWithNamespace = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const path = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.path
  );

  const sessionsListUrl = Url.get(Url.pages.project.session, {
    namespace: "",
    path: pathWithNamespace,
  });

  const location = useLocation<
    { redirectFromStartServer?: boolean; fromLanding?: boolean } | undefined
  >();

  const { data: sessions, isLoading } = useGetSessionsQuery();
  const thisSession = useMemo(() => {
    if (sessions == null) {
      return undefined;
    }
    return Object.values(sessions).find(({ name }) => name === sessionName);
  }, [sessionName, sessions]);

  const [isTheSessionReady, setIsTheSessionReady] = useState(false);

  const [showModalAboutData, setShowModalAboutData] = useState(false);
  const toggleModalAbout = useCallback(
    () => setShowModalAboutData((show) => !show),
    []
  );

  const [showModalResourcesData, setShowModalResourcesData] = useState(false);
  const toggleModalResources = useCallback(
    () => setShowModalResourcesData((show) => !show),
    []
  );
  const [activeResourcesTab, setActiveResourcesTab] = useState<string>(
    SESSION_TABS.commands
  );
  const toggleToResourcesLogs = useCallback(() => {
    setActiveResourcesTab(SESSION_TABS.logs);
    toggleModalResources();
  }, [toggleModalResources]);
  const toggleResources = useCallback(() => {
    setActiveResourcesTab(SESSION_TABS.commands);
    toggleModalResources();
  }, [toggleModalResources]);

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

  const [showModalSaveSession, setShowModalSaveSession] = useState(false);
  const toggleSaveSession = useCallback(
    () => setShowModalSaveSession((show) => !show),
    []
  );

  const [showModalPullSession, setShowModalPullSession] = useState(false);
  const togglePullSession = useCallback(
    () => setShowModalPullSession((show) => !show),
    []
  );

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

  // Modals
  const aboutModal = (
    <AboutSessionModal
      isOpen={showModalAboutData}
      session={thisSession}
      toggleModal={toggleModalAbout}
    />
  );
  const resourcesModal = (
    <ResourcesSessionModal
      activeTab={activeResourcesTab}
      isOpen={showModalResourcesData}
      sessionName={sessionName}
      setActiveTab={setActiveResourcesTab}
      toggleModal={toggleResources}
    />
  );
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
  const saveSessionModal = (
    <SaveSessionModal
      isOpen={showModalSaveSession}
      isSessionReady={isTheSessionReady}
      sessionName={sessionName}
      toggleModal={toggleSaveSession}
    />
  );
  const pullSessionModal = (
    <PullSessionModal
      isOpen={showModalPullSession}
      isSessionReady={isTheSessionReady}
      sessionName={sessionName}
      toggleModal={togglePullSession}
    />
  );

  const includeStepInTitle = location.state?.redirectFromStartServer;
  const isFromLandingPage = location.state?.fromLanding;
  const content =
    !isLoading && thisSession == null ? (
      <SessionUnavailable />
    ) : thisSession?.status.state === "hibernated" ? (
      <SessionHibernated sessionName={thisSession.name} />
    ) : thisSession != null ? (
      <>
        {!isTheSessionReady && (
          <StartSessionProgressBar
            includeStepInTitle={includeStepInTitle}
            session={thisSession}
            toggleLogs={toggleToResourcesLogs}
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
        includeStepInTitle={includeStepInTitle}
        toggleLogs={toggleToResourcesLogs}
      />
    );

  // Redirect to the sessions list if the session has failed
  if (thisSession?.status.state === "failed") {
    return <Redirect to={sessionsListUrl} />;
  }

  return (
    <div className={cx("bg-white", "p-0")}>
      <div className={cx("d-lg-flex", "flex-column")}>
        <div className={cx(styles.fullscreenHeader, "d-flex", "gap-3")}>
          <div
            className={cx(
              "d-flex",
              "gap-3",
              "flex-grow-0",
              "align-items-center"
            )}
          >
            <GoBackBtn urlBack={isFromLandingPage ? "/" : sessionsListUrl} />
            <PullSessionBtn togglePullSession={togglePullSession} />
            <SaveSessionBtn toggleSaveSession={toggleSaveSession} />
            <ResourcesBtn toggleModalResources={toggleModalResources} />
            <PauseSessionBtn openPauseSession={openPauseSession} />
            <DeleteSessionBtn openDeleteSession={openDeleteSession} />
          </div>
          <div
            className={cx(
              "d-flex",
              "align-items-center",
              "justify-content-between",
              "bg-primary",
              "flex-grow-1",
              "py-2"
            )}
          >
            <div className={cx("px-3", "text-rk-green")}>
              <AboutBtn
                projectName={path}
                toggleModalAbout={toggleModalAbout}
              />
            </div>
            <div className="px-3">
              <img alt="Renku" className="d-block" height="22" src={logo} />
            </div>
          </div>
        </div>
        <div className={cx(styles.fullscreenContent, "w-100")}>{content}</div>
      </div>
      {/* modals */}
      {aboutModal}
      {resourcesModal}
      {saveSessionModal}
      {pullSessionModal}
      {pauseOrDeleteSessionModal}
    </div>
  );
}

interface PullSessionBtnProps {
  togglePullSession: () => void;
}

function PullSessionBtn({ togglePullSession }: PullSessionBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Button
        className={cx(
          "border-0",
          "bg-transparent",
          "text-dark",
          "p-0",
          "no-focus"
        )}
        data-cy="pull-changes-button"
        id="pull-changes-button"
        innerRef={ref}
        onClick={togglePullSession}
      >
        <ArrowClockwise className="text-rk-dark" />
        <span className="visually-hidden">Pull changes</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        Pull changes
      </UncontrolledTooltip>
    </div>
  );
}

interface SaveSessionProps {
  toggleSaveSession: () => void;
}
function SaveSessionBtn({ toggleSaveSession }: SaveSessionProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Button
        data-cy="save-session-button"
        className={cx(
          "border-0",
          "bg-transparent",
          "text-dark",
          "p-0",
          "no-focus"
        )}
        id="save-session-button"
        innerRef={ref}
        onClick={toggleSaveSession}
      >
        <Save className="text-rk-dark" />
        <span className="visually-hidden">Save session</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        Save session
      </UncontrolledTooltip>
    </div>
  );
}

interface ResourcesProps {
  toggleModalResources: () => void;
}
function ResourcesBtn({ toggleModalResources }: ResourcesProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Button
        className={cx(
          "border-0",
          "bg-transparent",
          "text-dark",
          "p-0",
          "no-focus"
        )}
        data-cy="resources-button"
        id="resources-button"
        innerRef={ref}
        onClick={toggleModalResources}
      >
        <Journals className="text-rk-dark" />
        <span className="visually-hidden">Resources</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        Resources
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
          "border-0",
          "bg-transparent",
          "text-dark",
          "p-0",
          "no-focus"
        )}
        data-cy={buttonId}
        id={buttonId}
        innerRef={ref}
        onClick={openPauseSession}
      >
        <SessionPausedIcon className="text-rk-dark" size={16} />
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
          "border-0",
          "bg-transparent",
          "text-dark",
          "p-0",
          "no-focus"
        )}
        data-cy={buttonId}
        id={buttonId}
        innerRef={ref}
        onClick={openDeleteSession}
      >
        <FontAwesomeIcon className="text-rk-dark" icon={faTrash} />
        <span className="visually-hidden">{tooltip}</span>
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        {tooltip}
      </UncontrolledTooltip>
    </div>
  );
}

interface AboutBtnProps {
  projectName: string;
  toggleModalAbout: () => void;
}
function AboutBtn({ toggleModalAbout, projectName }: AboutBtnProps) {
  return (
    <Button
      className={cx(
        "border-0",
        "bg-transparent",
        "no-focus",
        "text-rk-green",
        "p-0",
        "fw-bold"
      )}
      data-cy="about-button"
      onClick={toggleModalAbout}
    >
      <Briefcase /> {projectName}
    </Button>
  );
}
