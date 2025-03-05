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
import { useState } from "react";
import {
  Button,
  Col,
  Fade,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { Link } from "react-router-dom";

import { ErrorAlert, InfoAlert, WarnAlert } from "../../../components/Alert";
import { Url } from "../../../utils/helpers/url";
import { Loader } from "../../../components/Loader";
import { Docs } from "../../../utils/constants/Docs";
import { ExternalLink } from "../../../components/ExternalLinks";

const docsUrl = Docs.rtdReferencePage(
  "templates.html#create-shareable-project-creation-links-with-pre-filled-fields"
);
const moreInfoLink = (
  <ExternalLink
    role="text"
    iconSup={true}
    iconAfter={true}
    url={docsUrl}
    title="documentation reference"
  />
);
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
  automated: AutomatedData;
  removeAutomated: Function; // eslint-disable-line @typescript-eslint/ban-types
}

interface AutomatedModalProps {
  removeAutomated: Function; // eslint-disable-line @typescript-eslint/ban-types
}

function Automated({ automated, removeAutomated }: AutomatedProps) {
  const [showError, setShowError] = useState(false);
  const toggleError = () => setShowError(!showError);

  const [showWarnings, setShowWarnings] = useState(false);
  const toggleWarn = () => setShowWarnings(!showWarnings);

  if (!automated.finished) {
    // Show a static modal while loading the data
    if (automated.received && automated.valid)
      return <AutomatedModal removeAutomated={removeAutomated} />;
    return null;
  }

  // Show a feedback when the automated part has finished
  // Case 1: errors
  if (automated.error) {
    const error = (
      <div className="py-3">
        <code>{automated.error}</code>
      </div>
    );
    return (
      <ErrorAlert key="alert">
        <div data-cy="project-creation-embedded-error">
          <p>
            You used a RenkuLab project-creation link containing embedded data (
            {moreInfoLink}). There was an error while pre-filling the fields.
            This is usually a sign of a wrong link or outdated information (E.G:
            outdated template links).
          </p>
          <p>
            We used the default settings instead, but that might not lead to the
            expected results.
          </p>

          <Button
            color="danger"
            className="btn-sm"
            onClick={() => toggleError()}
          >
            {showError ? "Hide error details" : "Show error details"}
          </Button>
          <Fade in={showError} tag="div">
            {showError ? error : null}
          </Fade>
        </div>
      </ErrorAlert>
    );
  }
  // Case 2: warnings
  else if (automated.warnings.length) {
    const warnings = (
      <div className="py-3">
        <code>{automated.warnings.join("\n")}</code>
      </div>
    );
    return (
      <WarnAlert>
        <div data-cy="project-creation-embedded-warning">
          <p>
            You used a RenkuLab project-creation link containing embedded data (
            {moreInfoLink}). Some fields could not be pre-filled, likely because
            data is missing or outdated.
          </p>
          <p>
            We used the default settings instead, but that might not lead to the
            expected results.
          </p>
          <Button
            color="warning"
            className="btn-sm"
            onClick={() => toggleWarn()}
          >
            {showWarnings ? "Hide warnings" : "Show warnings"}
          </Button>
          <Fade in={showWarnings} tag="div">
            {showWarnings ? warnings : null}
          </Fade>
        </div>
      </WarnAlert>
    );
  }
  // Case 2: all good, just show a feedback
  return (
    <InfoAlert dismissible={false} timeout={0}>
      <div data-cy="project-creation-embedded-info">
        <p>
          Some fields are pre-filled because you used a RenkuLab
          project-creation link containing embedded data ({moreInfoLink}).
        </p>
        <p className="mb-0">
          You can still change any value before creating a new project.
        </p>
      </div>
    </InfoAlert>
  );
}

function AutomatedModal(props: AutomatedModalProps) {
  const { removeAutomated } = props;

  const [showFadeIn, setShowFadeIn] = useState(false);

  const toggle = () => setShowFadeIn(!showFadeIn);

  const button = showFadeIn ? null : (
    <Button className="btn btn-sm" onClick={() => toggle()}>
      Taking too long?
    </Button>
  );

  const to = Url.get(Url.pages.project.new);
  const fadeInContent = (
    <p className="my-3">
      If pre-filling the new project form is taking too long, you can
      <Link
        className="btn btn-primary btn-sm"
        to={to}
        onClick={() => {
          removeAutomated();
        }}
      >
        Start from scratch
      </Link>
    </p>
  );
  return (
    <Modal isOpen={true} centered={true} keyboard={false} backdrop="static">
      <ModalHeader data-cy="project-creation-embedded-fetching">
        Fetching initialization data
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              You used a RenkuLab project-creation link containing embedded data
              ({moreInfoLink})
            </p>
            <p>
              Please wait while we fetch the required resources...{" "}
              <Loader inline size={16} />
            </p>
            <div className="my-3">
              {button}
              <Fade in={showFadeIn} tag="div">
                {showFadeIn ? fadeInContent : null}
              </Fade>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

export default Automated;
