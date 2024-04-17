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

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Journals } from "react-bootstrap-icons";
import {
  Link,
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import { Button, UncontrolledTooltip } from "reactstrap";

import SessionPausedIcon from "../../components/icons/SessionPausedIcon";
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

import styles from "../session/components/ShowSession.module.scss";

const logo = "/static/public/img/logo.svg";

export default function ShowSessionPage() {
  const {
    namespace,
    slug,
    session: sessionName_,
  } = useParams<"namespace" | "slug" | "session">();
  const sessionName = sessionName_ ?? "";

  const navigate = useNavigate();

  const backUrl = generatePath("../../:namespace/:slug", {
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
        "fullscreen-back-button",
        "btn",
        "bg-white",
        "text-dark",
        "d-flex",
        "align-items-center",
        "gap-2",
        "no-focus"
      )}
      role="button"
      to={backUrl}
    >
      <ArrowLeft className="text-rk-dark" title="back" /> Back
    </Link>
  );

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
            {backButton}
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
            <div className={cx("px-3", "text-rk-green", "fw-bold")}>
              {sessionName}
            </div>
            <div className="px-3">
              <img alt="Renku" className="d-block" height="22" src={logo} />
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
