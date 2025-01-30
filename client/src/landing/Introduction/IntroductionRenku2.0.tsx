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
import { Button, Col, Container, Row } from "reactstrap";
import { Links } from "../../utils/constants/Docs.js";
import connectIcon from "../Graphics/connectIcon.svg";
import puzzleIcon from "../Graphics/puzzleIcon.svg";
import styles from "./IntroductionRenku20.module.scss";

export function IntroductionRenku20() {
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
            "gap-5",
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
          <p className={cx("text-center", "mb-0", "fs-3")}>
            We’re thrilled to announce the next generation of the Renku
            platform, Renku 2.0. <br />
            Here’s what’s new:
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
              className={cx("px-0", "px-lg-5", "text-center")}
            >
              <img src={connectIcon} alt="Renku" width="62" height="62" />
              <h4 className={cx("py-3", "fw-bold")}>
                Connect your favorite tools and platforms.
              </h4>
              <p className={cx("fs-3", "mb-0")}>
                Hook up your Renku project to GitHub repositories, external data
                sources, and more. Flexible integrations make collaboration easy
                and powerful.
              </p>
            </Col>
            <Col
              xs={12}
              lg={6}
              className={cx("px-0", "px-lg-5", "text-center")}
            >
              <img src={puzzleIcon} alt="Renku" width="62" height="62" />
              <h4 className={cx("py-3", "fw-bold")}>
                Plug-and-Play Flexibility.
              </h4>
              <p className={cx("fs-3", "mb-0")}>
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
            <Button
              className={cx("btn", styles.heroBtn)}
              color="primary"
              role="button"
              id="link-try-it-out"
            >
              Explore a Renku 2.0 project
            </Button>
            <a
              className={cx("btn", "btn-outline-primary", styles.heroBtn)}
              id="hero_link-learn-more"
              href={Links.RENKU_2_LEARN_MORE}
            >
              Learn more...
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
