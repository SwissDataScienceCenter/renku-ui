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
import { Nav, NavItem, NavLink } from "reactstrap";
import RenkuNavLinkV2 from "../../../components/RenkuNavLinkV2.tsx";
import { Url } from "../../../utils/helpers/url";
import { ProjectPageContentType } from "../ProjectPageContainer/ProjectPageContainer.tsx";
import styles from "./ProjectPageNav.module.scss";

export default function ProjectPageNav({
  namespace,
  slug,
  selectedContent,
}: {
  namespace: string | undefined;
  slug: string | undefined;
  selectedContent?: ProjectPageContentType;
}) {
  const projectUrl = Url.get(Url.pages.projectV2.show, { namespace, slug });
  const projectSettingsUrl = Url.get(Url.pages.projectV2.settings, {
    namespace,
    slug,
  });
  const projectInfoUrl = Url.get(Url.pages.projectV2.projectInfo, {
    namespace,
    slug,
  });

  return (
    <>
      <Nav justified className={cx("d-flex", "flex-row", "flex-lg-column")}>
        <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0", "d-flex")}>
          <RenkuNavLinkV2
            end
            to={projectUrl}
            title="Overview"
            className={cx(
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
              styles.navLink
            )}
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
            className={cx(
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
              styles.navLink
            )}
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
              href={"#general"}
              className={cx(
                "p-0",
                "mb-2",
                "ps-2",
                "ms-2",
                "text-center",
                "text-lg-start",
                "d-flex",
                "flex-column",
                "flex-lg-row",
                "align-items-center",
                "align-items-lg-start",
                "gap-2",
                "fs-small",
                styles.navLink
              )}
            >
              General
            </NavLink>
          </NavItem>
          <NavItem className={cx("mb-0", "mb-lg-3", "py-3", "py-lg-0")}>
            <NavLink
              href={"#delete"}
              className={cx(
                "p-0",
                "mb-2",
                "ms-2",
                "ps-2",
                "text-center",
                "text-lg-start",
                "d-flex",
                "flex-column",
                "flex-lg-row",
                "align-items-center",
                "align-items-lg-start",
                "gap-2",
                "fs-small",
                styles.navLink
              )}
            >
              Delete
            </NavLink>
          </NavItem>
        </Nav>
      )}
    </>
  );
}
