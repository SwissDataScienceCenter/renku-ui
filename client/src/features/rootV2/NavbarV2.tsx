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
 * limitations under the License
 */

import cx from "classnames";
import { useMatch } from "react-router-dom-v5-compat";
import { Nav, NavItem, Navbar } from "reactstrap";

import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import WipBadge from "../projectsV2/shared/WipBadge";

export default function NavbarV2() {
  const matchesShowSessionPage = useMatch(
    "/v2/projects/:namespace/:slug/sessions/show/:session"
  );

  if (matchesShowSessionPage) {
    return null;
  }

  return (
    <header className={cx("px-4", "bg-rk-blue")}>
      <Navbar className="px-2">
        <div className={cx("text-white", "d-flex", "align-items-center")}>
          <span className="me-1">Renku 2.0</span>
          <WipBadge />
        </div>
        <Nav className={cx("flex-row", "gap-4")} navbar>
          <NavItem>
            <RenkuNavLinkV2 end to="search" title="Search">
              Search
            </RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="groups" title="Groups">
              Groups
            </RenkuNavLinkV2>
          </NavItem>
          <NavItem className="ms-2">
            <RenkuNavLinkV2 end to="projects" title="Projects">
              Projects
            </RenkuNavLinkV2>
          </NavItem>
        </Nav>
      </Navbar>
    </header>
  );
}
