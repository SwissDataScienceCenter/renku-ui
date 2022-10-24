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

import { Link } from "react-router-dom";
import { ArrowClockwise, ArrowLeft, Briefcase, Button, Journals, Save, StopCircle } from "../../utils/ts-wrappers";
import React from "react";
import { ThrottledTooltip } from "../../utils/components/Tooltip";

/**
 *  renku-ui
 *
 *  SessionButtons.tsx
 *  SessionButtons components.
 */

interface GoBackProps {
  urlBack: string;
}
function GoBackBtn({ urlBack }: GoBackProps) {
  return (
    <Link className="fullscreen-back-button btn bg-white text-dark d-flex align-items-center gap-2 no-focus"
      role="button" to={urlBack}>
      <ArrowLeft className="text-rk-dark" title="back" />{" "}Back
    </Link>
  );
}

interface StopSessionProps {
  toggleStopSession: Function;
}
function StopSessionBtn({ toggleStopSession }: StopSessionProps) {
  return (
    <div>
      <Button id="stop-session-button" data-cy="stop-session-button"
        className="border-0 bg-transparent text-dark p-0 no-focus" onClick={() => toggleStopSession()}>
        <StopCircle className="text-rk-dark" title="stop"/></Button>
      <ThrottledTooltip
        target="stop-session-button"
        tooltip="Stop session" />
    </div>
  );
}


interface SaveSessionProps {
  toggleSaveSession: Function;
}
function SaveSessionBtn({ toggleSaveSession }: SaveSessionProps) {
  return (
    <div>
      <Button id="save-session-button" data-cy="save-session-button"
        className="border-0 bg-transparent text-dark p-0 no-focus" onClick={() => toggleSaveSession()}>
        <Save className="text-rk-dark" title="save"/>
      </Button>
      <ThrottledTooltip
        target="save-session-button"
        tooltip="Save session" />
    </div>
  );
}

interface PullSessionProps {
  togglePullSession: Function;
}
function PullSessionBtn({ togglePullSession }: PullSessionProps) {
  return (
    <div>
      <Button id="pull-session-button" data-cy="pull-session-button"
        className="border-0 bg-transparent text-dark p-0 no-focus" onClick={() => togglePullSession()}>
        <ArrowClockwise className="text-rk-dark" title="Pull"/>
      </Button>
      <ThrottledTooltip
        target="pull-session-button"
        tooltip="Refresh session" />
    </div>
  );
}

interface ResourcesProps {
  toggleModalResources: Function;
}
function ResourcesBtn({ toggleModalResources }: ResourcesProps) {
  return (
    <div>
      <Button id="resources-button" data-cy="resources-button"
        className="border-0 bg-transparent text-dark p-0 no-focus" onClick={() => toggleModalResources()}>
        <Journals className="text-rk-dark" title="help"/></Button>
      <ThrottledTooltip
        target="resources-button"
        tooltip="Resources" />
    </div>
  );
}

interface AboutProps {
  toggleModalAbout: Function;
  projectName: string;
}
function AboutBtn({ toggleModalAbout, projectName }: AboutProps) {
  return (
    <Button className="border-0 bg-transparent no-focus text-rk-green p-0"
      data-cy="about-button"
      onClick={() => toggleModalAbout()}>
      <Briefcase /> {projectName}</Button>
  );
}

export { AboutBtn, GoBackBtn, PullSessionBtn, ResourcesBtn, SaveSessionBtn, StopSessionBtn };
