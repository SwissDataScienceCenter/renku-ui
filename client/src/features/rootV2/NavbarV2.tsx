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

import { Nav, NavItem, Navbar } from "reactstrap";
import WipBadge from "../projectsV2/shared/WipBadge";
import { RenkuNavLink } from "../../components/RenkuNavLink";
import cx from "classnames";

export default function NavbarV2() {
  return (
    <header className={cx("px-4", "bg-rk-blue")}>
      <Navbar>
        <div className={cx("text-white", "d-flex", "align-items-center")}>
          <span className="me-1">Renku 1.0</span>
          <WipBadge />
        </div>
        <Nav className="navbar-nav">
          <NavItem>
            <RenkuNavLink to="/v2/projects" title="Projects">
              Projects
            </RenkuNavLink>
          </NavItem>
        </Nav>
      </Navbar>
    </header>
  );
}
