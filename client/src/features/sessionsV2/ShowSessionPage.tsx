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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Journals, PauseCircle, Trash } from "react-bootstrap-icons";
import {
  generatePath,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import { Button, UncontrolledTooltip } from "reactstrap";

import { User } from "../../model/renkuModels.types";
import { SESSION_TABS } from "../../notebooks/Notebooks.present";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import useWindowSize from "../../utils/helpers/UseWindowsSize";
import ResourcesSessionModal from "../session/components/ResourcesSessionModal";
import SessionHibernated from "../session/components/SessionHibernated";
import SessionJupyter from "../session/components/SessionJupyter";
import SessionUnavailable from "../session/components/SessionUnavailable";
import StartSessionProgressBar from "../session/components/StartSessionProgressBar";
import { useGetSessionsQuery } from "../session/sessions.api";
import PauseOrDeleteSessionModal from "./PauseOrDeleteSessionModal";

import RenkuFrogIcon from "../../components/icons/RenkuIcon.tsx";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import styles from "../session/components/ShowSession.module.scss";
import {
  calculateFaviconStatus,
  SessionFavicon,
} from "./components/SessionFavicon/SessionFavicon.tsx";

export default function ShowSessionPage() {
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

  const [isTheSessionReady, setIsTheSessionReady] = useState(false);

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

  const faviconState = calculateFaviconStatus(thisSession, isLoading);

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
        includeStepInTitle={false}
        toggleLogs={toggleToResourcesLogs}
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
              "px-3"
            )}
          >
            {backButton}
            <ResourcesBtn toggleModalResources={toggleModalResources} />
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
              "py-2"
            )}
          >
            <div className={cx("px-3", "text-white")}>{sessionName}</div>
            <div className={cx("px-3", "text-white")}>
              <RenkuFrogIcon size={24} />
            </div>
          </div>
        </div>
        <div className={cx(styles.fullscreenContent, "w-100")}>{content}</div>
      </div>
      {/* modals */}
      {resourcesModal}
      {pauseOrDeleteSessionModal}
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
        onClick={toggleModalResources}
      >
        <Journals className="bi" />
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
