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
import { Envelope, Github, HeartFill } from "react-bootstrap-icons";
import { Col, Row } from "reactstrap";

import {
  ExternalDocsLink,
  ExternalLink,
} from "../../../../components/ExternalLinks";
import { Links, RenkuContactEmail } from "../../../../utils/constants/Docs.js";
import logo_EPFL from "../../assets/EPFL.svg";
import logo_ETH from "../../assets/ETH.svg";
import logo_SDSC from "../../assets/SDSC.svg";

export default function WhoWeAre() {
  const contactEmail = RenkuContactEmail || "";
  return (
    <div className="bg-light">
      <div className={cx("container", "py-5")}>
        <h2 className={cx("fs-1", "mb-4", "text-center")}>
          Built for data scientists, by data scientists.
        </h2>
        <Row className="g-5">
          <Col className="offset-lg-1 d-flex flex-column gap-4" xs={12} lg={7}>
            <p className={cx("fs-3", "mb-0")}>
              Renku is built by the{" "}
              <ExternalLink
                role="link"
                url={Links.SDSC}
                className="fw-semibold"
              >
                Swiss Data Science Center
              </ExternalLink>{" "}
              with funding from the{" "}
              <ExternalLink role="link" url={Links.ETH} className="fw-semibold">
                ETH domain
              </ExternalLink>
              .
            </p>
            <p className={cx("fs-3", "mb-0")}>
              Our goal is to provide data and domain scientists with the tools
              they need to work, collaborate and share their research.
            </p>
            <p className={cx("fs-3", "mb-0")}>
              Developed with <HeartFill className="text-primary" /> at ETH
              Zurich and EPFL with contributions from our fantastic community.
            </p>
            <div className={cx("d-flex", "gap-3", "mt-3")}>
              <ExternalLink
                className="btn-lg"
                color="primary"
                role="button"
                id="Contact_us_btn"
                url={`mailto:${contactEmail}`}
                title=""
              >
                <Envelope size={20} /> Email us!
              </ExternalLink>

              <ExternalDocsLink
                url={Links.GITHUB}
                title=""
                className={cx("d-flex", "align-items-center", "gap-2", "fs-3")}
              >
                <Github className="text-black" size={24} />
                Go to the Github repository
              </ExternalDocsLink>
            </div>
          </Col>

          <Col xs={12} lg={4} className={cx("d-flex", "flex-column", "gap-4")}>
            <div>
              <ExternalLink url={Links.SDSC} className="" role="link">
                <img src={logo_SDSC} alt="SDSC" height="54" />
              </ExternalLink>
              <p className="fs-3">Swiss Data Science Center</p>
            </div>
            <div>
              <ExternalLink url={Links.ETHZ} className="" role="link">
                <img className="mb-2" src={logo_ETH} alt="ETH" height="25" />
              </ExternalLink>
              <p className="fs-3">
                Wasserwerkstrasse 10,
                <br />
                8092 Zürich <br />
                +41 44 632 26 89
              </p>
            </div>
            <div>
              <ExternalLink url={Links.EPFL} className="" role="link">
                <img className="mb-2" src={logo_EPFL} alt="EPFL" height="30" />
              </ExternalLink>
              <p className="fs-3">
                INN Building, Station 14,
                <br />
                1015 Lausanne
                <br />
                +41 21 693 43 88
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
