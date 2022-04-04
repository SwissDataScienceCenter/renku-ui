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

/**
 *  renku-ui
 *
 *  Automated.tsx
 *  Automated Project component
 */
import * as React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import {
  Alert, Button, Col, Fade, Modal, ModalBody, ModalHeader, Row
} from "reactstrap/lib";

import { ErrorAlert, WarnAlert } from "../../../utils/components/Alert";
import { Url } from "../../../utils/helpers/url";
import { Loader } from "../../../utils/components/Loader";

const Link = require("react-router-dom").Link;

interface Project {
  title?: string;
  description?: string;
  namespace?: string;
  visibility?: string;
  url?: string;
  ref?: string;
  template?: string;
  variables?: string[];
}

interface AutomatedData extends Project {
  finished: boolean;
  received: boolean;
  valid: boolean;
  error: string[];
  warnings: string[];
}

interface AutomatedProps {
  automated: AutomatedData,
  removeAutomated: Function
}

interface AutomatedModalProps {
  removeAutomated: Function
}

function Automated({ automated, removeAutomated }: AutomatedProps) {

  const [showError, setShowError] = useState(false);
  const toggleError = () => setShowError(!showError);

  const [showWarnings, setShowWarnings] = useState(false);
  const toggleWarn = () => setShowWarnings(!showWarnings);

  if (!automated.finished) {
    // Show a static modal while loading the data
    if (automated.received && automated.valid)
      return <AutomatedModal removeAutomated={removeAutomated}/>;
    return null;
  }
  // Show a feedback when the automated part has finished
  // errors
  if (automated.error) {
    const error = (<pre>{automated.error}</pre>);
    return (
      <ErrorAlert key="alert" >
        <p>
          We could not pre-fill the fields with the information provided in the RenkuLab project-creation link.
        </p>
        <p>
          It is possible that the link is outdated or not valid.
          Please contact the source of the RenkuLab link and ask for a new one.
        </p>

        <Button color="link" style={{ fontSize: "smaller" }} className="font-italic" onClick={() => toggleError()}>
          {showError ? "Hide error details" : "Show error details"}
        </Button>
        <Fade in={showError} tag="div">{showError ? error : null}</Fade>
      </ErrorAlert>
    );
  }
  // warnings
  else if (automated.warnings.length) {
    const warnings = (<pre>{automated.warnings.join("\n")}</pre>);
    return (
      <WarnAlert>
        <p>
          Some fields could not be pre-filled with the information provided in the RenkuLab project-creation link.
        </p>
        <Button color="link" style={{ fontSize: "smaller" }} className="font-italic" onClick={() => toggleWarn()}>
          {showWarnings ? "Hide warnings" : "Show warnings"}
        </Button>
        <Fade in={showWarnings} tag="div">{showWarnings ? warnings : null}</Fade>
      </WarnAlert>
    );
  }
  // all good
  return (
    <Alert color="primary">
      <p className="mb-0">
        <FontAwesomeIcon icon={faInfoCircle} />&nbsp;
        Some fields were pre-filled.
        <br />You can still change any values before you create the project.
      </p>
    </Alert>
  );
}


function AutomatedModal(props: AutomatedModalProps) {
  const { removeAutomated } = props;

  const [showFadeIn, setShowFadeIn] = useState(false);

  const toggle = () => setShowFadeIn(!showFadeIn);

  const button = showFadeIn ?
    null :
    (
      <Button color="link" style={{ fontSize: "smaller" }} className="font-italic" onClick={() => toggle()}>
        Taking too long?
      </Button>
    );

  const to = Url.get(Url.pages.project.new);
  const fadeInContent = (
    <p className="mt-3">
      If pre-filling the new project form is taking too long, you can
      <Link className="btn btn-primary btn-sm" to={to} onClick={() => { removeAutomated(); }}>
        use a blank form
      </Link>
    </p>
  );
  return (
    <Modal isOpen={true} centered={true} keyboard={false} backdrop="static">
      <ModalHeader>Fetching initialization data</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>You entered a url containing information to pre-fill.</p>
            <span>
              Please wait while we fetch the required metadata...&nbsp;
              <Loader inline={true} size={16} />
            </span>
            <div className="mt-2">
              {button}
              <Fade in={showFadeIn} tag="div">{showFadeIn ? fadeInContent : null}</Fade>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

export default Automated;
