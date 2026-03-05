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
import { Eye, Search, Sliders } from "react-bootstrap-icons";
import { Nav, NavItem } from "reactstrap";

import RenkuNavLinkV2 from "./RenkuNavLinkV2";

export interface PageNavOptions {
  overviewUrl: string;
  searchUrl: string;
  settingsUrl?: string;
}
export default function PageNav({ options }: { options: PageNavOptions }) {
  return (
    <>
      <Nav tabs>
        <NavItem>
          <RenkuNavLinkV2
            end
            to={options.overviewUrl}
            title="Overview"
            data-cy="group-overview-link"
          >
            <Eye className={cx("bi", "me-1")} />
            Overview
          </RenkuNavLinkV2>
        </NavItem>
        <NavItem>
          <RenkuNavLinkV2
            end
            to={options.searchUrl}
            title="Search"
            data-cy="group-search-link"
          >
            <Search className={cx("bi", "me-1")} />
            Search
          </RenkuNavLinkV2>
        </NavItem>
        {options.settingsUrl && (
          <NavItem>
            <RenkuNavLinkV2
              end
              to={options.settingsUrl}
              title="Settings"
              data-cy="group-settings-link"
            >
              <Sliders className={cx("bi", "me-1")} />
              Settings
            </RenkuNavLinkV2>
          </NavItem>
        )}
      </Nav>
    </>
  );
}
