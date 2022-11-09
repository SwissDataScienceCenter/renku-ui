/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import { ACCESS_LEVELS } from "../../api-client";


import logo from "./logo.svg";
import { AboutSessionModal } from "./AboutSessionModal";
import { ResourcesSessionModel } from "./ResourcesSessionModal";
import SaveSession from "./SaveSession";
import StopSession from "./StopSession";
import { AboutBtn, GoBackBtn, PullSessionBtn, ResourcesBtn, SaveSessionBtn, StopSessionBtn } from "./SessionButtons";
import { Notebook, SessionHandlers } from "./Session";
import useWindowSize from "../../utils/helpers/UseWindowsSize";
import { Url } from "../../utils/helpers/url";
import { SessionStatus } from "../../utils/constants/Notebooks";
import { SESSION_TABS, SessionJupyter } from "../Notebooks.present";
import StartSessionProgressBar, { SessionStatusData } from "./StartSessionProgressBar";
import { AUTOSAVED_PREFIX } from "../../utils/helpers/HelperFunctions";
import SessionUnavailable from "./SessionUnavailable";
import PullSession from "./PullSession";

/**
 *  renku-ui
 *
 *  SessionFullScreen.tsx
 *  SessionFullScreen component.
 */

interface ShowSessionFullscreenProps {
  accessLevel: number;
  filters: {
    namespace: string;
    project: string;
    defaultBranch: string;
  };
  isLogged: boolean,
  notebook: Notebook;
  urlBack: string;
  projectName: string;
  handlers: SessionHandlers;
}
function ShowSessionFullscreen(props: ShowSessionFullscreenProps) {

  const { filters, notebook, urlBack, projectName, handlers } = props;
  const [sessionStatus, setSessionStatus] = useState<SessionStatusData>();
  const [isTheSessionReady, setIsTheSessionReady] = useState(false);
  const [showModalAboutData, setShowModalAboutData] = useState(false);
  const toggleModalAbout = () => setShowModalAboutData(!showModalAboutData);

  const [showModalResourcesData, setShowModalResourcesData] = useState(false);
  const toggleModalResources = () => setShowModalResourcesData(!showModalResourcesData);
  const [activeResourcesTab, setActiveResourcesTab] = useState<string>(SESSION_TABS.commands);

  const [showModalStopSession, setShowModalStopSession] = useState(false);
  const toggleStopSession = () => setShowModalStopSession(!showModalStopSession);

  const [showModalSaveSession, setShowModalSaveSession] = useState(false);
  const toggleSaveSession = () => setShowModalSaveSession(!showModalSaveSession);

  const [showModalPullSession, setShowModalPullSession] = useState(false);
  const togglePullSession = () => setShowModalPullSession(!showModalPullSession);

  const { height } = useWindowSize();
  const ref = useRef<any>(null);
  const iframeHeight = height ? height - 42 : 800;

  const history = useHistory();
  const location = useLocation();
  const urlList = Url.get(Url.pages.project.session, {
    namespace: filters.namespace,
    path: filters.project,
  });

  const mounted = useRef(false);
  useEffect(() => {
    // this keeps track of the component status
    mounted.current = true;
    return () => { mounted.current = false; };
  });

  useEffect(() => {
    if (notebook.data.status?.state === "running") {
      setTimeout(() => {
        if (mounted.current)
          setIsTheSessionReady(true);
      }, 4000); // wait 4 sec to use isTheSessionReady for session view
    }
    else {
      setIsTheSessionReady(false);
    }
  }, [notebook.data.status?.state]); // eslint-disable-line

  useEffect(() => {
    if (!notebook.data.status)
      return;
    setSessionStatus({ ...notebook.data.status } as SessionStatusData);
  }, [notebook.data.status]); // eslint-disable-line

  // redirect immediately if the session fail
  if (history && notebook.data?.status?.state === SessionStatus.failed)
    history.push(urlList);

  /* modals */
  const projectMetadata = useSelector((state: any) => state.stateModel.project?.metadata);
  const toggleToResourcesLogs = () => {
    setActiveResourcesTab(SESSION_TABS.logs);
    toggleModalResources();
  };
  const toggleResources = () => {
    setActiveResourcesTab(SESSION_TABS.commands);
    toggleModalResources();
  };

  const aboutModal = <AboutSessionModal
    toggleModal={toggleModalAbout}
    isOpen={showModalAboutData}
    projectMetadata={projectMetadata}
    notebook={notebook}
  />;
  const resourcesModal = <ResourcesSessionModel
    handlers={handlers}
    notebook={notebook}
    toggleModal={toggleResources}
    defaultBranch={filters.defaultBranch ?? "master"}
    isOpen={showModalResourcesData}
    activeTab={activeResourcesTab}
    setActiveTab={setActiveResourcesTab}
  />;
  const stopSessionModal = <StopSession
    stopNotebook={handlers.stopNotebook}
    notebook={notebook}
    closeModal={toggleStopSession}
    urlList={urlList}
    isOpen={showModalStopSession}/>;
  const saveSessionModal = <SaveSession
    isLogged={props.isLogged}
    isSessionReady={isTheSessionReady}
    hasSaveAccess={props.accessLevel >= ACCESS_LEVELS.DEVELOPER}
    notebook={notebook}
    closeModal={toggleSaveSession}
    urlList={urlList}
    isOpen={showModalSaveSession}/>;
  const pullSessionModal = <PullSession
    isSessionReady={isTheSessionReady}
    notebook={notebook}
    closeModal={togglePullSession}
    urlList={urlList}
    isOpen={showModalPullSession} />;
  /* end modals */

  let content;
  let sessionView;
  const includeStepInTitle = (location as any)?.state?.redirectFromStartServer;

  if (notebook.fetched && !notebook.available) {
    content = <SessionUnavailable filters={filters} urlList={urlList} />;
  }
  else if (notebook.available) {
    const status = sessionStatus?.state;
    const sessionBranchKey = notebook?.data?.annotations ?
      Object.keys(notebook?.data?.annotations).find( key => key.split("/")[1] === "branch") : null;
    const sessionBranchValue = sessionBranchKey ? notebook?.data?.annotations[sessionBranchKey] : "";
    const isAutoSave = sessionBranchValue.startsWith(AUTOSAVED_PREFIX);
    content = !isTheSessionReady ?
      (<div className="progress-box-small progress-box-small--steps">
        <StartSessionProgressBar includeStepInTitle={includeStepInTitle}
          sessionStatus={sessionStatus} isAutoSave={isAutoSave} toggleLogs={toggleToResourcesLogs} />
      </div>) : null;
    sessionView = status === SessionStatus.running ?
      <SessionJupyter
        ready={isTheSessionReady} filters={filters}
        notebook={notebook} urlList={urlList} height={`${iframeHeight}px`} /> :
      null;
  }
  else {
    content =
      (<div className="progress-box-small progress-box-small--steps">
        <StartSessionProgressBar toggleLogs={toggleToResourcesLogs} includeStepInTitle={includeStepInTitle} />
      </div>);
  }

  return (
    <div className="bg-white w-100">
      <div className="d-lg-flex flex-column">
        <div className="fullscreen-header d-flex gap-3">
          <div className="d-flex gap-3 flex-grow-0 align-items-center">
            <GoBackBtn urlBack={urlBack} />
            <PullSessionBtn togglePullSession={togglePullSession} />
            <SaveSessionBtn toggleSaveSession={toggleSaveSession} />
            <ResourcesBtn toggleModalResources={toggleModalResources} />
            <StopSessionBtn toggleStopSession={toggleStopSession} />
          </div>
          <div className="d-flex align-items-center justify-content-between bg-primary flex-grow-1 py-2">
            <div className="px-3 text-rk-green">
              <AboutBtn projectName={projectName} toggleModalAbout={toggleModalAbout} />
            </div>
            <div className="px-3">
              <img src={logo} alt="Renku" height="22" className="d-block" />
            </div>
          </div>
        </div>
        <div ref={ref} className={`fullscreen-content w-100`}>
          {content}
          {sessionView}
        </div>
      </div>
      {aboutModal}
      {resourcesModal}
      {saveSessionModal}
      {pullSessionModal}
      {stopSessionModal}
    </div>
  );
}

export default ShowSessionFullscreen;
