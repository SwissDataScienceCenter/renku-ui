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
import { PlusSquare } from "react-bootstrap-icons";
import { Col, Row } from "reactstrap";

import { Links } from "~/utils/constants/Docs";
import { PROJECT_CREATION_HASH } from "~/features/projectsV2/new/createProjectV2.constants";
import { ExternalLink } from "~/components/ExternalLinks";
import ProjectV2New from "~/features/projectsV2/new/ProjectV2New";
import TakeActionAlert from "~/components/TakeActionAlert";

import MigrateRepo from "./MigrateRepo.svg";
import Background from "./Background.svg";

import styles from "./NoLegacySupportForProjects.module.css";

function FrontendClosedIcon() {
  return (
    <svg
      width="49"
      height="49"
      viewBox="0 0 49 49"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24.3966" cy="24.4161" r="23.8966" fill="#212529" />
      <path
        d="M26.0921 13.9305C25.371 12.6898 23.629 12.6898 22.9079 13.9305L11.7675 33.0972C11.0249 34.3747 11.9164 36 13.3596 36H35.6404C37.0836 36 37.9751 34.3747 37.2325 33.0972L26.0921 13.9305ZM24.4975 19.5714C25.3674 19.5714 26.0471 20.3309 25.9605 21.2061L25.3907 26.9684C25.3448 27.4324 24.9586 27.7857 24.4975 27.7857C24.0363 27.7857 23.6502 27.4324 23.6043 26.9684L23.0345 21.2061C22.9479 20.3309 23.6276 19.5714 24.4975 19.5714ZM24.5 29.4286C25.3973 29.4286 26.1247 30.1641 26.1247 31.0714C26.1247 31.9788 25.3973 32.7143 24.5 32.7143C23.6027 32.7143 22.8753 31.9788 22.8753 31.0714C22.8753 30.1641 23.6027 29.4286 24.5 29.4286Z"
        fill="white"
      />
    </svg>
  );
}

function GitLabShutDownIcon() {
  return (
    <svg
      width="49"
      height="49"
      viewBox="0 0 49 49"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24.6035" cy="24.77" r="23.8966" fill="#212529" />
      <rect
        width="23.8966"
        height="23.8966"
        transform="translate(12.655 12.8218)"
        fill="#212529"
      />
      <path
        d="M24.6033 36.7184C31.2022 36.7184 36.5516 31.3689 36.5516 24.7701C36.5516 18.1712 31.2022 12.8218 24.6033 12.8218C18.0045 12.8218 12.655 18.1712 12.655 24.7701C12.655 31.3689 18.0045 36.7184 24.6033 36.7184ZM18.8479 20.5082C19.1395 20.2166 19.6123 20.2166 19.904 20.5082L20.8695 21.4737L21.835 20.5082C22.1266 20.2166 22.5994 20.2166 22.891 20.5082C23.1827 20.7998 23.1827 21.2727 22.891 21.5643L21.9256 22.5298L22.891 23.4953C23.1827 23.7869 23.1827 24.2597 22.891 24.5514C22.5994 24.843 22.1266 24.843 21.835 24.5514L20.8695 23.5859L19.904 24.5514C19.6123 24.843 19.1395 24.843 18.8479 24.5514C18.5563 24.2597 18.5563 23.7869 18.8479 23.4953L19.8134 22.5298L18.8479 21.5643C18.5563 21.2727 18.5563 20.7998 18.8479 20.5082ZM26.3156 20.5082C26.6072 20.2166 27.08 20.2166 27.3717 20.5082L28.3371 21.4737L29.3026 20.5082C29.5943 20.2166 30.0671 20.2166 30.3587 20.5082C30.6504 20.7998 30.6504 21.2727 30.3587 21.5643L29.3932 22.5298L30.3587 23.4953C30.6504 23.7869 30.6504 24.2597 30.3587 24.5514C30.0671 24.843 29.5943 24.843 29.3026 24.5514L28.3371 23.5859L27.3717 24.5514C27.08 24.843 26.6072 24.843 26.3156 24.5514C26.0239 24.2597 26.0239 23.7869 26.3156 23.4953L27.2811 22.5298L26.3156 21.5643C26.0239 21.2727 26.0239 20.7998 26.3156 20.5082ZM24.6033 32.2378C22.9536 32.2378 21.6162 30.9004 21.6162 29.2507C21.6162 27.601 22.9536 26.2636 24.6033 26.2636C26.253 26.2636 27.5904 27.601 27.5904 29.2507C27.5904 30.9004 26.253 32.2378 24.6033 32.2378Z"
        fill="white"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      width="100"
      height="100"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 175 40"
    >
      <rect y="20" width="150" height="10" />
      <polygon points="175 25 150 40 150 10 175 25" />
    </svg>
  );
}

