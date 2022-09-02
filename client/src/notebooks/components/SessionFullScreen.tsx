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

import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import logo from "./logo.svg";
import { AboutSessionModal } from "./AboutSessionModal";
import { ResourcesSessionModel } from "./ResourcesSessionModal";
import StopSession from "./StopSession";
import { AboutBtn, GoBackBtn, ResourcesBtn, StopSessionBtn } from "./SessionButtons";
import { Notebook, SessionHandlers } from "./Session";
import useWindowSize from "../../utils/helpers/UseWindowsSize";
import { Url } from "../../utils/helpers/url";
import { SessionStatus } from "../../utils/constants/Notebooks";
import { SessionJupyter } from "../Notebooks.present";

/**
 *  renku-ui
 *
 *  SessionFullScreen.tsx
 *  SessionFullScreen component.
 */

interface ShowSessionFullscreenProps {
  filters: {
    namespace: string;
    project: string;
    defaultBranch: string;
  };
  notebook: Notebook;
  urlBack: string;
  projectName: string;
  handlers: SessionHandlers;
}
function ShowSessionFullscreen({ filters, notebook, urlBack, projectName, handlers }: ShowSessionFullscreenProps) {

  const [showModalAboutData, setShowModalAboutData] = useState(false);
  const toggleModalAbout = () => setShowModalAboutData(!showModalAboutData);

  const [showModalResourcesData, setShowModalResourcesData] = useState(false);
  const toggleModalResources = () => setShowModalResourcesData(!showModalResourcesData);

  const [showModalStopSession, setShowModalStopSession] = useState(false);
  const toggleStopSession = () => setShowModalStopSession(!showModalStopSession);

  const { height } = useWindowSize();
  const ref = useRef<any>(null);
  const iframeHeight = height ? height - 42 : 800;

  const history = useHistory();
  const urlList = Url.get(Url.pages.project.session, {
    namespace: filters.namespace,
    path: filters.project,
  });

  // redirect immediately if the session fail
  if (history && notebook.data?.status?.state === SessionStatus.failed)
    history.push(urlList);

  /* Buttons */
  const goBackBtn = <GoBackBtn urlBack={urlBack} />;
  const stopSessionBtn = <StopSessionBtn toggleStopSession={toggleStopSession} />;
  const resourcesBtn = <ResourcesBtn toggleModalResources={toggleModalResources} />;
  const aboutBtn = <AboutBtn projectName={projectName} toggleModalAbout={toggleModalAbout} /> ;
  /* end Buttons */

  /* modals */
  const projectMetadata = useSelector((state: any) => state.stateModel.project?.metadata);

  const aboutModal = <AboutSessionModal
    toggleModal={toggleModalAbout}
    isOpen={showModalAboutData}
    projectMetadata={projectMetadata}
    notebook={notebook}
  />;
  const resourcesModal = <ResourcesSessionModel
    handlers={handlers}
    notebook={notebook}
    toggleModal={toggleModalResources}
    defaultBranch={filters.defaultBranch ?? "master"}
    isOpen={showModalResourcesData}/>;
  const stopSessionModal = <StopSession
    stopNotebook={handlers.stopNotebook}
    notebook={notebook}
    closeModal={toggleStopSession}
    urlList={urlList}
    isOpen={showModalStopSession}/>;
  /* end Buttons */

  return (
    <div className="bg-white w-100">
      <div className="d-lg-flex flex-column">
        <div className="fullscreen-header d-flex gap-3">
          <div className="d-flex gap-3 flex-grow-0 align-items-center">
            {goBackBtn}
            {resourcesBtn}
            {stopSessionBtn}
          </div>
          <div className="d-flex align-items-center justify-content-between bg-primary flex-grow-1 py-2">
            <div className="px-3 text-rk-green">
              {aboutBtn}
            </div>
            <div className="px-3">
              <img src={logo} alt="Renku" height="22" className="d-block" />
            </div>
          </div>
        </div>
        <div ref={ref} className={`fullscreen-content w-100`}>
          <SessionJupyter filters={filters} notebook={notebook} urlList={urlList} height={`${iframeHeight}px`} />
        </div>
      </div>
      {aboutModal}
      {resourcesModal}
      {stopSessionModal}
    </div>
  );
}

export default ShowSessionFullscreen;
