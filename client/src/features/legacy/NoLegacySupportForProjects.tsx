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
import { type CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { BookmarkStar, PlusSquare, Send } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import { Links } from "~/utils/constants/Docs";
import { PROJECT_CREATION_HASH } from "~/features/projectsV2/new/createProjectV2.constants";
import { ExternalLink } from "~/components/ExternalLinks";
import ProjectV2New from "~/features/projectsV2/new/ProjectV2New";
import TakeActionAlert from "~/components/TakeActionAlert";

import CreateProject from "./CreateProject.svg";
import MigrateRepo from "./MigrateRepo.svg";
import RegisterRedirect from "./RegisterRedirect.svg";
import Background from "./Background.svg";

import styles from "./NoLegacySupportForProjects.module.css";

function ProjectNoLegacySupportHeader() {
  return (
    <TakeActionAlert className="rounded-0">
      <div
        className={cx("d-flex", "flex-column", "align-items-center", "gap-3")}
      >
        <h1 className="fw-bold">
          CRITICAL: DATA REMOVAL DEADLINE &mdash; JANUARY 2026
        </h1>
        <h4 className="fw-normal">
          The RenkuLab GitLab will be shut down &mdash; All code repositories
          will be removed
        </h4>
      </div>
    </TakeActionAlert>
  );
}

function ProjectNoLegacyMigrateStep1() {
  const location = useLocation();
  const locationPath = location.pathname;
  const gitlabProjectPath = locationPath.replace("/projects/", "");
  const gitlabProjectUrl = `https://gitlab.renkulab.io/${gitlabProjectPath}`;
  return (
    <Card>
      <CardHeader>
        <h5>Move repo to new host</h5>
        <div className={cx("text-center", "mt-4")}>
          <img src={MigrateRepo} alt="Migrate your GitLab repo" />
        </div>
      </CardHeader>
      <CardBody>
        <div className="mt-4 mb-2">
          The RenkuLab GitLab instance will be decommissioned in January 2026.
          Please move your repositories to a new host, such as GitHub or
          GitLab.com.
        </div>
        <div className="mb-2">
          <ExternalLink
            role="button"
            showLinkIcon={true}
            title="Go to GitLab repo"
            url={gitlabProjectUrl}
          />
        </div>
        <div>
          <ExternalLink
            role="text"
            title="Step-by-step instructions"
            url={
              Links.RENKU_2_SUNSET +
              "#how-to-move-a-code-repository-to-an-external-provider"
            }
          />
        </div>
      </CardBody>
    </Card>
  );
}

function ProjectNoLegacyMigrateStep2() {
  return (
    <Card>
      <CardHeader>
        <h5>Create a Renku 2.0 project</h5>
        <div className={cx("text-center", "mt-4")}>
          <img src={CreateProject} alt="Create a Renku 2.0 project" />
        </div>
      </CardHeader>
      <CardBody>
        <div className="mt-4 mb-2">
          Work in Renku is organized around projects. Create a new Renku 2.0
          project and add your code repository to it.
        </div>
        <div className="mb-2">
          <Link
            to={{ hash: PROJECT_CREATION_HASH }}
            className={cx("btn", "btn-primary")}
          >
            <PlusSquare className={cx("bi", "me-1")} />
            Create a project
          </Link>
        </div>
        <div>
          <ExternalLink
            role="text"
            title="Step-by-step instructions"
            url={Links.RENKU_2_CREATE_PROJECT}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function ProjectNoLegacyMigrateStep3() {
  return (
    <Card>
      <CardHeader>
        <h5>Redirect legacy URLs</h5>
        <div className={cx("text-center", "mt-4")}>
          <img src={RegisterRedirect} alt="Register a redirect" />
        </div>
      </CardHeader>
      <CardBody>
        <div className="mt-4 mb-2">
          Do you have links to Renku Legacy projects or Renku GitLab
          repositories that you would like to continue to work? Register where
          you would like these links to automatically redirect to.
        </div>
        <div className="mb-2">
          <div className="mb-2">
            <ExternalLink
              role="button"
              showLinkIcon={true}
              title="Register a redirect (coming soon)"
              url={Links.RENKU_2_SUNSET}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ProjectNoLegacySupportDetails() {
  return (
    <div className={cx("m-auto", "d-flex", "flex-column", "mt-5")}>
      <div className={cx("mt-0", "mb-3")}>
        If this is your project,{" "}
        <b>you have until January 2026 to migrate it.</b> Here is what you need
        to do:
      </div>
      <Row>
        <Col md={4}>
          <ProjectNoLegacyMigrateStep1 />
        </Col>
        <Col md={4}>
          <ProjectNoLegacyMigrateStep2 />
        </Col>
        <Col md={4}>
          <ProjectNoLegacyMigrateStep3 />
        </Col>
      </Row>
    </div>
  );
}

export default function NoLegacySupportForProjects() {
  const backgroundImage: CSSProperties = {
    backgroundImage: `url("${Background}")`,
  };
  return (
    <div
      className={cx(
        "w-100",
        "d-flex",
        "flex-column",
        "justify-content-center",
        styles.background
      )}
      style={backgroundImage}
    >
      <ProjectV2New />
      <div className={cx(["bg-white", "container-xxl", "py-0", "px-0"])}>
        <ProjectNoLegacySupportHeader />
        <div className={cx(["py-5", "px-3", "px-sm-4", "px-xxl-5"])}>
          <ProjectNoLegacySupportDetails />
        </div>
      </div>
    </div>
  );
}
