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
import { EyeFill, GearFill } from "react-bootstrap-icons";
import { generatePath } from "react-router-dom-v5-compat";
import { Nav, NavItem } from "reactstrap";

import RenkuNavLinkV2 from "../../../components/RenkuNavLinkV2";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type { Project } from "../../projectsV2/api/projectV2.api";

export default function ProjectPageNav({ project }: { project: Project }) {
  const { namespace = "", slug = "" } = project;
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace,
    slug,
  });
  const projectSettingsUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.settings,
    {
      namespace,
      slug,
    }
  );

  return (
    <>
      <Nav tabs>
        <NavItem>
          <RenkuNavLinkV2 end to={projectUrl} title="Overview">
            <EyeFill className={cx("me-2", "text-icon")} />
            Overview
          </RenkuNavLinkV2>
        </NavItem>
        <NavItem>
          <RenkuNavLinkV2 end to={projectSettingsUrl} title="Settings">
            <GearFill className={cx("me-2", "text-icon")} />
            Settings
          </RenkuNavLinkV2>
        </NavItem>
      </Nav>
    </>
  );
}
