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
import { Link } from "react-router";
import { Col, Container, Row } from "reactstrap";
import { Links } from "../../../../utils/constants/Docs.js";
import connectIcon from "../../assets/connectIcon.svg";
import puzzleIcon from "../../assets/puzzleIcon.svg";
import { useCustomHomePageProjectUrl } from "../../hooks/useCustomHomePageProjectUrl.hook";
import styles from "./Introduction.module.scss";

export function Introduction() {
  const projectUrl = useCustomHomePageProjectUrl();
  return (
    <div
      className={cx("bg-navy", "py-5", "px-3", styles.IntroductionRenku20Bg)}
    >
      <Container className={cx("py-3", "px-0")}>
        <div
          className={cx(
            "bg-white",
            "rounded-5",
            "d-flex",
            "flex-column",
            "gap-4",
            "px-3",
            "align-items-center"
          )}
        >
          <h2 className={cx("text-center", "fs-1", "mt-5", "pt-3", "mb-0")}>
            Introducing Renku 2.0: <br />
            <span className="fw-bold">
              Taking collaboration to the next level.
            </span>
          </h2>
          <p className={cx("text-center", "mb-0", "fs-4")}>
            We’re thrilled to announce the next generation of the Renku
            platform, Renku 2.0.
            <span className="d-block">Here’s what’s new:</span>
          </p>
          <Row
            className={cx(
              styles.IntroductionRenku20Sections,
              "text-center",
              "gap-5",
              "gap-lg-0"
            )}
          >
            <Col
              xs={12}
              lg={6}
              className={cx("px-0", "px-lg-3", "text-center")}
            >
              <img src={connectIcon} alt="Renku" width="62" height="62" />
              <h4 className={cx("py-3", "fw-bold")}>
                Connect your favorite tools and platforms.
              </h4>
              <p className={cx("fs-4", "mb-0")}>
                Hook up your Renku project to GitHub repositories, external data
                sources, and more. Flexible integrations make collaboration easy
                and powerful.
              </p>
            </Col>
            <Col
              xs={12}
              lg={6}
              className={cx("px-0", "px-lg-3", "text-center")}
            >
              <img src={puzzleIcon} alt="Renku" width="62" height="62" />
              <h4 className={cx("py-3", "fw-bold")}>
                Plug-and-Play Flexibility.
              </h4>
              <p className={cx("fs-4", "mb-0")}>
                Mix and match code, data, and compute to suit your project
                setup, scaling from exploration to advanced analysis with ease.
              </p>
            </Col>
          </Row>
          <div
            className={cx(
              "pb-3",
              "mb-5",
              "d-flex",
              "gap-3",
              "flex-sm-row",
              "flex-column",
              "align-items-center"
            )}
          >
            <Link
              className={cx(
                "btn",
                "btn-primary",
                "text-decoration-none",
                "fs-5"
              )}
              to={projectUrl}
              data-cy={`explore-a-project-introduction-btn`}
              target="_blank"
            >
              Explore a Renku 2.0 project
            </Link>
            <Link
              className={cx("btn", "btn-outline-primary", "fs-5")}
              id="hero_link-learn-more"
              to={Links.RENKU_2_LEARN_MORE}
              target="_blank"
            >
              Learn more...
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
