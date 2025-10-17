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
    <div className={cx("my-5")}>
      <Container>
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "align-items-center",
            "gap-4",
            "mt-0",
            "my-5"
          )}
        >
          <h1 className={cx("m-0", "fw-bold", "text-center")}>
            <span className={cx("fw-normal", "d-block")}>
              Get started today
            </span>
            Launch your first session now!
          </h1>
        </div>
        <Row>
          <Col xs={12} lg={6}>
            <div
              className={cx(
                "d-flex",
                "flex-column",
                "gap-4",
                "align-items-center",
                "align-items-lg-start"
              )}
            >
              <p className={cx("mb-0", "fs-3")}>
                Creating projects and running sessions in our public compute
                tier is always free.
              </p>
              <div>
                <a
                  className={cx("btn", "btn-primary", "btn-lg")}
                  href={loginUrl.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Create an account
                </a>
              </div>
              <p className={cx("mb-0", "fs-3")}>
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
                    "btn-lg"
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
            className={cx("text-center", "text-lg-end", "mt-5", "mt-lg-0")}
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
