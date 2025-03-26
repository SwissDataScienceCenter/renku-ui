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
import { Col, Container, Row } from "reactstrap";
import { useLoginUrl } from "../../../../authentication/useLoginUrl.hook";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { RenkuContactEmail } from "../../../../utils/constants/Docs.js";
import getStartedGraphic from "../../assets/getStarted.svg";
import styles from "./GetStarted.module.scss";

export function GetStarted() {
  const loginUrl = useLoginUrl();
  return (
    <div className={cx("bg-white", "py-5", "mb-5")}>
      <Container>
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "align-items-center",
            "gap-4",
            "mt-0",
            "py-5"
          )}
        >
          <h3 className={cx("m-0", "fw-bold", "text-center", "fs-1")}>
            <span className={cx("fw-light", "d-block")}>Get started today</span>
            Launch your first session now!
          </h3>
        </div>
        <Row>
          <Col xs={12} lg={6}>
            <div
              className={cx(
                "d-flex",
                "flex-column",
                "gap-4",
                "mt-0",
                "align-items-center",
                "align-items-lg-start"
              )}
            >
              <p className={cx("mb-0", "fs-4")}>
                Creating projects and running sessions in our public compute
                tier is always free.
              </p>
              <div>
                <a
                  className={cx("btn", "btn-primary", "fs-5")}
                  href={loginUrl.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Create an account
                </a>
              </div>
              <p className={cx("mb-0", "fs-4")}>
                For individuals who need more compute resources, and for
                instructors organizing courses, get in touch to set up your
                custom RenkuLab resources.
              </p>
              <div>
                <ExternalLink
                  className={cx(
                    "btn",
                    "btn-outline-primary",
                    "text-decoration-none",
                    "fs-5"
                  )}
                  role="link"
                  url={`mailto:${RenkuContactEmail}?subject=Requesting%20Pricing%20Details `}
                  title="Contact us for pricing"
                />
              </div>
            </div>
          </Col>
          <Col
            xs={12}
            lg={6}
            className={cx("text-center", "text-lg-end", "pt-5", "pt-lg-0")}
          >
            <img
              src={getStartedGraphic}
              alt="Renku"
              className={cx("w-100", styles.GetStartedImg)}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
