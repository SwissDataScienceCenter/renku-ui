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
import { ReactNode } from "react";
import { Card, Col, Row } from "reactstrap";
import communityIcon from "../../assets/communityIcon.svg";
import individualsIcon from "../../assets/individualsIcon.svg";
import teamsIcon from "../../assets/teamsIcon.svg";
import styles from "./Benefits.module.scss";

interface BenefitsProps {
  icon: ReactNode;
  title: string;
  description: string;
}
function BenefitsCard({ icon, title, description }: BenefitsProps) {
  return (
    <Card
      className={cx(
        "d-flex",
        "flex-column",
        "justify-content-between",
        "h-100",
        "bg-white",
        "align-items-center",
        "gap-2",
        "p-4"
      )}
    >
      <div
        className={cx(
          "d-flex",
          "flex-column",
          "gap-2",
          "align-items-center",
          styles.BenefitsIconGap
        )}
      >
        {icon}
        <h3 className={cx("fs-2", "fw-bold", "my-0", "text-center")}>
          {title}
        </h3>
        <p className={cx("mb-0", "fs-3", "text-center")}>{description}</p>
      </div>
    </Card>
  );
}
export function RenkuBenefits() {
  const content = {
    individuals: {
      title: "For individuals:",
      description: "Spend more time on science, not setup.",
      icon: (
        <img
          src={individualsIcon}
          alt="Individuals icon Renku"
          width="122"
          height="122"
          className={cx(styles.BenefitsIcon, "position-absolute")}
        />
      ),
    },
    teams: {
      title: "For Teams:",
      description:
        "Boost efficiency by enabling team members to build on each other's work instead of starting from scratch.",
      icon: (
        <img
          src={teamsIcon}
          alt="Teams icon Renku"
          width="122"
          height="122"
          className={cx(styles.BenefitsIcon, "position-absolute")}
        />
      ),
    },
    community: {
      title: "For the Community:",
      description:
        // eslint-disable-next-line spellcheck/spell-checker
        "Make your research discoverable and reusable, contributing to a network of connected knowledge.",
      icon: (
        <img
          src={communityIcon}
          alt="Community icon Renku"
          width="122"
          height="122"
          className={cx(styles.BenefitsIcon, "position-absolute")}
        />
      ),
    },
  };
  return (
    <div className="bg-navy">
      <div className={cx("container", "py-5", "px-3")}>
        <h2
          className={cx("fs-1", "fw-bold", "mb-5", "text-center", "text-white")}
        >
          The Benefits of Using Renku
        </h2>
        <Row className="g-5">
          <Col
            xs={12}
            lg={8}
            className={cx("px-4", "offset-lg-2", styles.BenefitsIconDistance)}
          >
            <BenefitsCard
              title={content.individuals.title}
              description={content.individuals.description}
              icon={content.individuals.icon}
            />
          </Col>
          <Col
            xs={12}
            lg={10}
            className={cx("px-4", "offset-lg-1", styles.BenefitsIconDistance)}
          >
            <BenefitsCard
              title={content.teams.title}
              description={content.teams.description}
              icon={content.teams.icon}
            />
          </Col>
          <Col
            xs={12}
            className={cx("mb-3", "px-4", styles.BenefitsIconDistance)}
          >
            <BenefitsCard
              title={content.community.title}
              description={content.community.description}
              icon={content.community.icon}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
