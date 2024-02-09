/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import { Fragment } from "react";

import { Row, Col, Card, CardBody, CardHeader } from "reactstrap";

/* eslint-disable */
function CardsSection(props) {
  return (
    <Row>
      <Col>
        <h3>Cards</h3>
        <p>Use cards to show information grouped by sections.</p>
        <Card>
          <CardHeader className="bg-white p-3 ps-4">
            <b>Card Title</b>
          </CardHeader>
          <CardBody style={{ overflow: "auto" }} className="p-4">
            <p>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet.
            </p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

function FormsSection() {
  return (
    <Row>
      <Col>
        <h3>Forms</h3>
        <p>This section is being reworked...</p>
      </Col>
    </Row>
  );
}

function FormsGuide() {
  return (
    <Fragment>
      <h2>Forms and Fields</h2>
      <CardsSection />
      <br />
      <FormsSection />
    </Fragment>
  );
}

export default FormsGuide;
