/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { EyeFill, Folder2Open, PencilSquare } from "react-bootstrap-icons";
import { generatePath } from "react-router-dom-v5-compat";
import { Nav, NavItem, NavLink } from "reactstrap";

import RenkuNavLinkV2 from "../../../components/RenkuNavLinkV2";
import { ProjectPageContentType } from "../ProjectPageContent/projectPageContentType.types";

import styles from "./ProjectPageNav.module.scss";
import type { Project } from "../../projectsV2/api/projectV2.api.ts";

import AccessGuard from "../utils/AccessGuard.tsx";
import useProjectAccess from "../utils/useProjectAccess.hook.ts";

export default function ProjectPageNav({
  project,
  selectedContent,
}: {
  project: Project;
  selectedContent?: ProjectPageContentType;
}) {
  const { namespace, slug } = project;
  const { userRole } = useProjectAccess({ projectId: project.id });
  const projectUrl = generatePath("/v2/projects/:namespace/:slug", {
    namespace: namespace || "",
    slug: slug || "",
  });
  const projectSettingsUrl = generatePath(
    "/v2/projects/:namespace/:slug/settings",
    {
      namespace: namespace || "",
      slug: slug || "",
    }
  );
  const projectInfoUrl = generatePath("/v2/projects/:namespace/:slug/info", {
    namespace: namespace || "",
    slug: slug || "",
  });

  const navLinkClasses = [
    "p-0",
    "mb-1",
    "text-center",
    "text-lg-start",
    "d-flex",
    "flex-column",
    "flex-lg-row",
    "align-items-center",
    "align-items-lg-start",
    "gap-2",
    "fs-small",
  ];

  return (
    <>
      <Nav justified className={cx("d-flex", "flex-row", "flex-lg-column")}>
        <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0", "d-flex")}>
          <RenkuNavLinkV2
            end
            to={projectUrl}
            title="Overview"
            className={cx(navLinkClasses, styles.navLink)}
          >
            <EyeFill className={cx("d-block", "d-lg-none", "rk-icon-md")} />
            Overview
          </RenkuNavLinkV2>
        </NavItem>
        <NavItem
          className={cx(
            "mb-0",
            "mb-lg-3",
            "py-3",
            "py-lg-0",
            "d-flex",
            "d-lg-none"
          )}
        >
          <RenkuNavLinkV2
            end
            to={projectInfoUrl}
            title="Project Information"
            className={cx(navLinkClasses, styles.navLink)}
          >
            <Folder2Open className="rk-icon-md" />
            Project Info
          </RenkuNavLinkV2>
        </NavItem>
        <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0", "d-flex")}>
          <RenkuNavLinkV2
            end
            to={projectSettingsUrl}
            title="Settings"
            className={cx(
              navLinkClasses,
              selectedContent === ProjectPageContentType.Settings && "active",
              styles.navLink
            )}
          >
            <PencilSquare
              className={cx("d-block", "d-lg-none", "rk-icon-md")}
            />
            Settings
          </RenkuNavLinkV2>
        </NavItem>
      </Nav>
      {selectedContent === ProjectPageContentType.Settings && (
        <Nav className="d-none d-lg-flex">
          <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0")}>
            <NavLink
              href="#general"
              className={cx(
                navLinkClasses,
                "mb-2",
                "ps-2",
                "ms-2",
                styles.navLink
              )}
            >
              General
            </NavLink>
          </NavItem>
          <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0")}>
            <NavLink
              href="#members"
              className={cx(
                navLinkClasses,
                "mb-2",
                "ms-2",
                "ps-2",
                styles.navLink
              )}
            >
              Members
            </NavLink>
          </NavItem>
          <AccessGuard
            disabled={null}
            enabled={
              <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0")}>
                <NavLink
                  href="#delete"
                  className={cx(
                    navLinkClasses,
                    "mb-2",
                    "ms-2",
                    "ps-2",
                    styles.navLink
                  )}
                >
                  Delete
                </NavLink>
              </NavItem>
            }
            role={userRole}
          />
        </Nav>
      )}
    </>
  );
}
