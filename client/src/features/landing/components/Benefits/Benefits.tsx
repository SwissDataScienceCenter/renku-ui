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
import individualsIcon from "../../assets/individualsIcon.svg";
import teamsIcon from "../../assets/teamsIcon.svg";
import communityIcon from "../../assets/communityIcon.svg";
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
          "pt-5"
        )}
      >
        {icon}
        <h4 className={cx("fw-bold", "my-0", "text-center")}>{title}</h4>
        <p className={cx("mb-0", "fs-4", "text-center")}>{description}</p>
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
        <div className={cx("pt-5", "pb-4", "pb-lg-5")}>
          <h2
            className={cx(
              "text-center",
              "fs-1",
              "mt-0",
              "mt-lg-5",
              "text-white",
              "fw-bold",
              "mb-0"
            )}
          >
            The Benefits of Using Renku
          </h2>
        </div>
        <Row className={cx("pb-5")}>
          <Col xs={8} className={cx("px-4", "offset-2", "pt-5")}>
            <BenefitsCard
              title={content.individuals.title}
              description={content.individuals.description}
              icon={content.individuals.icon}
            />
          </Col>
        </Row>
        <Row className={cx("pb-5")}>
          <Col xs={10} className={cx("px-4", "offset-1", "pt-5")}>
            <BenefitsCard
              title={content.teams.title}
              description={content.teams.description}
              icon={content.teams.icon}
            />
          </Col>
        </Row>
        <Row className={cx("pb-3")}>
          <Col xs={12} className={cx("px-4", "pt-5")}>
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
