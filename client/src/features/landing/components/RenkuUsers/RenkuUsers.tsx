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
import { Links } from "../../../../utils/constants/Docs.js";
import educatorIcon from "../../assets/educatorIcon.svg";
import organizerIcon from "../../assets/organizerIcon.svg";
import researcherIcon from "../../assets/researcherIcon.svg";

interface RenkuUserCardProps {
  user: string;
  icon: ReactNode;
  title: string;
  description: string;
  linkUrl: string;
}
function RenkuUserCard({
  user,
  icon,
  title,
  description,
  linkUrl,
}: RenkuUserCardProps) {
  return (
    <Card
      className={cx(
        "d-flex",
        "flex-column",
        "justify-content-between",
        "h-100",
        "bg-white",
        "align-items-center",
        "p-4"
      )}
    >
      <div
        className={cx("d-flex", "flex-column", "gap-4", "align-items-center")}
      >
        <h3 className={cx("fs-2", "fw-normal", "my-0", "text-uppercase")}>
          {user}
        </h3>
        {icon}
        <p className={cx("fs-3", "fw-bold", "my-0", "text-center")}>{title}</p>
        <p className={cx("fs-3", "mb-0", "text-center")}>{description}</p>
      </div>
      <div className="mt-5">
        <a
          className={cx("btn", "btn-primary", "btn-lg")}
          href={linkUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Learn more
        </a>
      </div>
    </Card>
  );
}
export function RenkuUsers() {
  const content = {
    research: {
      title: "Unified Research",
      description:
        "Connect your entire research workflow in one place, and collaborate across specialties without technical barriers.",
      link: Links.RENKU_2_RESEARCH,
      icon: (
        <img
          src={researcherIcon}
          alt="Researcher icon Renku"
          width="122"
          height="122"
        />
      ),
    },
    educator: {
      title: "Computing Courses made easy",
      description:
        "Help your students focus on the material, not getting lost during setup. Ideal for project-based coursework and time-sensitive workshops.",
      link: Links.RENKU_2_TEACHING,
      icon: (
        <img
          src={educatorIcon}
          alt="Educator icon Renku"
          width="122"
          height="122"
        />
      ),
    },
    eventOrganizer: {
      title: "Seamless Events",
      description:
        "Focus on innovation, not setup and infrastructure. Provide a consistent environment for all teams, and get participants coding and collaborating right away.",
      link: Links.RENKU_2_EVENTS,
      icon: (
        <img
          src={organizerIcon}
          alt="Educator icon Renku"
          width="122"
          height="122"
        />
      ),
    },
  };
  return (
    <div className="bg-navy">
      <div className={cx("container", "py-5")}>
        <h2
          className={cx("fs-1", "fw-bold", "mb-4", "text-center", "text-white")}
        >
          Who is Renku for?
        </h2>
        <Row className={cx("mb-5", "gap-4", "gap-lg-0")}>
          <Col xs={12} lg={4} className="px-4">
            <RenkuUserCard
              user="Researchers"
              title={content.research.title}
              description={content.research.description}
              linkUrl={content.research.link}
              icon={content.research.icon}
            />
          </Col>
          <Col xs={12} lg={4} className="px-4">
            <RenkuUserCard
              user="Educators"
              title={content.educator.title}
              description={content.educator.description}
              linkUrl={content.educator.link}
              icon={content.educator.icon}
            />
          </Col>
          <Col xs={12} lg={4} className="px-4">
            <RenkuUserCard
              user="Event organizers"
              title={content.eventOrganizer.title}
              description={content.eventOrganizer.description}
              linkUrl={content.eventOrganizer.link}
              icon={content.eventOrganizer.icon}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