function DeadlineAlert() {
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

function LegacyNotSupportedHeader() {
  return (
    <div
      className={cx(
        "d-flex",
        "flex-column",
        "align-items-center",
        "mt-2",
        "mb-5"
      )}
    >
      <h2 className="fw-bold">Renku Legacy is no longer supported.</h2>
      <h5>
        This project has not been migrated to the new version of Renku, Renku
        2.0.
      </h5>
      <div
        className={cx("d-flex", "flex-row", "justify-content-center", "gap-5")}
      >
        <div
          className={cx(
            "fw-bold",
            "d-flex",
            "flex-column",
            "align-items-center"
          )}
        >
          <div>
            <FrontendClosedIcon />
          </div>
          <div>Frontend closed </div>
          <div>October 2025</div>
        </div>
        <div>
          <Arrow />
        </div>
        <div
          className={cx(
            "fw-bold",
            "d-flex",
            "flex-column",
            "align-items-center"
          )}
        >
          <div>
            <GitLabShutDownIcon />
          </div>
          <div>GitLab shut down</div>
          <div>January 2026</div>
        </div>
      </div>
    </div>
  );
}

function LegacyNotSupportedFooter() {
  const homeLink = "/";
  return (
    <div className={cx("border-top", "border-dark", "mt-4", "p-0", "pt-4")}>
      <Row>
        <Col>
          Not your project?{" "}
          <Link className={cx("btn", "btn-outline-primary")} to={homeLink}>
            Try out Renku 2.0
          </Link>{" "}
          or learn{" "}
          <ExternalLink
            className="text-dark"
            role="text"
            title="How is Renku 2.0 different from Renku Legacy?"
            url={Links.RENKU_2_WHY_RENKU}
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          For more information{" "}
          <ExternalLink
            className="text-dark"
            role="text"
            title="contact us"
            url={Links.CONTACT_US}
          />{" "}
          or read our blog post about{" "}
          <ExternalLink
            className="text-dark"
            role="text"
            title="Sunsetting Renku Legacy."
            url={Links.RENKU_2_SUNSET}
          />
        </Col>
      </Row>
    </div>
  );
}

function ProjectNoLegacyMigrateStep1() {
  const location = useLocation();
  const locationPath = location.pathname;
  const gitlabProjectPath = locationPath.replace("/projects/", "");
  const gitlabProjectUrl = `https://gitlab.renkulab.io/${gitlabProjectPath}`;
  return (
    <div
      className={cx(
        "border",
        "border-2",
        "border-take-action",
        "rounded-2",
        "p-0"
      )}
    >
      <h4
        className={cx("fw-bold", "bg-take-action", "p-3", "m-0", "text-light")}
      >
        If this is your project: Migrate your code repository now to prevent
        data removal.
      </h4>
      <div
        className={cx(
          "mx-3",
          "d-flex",
          "flex-row",
          "align-items-center",
          "gap-5"
        )}
      >
        <div className="my-3 pe-2">
          <div className="fw-bold">
            1. Migrate your GitLab repo to an external provider
          </div>
          <div className="mt-4 mb-2">
            Transfer repositories from RenkuLab GitLab to external providers for
            continued integration with Renku 2.0.
          </div>
          <div className="mb-2">
            <span className="me-2">
              <ExternalLink
                role="button"
                showLinkIcon={true}
                title="Go to GitLab repo"
                url={gitlabProjectUrl}
              />
            </span>
            <ExternalLink
              role="text"
              title="and follow step-by-step instructions"
              url={
                Links.RENKU_2_SUNSET +
                "#how-to-move-a-code-repository-to-an-external-provider"
              }
            />
          </div>
        </div>
        <div className={cx("text-center", "my-3")}>
          <img src={MigrateRepo} alt="Migrate your GitLab repo" />
        </div>
      </div>
    </div>
  );
}

function ProjectNoLegacyMigrateStep2() {
  return (
    <div
      className={cx(
        "border",
        "border-2",
        "border-gray-300",
        "rounded-2",
        "p-0"
      )}
    >
      <div
        className={cx(
          "mx-3",
          "d-flex",
          "flex-row",
          "align-items-center",
          "justify-content-between",
          "gap-5"
        )}
      >
        <div className="my-3 pe-2">
          <div>
            <b>2. Create a new project in Renku 2.0</b> and connect your new
            code repository
          </div>
        </div>
        <div className={cx("text-center", "my-3")}>
          <span className="me-2">
            <ExternalLink
              role="text"
              title="Step-by-step instructions"
              url={Links.RENKU_2_CREATE_PROJECT}
            />
          </span>
          <Link
            to={{ hash: PROJECT_CREATION_HASH }}
            className={cx("btn", "btn-primary")}
          >
            <PlusSquare className={cx("bi", "me-1")} />
            Create a project
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProjectNoLegacyMigrateStep3() {
  return (
    <div
      className={cx(
        "border",
        "border-2",
        "border-gray-300",
        "rounded-2",
        "p-0"
      )}
    >
      <div
        className={cx(
          "mx-3",
          "d-flex",
          "flex-row",
          "align-items-center",
          "justify-content-between",
          "gap-5"
        )}
      >
        <div className="my-3 pe-2">
          <div>
            <b>
              3. Want this page to automatically redirect to your new Renku 2.0
              project?
            </b>{" "}
            (Optional)
          </div>
        </div>
        <div className={cx("text-center", "my-3")}>
          <ExternalLink
            role="button"
            showLinkIcon={true}
            title="Register a redirect"
            url={Links.RENKU_2_REGISTER_REDIRECT}
          />
        </div>
      </div>
    </div>
  );
}

function ProjectNoLegacySupportDetails() {
  return (
    <div className={cx("m-auto", "d-flex", "flex-column")}>
      <LegacyNotSupportedHeader />
      <Row>
        <Col>
          <ProjectNoLegacyMigrateStep1 />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <ProjectNoLegacyMigrateStep2 />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <ProjectNoLegacyMigrateStep3 />
        </Col>
      </Row>
    </div>
  );
}

export default function NoLegacySupportForProjectsRenkulabIo() {
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
        <DeadlineAlert />
        <div className={cx(["pb-5", "px-3", "px-sm-4", "px-xxl-5"])}>
          <ProjectNoLegacySupportDetails />
          <LegacyNotSupportedFooter />
        </div>
      </div>
    </div>
  );
}
