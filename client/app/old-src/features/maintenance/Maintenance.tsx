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

import { faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Row } from "reactstrap";
import { BrowserRouter } from "react-router";

import { FooterNavbar } from "../../landing/NavBar";
import { StatuspageDisplay, isStatusConfigured } from "../../statuspage";

interface MaintenanceProps {
  info: string;
}
function Maintenance({ info }: MaintenanceProps) {
  const headerText = "Maintenance ongoing";
  const body =
    info && info !== "true" && info !== "1"
      ? info
      : "Renku is undergoing maintenance. It should be available again soon. Please check back in a little while.";
  return (
    <BrowserRouter>
      <div className="min-vh-100 d-flex flex-column">
        <div className="flex-grow-1">
          <main role="main" className="container-fluid">
            <section className="jumbotron-header rounded px-3 px-sm-4 py-3 py-sm-5 text-center mb-3">
              <h1 className="text-center text-primary">
                <FontAwesomeIcon className="me-3" icon={faWrench} />
                {headerText}
                <FontAwesomeIcon className="ms-3" icon={faWrench} />
              </h1>
              <p className="text-center mt-4">{body}</p>
            </section>
          </main>
        </div>
        <FooterNavbar />
      </div>
    </BrowserRouter>
  );
}

interface UnavailableProps {
  model: unknown;
  statuspageId: string;
}
function Unavailable(props: UnavailableProps) {
  const statusLink = isStatusConfigured(props.statuspageId);

  return (
    <main role="main" className="container-fluid">
      <Row>
        <Col md={{ size: 6, offset: 3 }}>
          <section className="jumbotron-header text-center rounded py-3 py-sm-5 mb-3">
            <h1 className="text-primary">
              <FontAwesomeIcon icon={faWrench} /> RenkuLab Down
            </h1>
            <br />
            <p>
              Some of the resources on RenkuLab are temporarily unavailable.
            </p>
          </section>
        </Col>
      </Row>
      {statusLink ? (
        <UnavailableDetailsStatuspage model={props.model} />
      ) : (
        <UnavailableDetailsUnknown />
      )}
    </main>
  );
}

function UnavailableDetailsUnknown() {
  const reload = () => {
    window.location.reload();
  };
  return (
    <Row>
      <Col md={{ size: 6, offset: 3 }}>
        <p className="text-center">
          Please try to{" "}
          <Button color="primary" size="sm" onClick={() => reload()}>
            reload
          </Button>{" "}
          the application in a few minutes.
        </p>
      </Col>
    </Row>
  );
}

interface UnavailableDetailsStatuspageProps {
  model: unknown;
}
function UnavailableDetailsStatuspage({
  model,
}: UnavailableDetailsStatuspageProps) {
  return (
    <Row>
      <Col
        md={{ size: 10, offset: 1 }}
        lg={{ size: 8, offset: 2 }}
        xl={{ size: 8, offset: 3 }}
      >
        <StatuspageDisplay model={model} />
      </Col>
    </Row>
  );
}

export { Maintenance, Unavailable };
