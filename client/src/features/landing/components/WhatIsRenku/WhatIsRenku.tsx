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

import cx from "classnames";
import { Col, Row } from "reactstrap";

import { ExternalLink } from "../../../../components/ExternalLinks";
import { RenkuContactEmail } from "../../../../utils/constants/Docs.js";
import collaborationGraphic from "../../assets/boxes.svg";
import computingGraphic from "../../assets/computing.svg";
import connectionGraphic from "../../assets/network.svg";
import researchGraphic from "../../assets/research.png";
import TemplateSlider from "../TemplateSlider/TemplateSlider";

function ResearchFeatSection() {
  return (
    <Row className={cx("m-0", "m-lg-5", "gap-3", "gap-lg-0")}>
      <Col xs={12} lg={6} className={cx("order-2", "order-lg-1")}>
        <img
          src={researchGraphic}
          className="w-100"
          alt="Research Renku graphic"
          loading="lazy"
        />
      </Col>
      <Col
        xs={12}
        lg={6}
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "gap-lg-4",
          "order-1",
          "order-lg-2"
        )}
      >
        <h3 className={cx("fs-2", "fw-bold", "my-0")}>
          Where research comes together
        </h3>
        <p className={cx("mb-0", "fs-3")}>
          Integrations galore! We support integrations for your favorite code
          and data platforms, so you can connect your whole project in one
          place.
        </p>
      </Col>
    </Row>
  );
}

function ResearcherFeatSection() {
  return (
    <Row className={cx("m-0", "m-lg-5", "gap-3", "gap-lg-0")}>
      <Col
        xs={12}
        lg={6}
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "gap-lg-4",
          "order-1",
          "order-lg-1"
        )}
      >
        <h3 className={cx("fs-2", "fw-bold", "my-0")}>
          Built for Every Researcher
        </h3>
        <p className={cx("mb-0", "fs-3")}>
          Whether you&apos;re comfortable with command lines or prefer graphical
          interfaces, Renku adapts to your working style.
        </p>
        <p className={cx("mb-0", "fs-3")}>
          Launch browser-based sessions with zero setup. Customize your
          development environment for advanced needs.
        </p>
      </Col>
      <Col xs={12} lg={6} className={cx("order-2", "order-lg-2")}>
        <div className={cx("pb-5", "pb-lg-0")}>
          <TemplateSlider />
        </div>
      </Col>
    </Row>
  );
}

function CollaborationFeatSection() {
  return (
    <Row className={cx("m-0", "m-lg-5", "gap-3", "gap-lg-0")}>
      <Col xs={12} lg={6} className={cx("order-2", "order-lg-1")}>
        <img
          src={collaborationGraphic}
          alt="Collaboration Renku graphic"
          loading="lazy"
          className="w-100"
        />
      </Col>
      <Col
        xs={12}
        lg={6}
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "gap-lg-4",
          "order-1",
          "order-lg-2"
        )}
      >
        <h3 className={cx("fs-2", "fw-bold", "my-0")}>
          Effortless Collaboration
        </h3>
        <p className={cx("mb-0", "fs-3")}>
          Share your Renku project with anyone, and never worry about “it
          doesn’t work on my machine” again.
        </p>
      </Col>
    </Row>
  );
}

function ComputingFeatSection() {
  return (
    <Row className={cx("m-0", "m-lg-5", "gap-3", "gap-lg-0")}>
      <Col
        xs={12}
        lg={6}
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "gap-lg-4",
          "order-1",
          "order-lg-1"
        )}
      >
        <h3 className={cx("fs-2", "fw-bold", "my-0")}>Flexible Computing</h3>
        <p className={cx("mb-0", "fs-3")}>
          Scaling up your project is as simple as switching your resource class.
          Do data exploration and model training all in one place!
        </p>
        <div>
          <ExternalLink
            className="fs-3"
            role="link"
            id="computeFeatLink"
            url={`mailto:${RenkuContactEmail}?subject=RenkuLab%20compute%20resources`}
            title="Contact us for bigger compute options"
          />
        </div>
      </Col>
      <Col xs={12} lg={6} className={cx("order-2", "order-lg-2")}>
        <img
          src={computingGraphic}
          alt="Computing Renku graphic"
          loading="lazy"
          className="w-100"
        />
      </Col>
    </Row>
  );
}

function ConnectionFeatSection() {
  return (
    <Row className={cx("m-0", "m-lg-5", "gap-3", "gap-lg-0")}>
      <Col xs={12} lg={6} className={cx("order-2", "order-lg-1")}>
        <img
          src={connectionGraphic}
          alt="Connection Renku graphic"
          loading="lazy"
          className="w-100"
        />
      </Col>
      <Col
        xs={12}
        lg={6}
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "gap-lg-4",
          "order-1",
          "order-lg-2"
        )}
      >
        <h3 className={cx("fs-2", "fw-bold", "my-0")}>
          Let others stand on your shoulders
        </h3>
        <p className={cx("mb-0", "fs-3")}>
          Research thrives on connection. Renku makes your work naturally
          well-structured, discoverable by others, and easy to build upon.
        </p>
      </Col>
    </Row>
  );
}

export default function WhatIsRenku() {
  return (
    <div id="rk-anon-home-what-is-renku">
      <div
        className={cx(
          "container",
          "d-flex",
          "flex-column",
          "gap-5",
          "gap-lg-4",
          "my-5"
        )}
      >
        <div className={cx("text-center", "mt-0", "mt-lg-4")}>
          <h2 className={cx("fs-1", "fw-bold")}>Renku Features</h2>
          <p className={cx("mb-0", "fs-3", "mx-5")}>
            Stop juggling multiple platforms and scattered resources. Renku
            provides a seamless environment where all your project components
            work together.
          </p>
        </div>
        <ResearchFeatSection />
        <ResearcherFeatSection />
        <CollaborationFeatSection />
        <ComputingFeatSection />
        <ConnectionFeatSection />
      </div>
    </div>
  );
}
