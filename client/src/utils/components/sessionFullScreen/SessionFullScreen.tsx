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

import React from "react";
import { Url } from "../../helpers/url";
import { SessionStatus } from "../../constants/Notebooks";
import { SessionJupyter } from "../../../notebooks/Notebooks.present";
import { Button } from "../../ts-wrappers";
import { faSave, faDownload, faFileCode, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./logo.svg";
import { useHistory } from "react-router-dom";

/**
 *  renku-ui
 *
 *  SessionFullScreen.tsx
 *  SessionFullScreen component.
 */

interface ShowSessionFullscreenProps {
  filters: any;
  notebook: any;
}
function ShowSessionFullscreen({ filters, notebook }: ShowSessionFullscreenProps) {

  const history = useHistory();
  const urlList = Url.get(Url.pages.project.session, {
    namespace: filters.namespace,
    path: filters.project,
  });

  // redirect immediately if the session fail
  if (history && notebook.data?.status?.state === SessionStatus.failed)
    history.push(urlList);

  // Always add all sub-components and hide them one by one to preserve the iframe navigation where needed
  return (
    <div className="bg-white w-100">
      <div className="d-lg-flex">
        <div className="fullscreen-header d-flex">
          <div className="d-flex gap-2">
            <Button className="border-0 rk-bg-white"><FontAwesomeIcon icon={faArrowLeft} />{" "}Back</Button>
            <Button className="border-0 rk-bg-white"><FontAwesomeIcon icon={faSave} /></Button>
            <Button className="border-0 rk-bg-white"><FontAwesomeIcon icon={faDownload} /></Button>
            <Button className="border-0 rk-bg-white"><FontAwesomeIcon icon={faFileCode} /></Button>
          </div>
          <div className="d-flex justify-content-between">
            <div className="px-3">
              Project Name
            </div>
            <div className="px-3">
              <img src={logo} alt="Renku" height="22" className="d-block" />
            </div>
          </div>
        </div>
        <div className={`full-screen-content border sessions-iframe-border w-100`}>
          <SessionJupyter filters={filters} notebook={notebook} tab={undefined} urlList={urlList} />
        </div>
      </div>
    </div>
  );
}

export default ShowSessionFullscreen;
