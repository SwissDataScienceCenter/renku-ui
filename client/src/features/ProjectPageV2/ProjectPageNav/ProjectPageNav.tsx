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
import { Nav, NavItem } from "reactstrap";
import RenkuNavLinkV2 from "../../../components/RenkuNavLinkV2.tsx";
import { Url } from "../../../utils/helpers/url";
import { ProjectPageContentType } from "../ProjectPageContainer/ProjectPageContainer.tsx";
import styles from "./ProjectPageNav.module.scss";
export default function ProjectPageNav({
  selectedContent,
  namespace,
  slug,
}: {
  selectedContent: ProjectPageContentType;
  namespace: string | undefined;
  slug: string | undefined;
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
    <Nav justified className={styles.ProjectPageNav}>
      <NavItem
        className={cx(
          styles.ProjectPageNavItem,
          selectedContent === ProjectPageContentType.Overview &&
            styles.ProjectPageNavItemActive
        )}
      >
        <RenkuNavLinkV2 end to={projectUrl} title="Overview">
          <EyeFill className={styles.ProjectNavIcon} />
          Overview
        </RenkuNavLinkV2>
      </NavItem>
      <NavItem
        className={cx(
          styles.ProjectInfoItem,
          styles.ProjectPageNavItem,
          selectedContent === ProjectPageContentType.ProjectInfo
            ? styles.ProjectPageNavItemActive
            : ""
        )}
      >
        <RenkuNavLinkV2 end to={projectInfoUrl} title="Project Information">
          <Folder2Open className={styles.ProjectNavIcon} />
          Project Info
        </RenkuNavLinkV2>
      </NavItem>
      <NavItem
        className={cx(
          styles.ProjectPageNavItem,
          selectedContent === ProjectPageContentType.Settings
            ? styles.ProjectPageNavItemActive
            : ""
        )}
      >
        <RenkuNavLinkV2 end to={projectSettingsUrl} title="Settings">
          <PencilSquare className={styles.ProjectNavIcon} />
          Settings
        </RenkuNavLinkV2>
      </NavItem>
    </Nav>
  );
}
