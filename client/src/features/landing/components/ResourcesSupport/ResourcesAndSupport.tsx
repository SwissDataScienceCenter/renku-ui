/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { CodeSquare, InfoCircle } from "react-bootstrap-icons";
import { Col, Container, Row } from "reactstrap";
import { FooterDashboardCard } from "../../../dashboardV2/DashboardV2.js";
import renkuBlackIcon from "../../assets/renkuBlack.svg";
import { Links } from "../../../../utils/constants/Docs.js";
import styles from "./Resources.module.scss";

export function ResourcesAndSupport() {
  return (
    <Container className={cx("bg-white", "py-5")}>
      <h1 className={cx("text-center", "fw-bold", "mb-4")}>
        Resources and support
      </h1>
      <Row className={cx("text-center", "g-5", "mb-3")}>
        <Col xs={12} lg={4} className={cx("px-3", "text-center")}>
          <FooterDashboardCard
            url={Links.RENKU_2_GET_HELP}
            className={cx("text-decoration-none", "text-body")}
          >
            <InfoCircle size={60} />
            <h2 className="mb-0">Get Help</h2>
            <p className={cx("fs-3", "mb-0")}>
              See our documentation, join the forum, or contact us.
            </p>
          </FooterDashboardCard>
        </Col>
        <Col xs={12} lg={4} className={cx("px-3", "text-center")}>
          <FooterDashboardCard
            url={Links.RENKU_2_COMMUNITY_PORTAL}
            className={cx(
              "text-decoration-none",
              "text-body",
              styles.RenkuCard
            )}
          >
            <img src={renkuBlackIcon} alt="Renku" width="60" height="60" />
            <h2 className="mb-0">Get Involved</h2>
            <p className={cx("fs-3", "mb-0")}>
              Visit our Community Portal for community events and our roadmap.
            </p>
          </FooterDashboardCard>
        </Col>
        <Col xs={12} lg={4} className={cx("px-3", "text-center")}>
          <FooterDashboardCard
            url={Links.GITHUB}
            className={cx("text-decoration-none", "text-body")}
          >
            <CodeSquare size={60} />
            <h2 className="mb-0">Open Source</h2>
            <p className={cx("fs-3", "mb-0", "text-decoration-none")}>
              Browse our code on GitHub.
            </p>
          </FooterDashboardCard>
        </Col>
      </Row>
    </Container>
  );
}
