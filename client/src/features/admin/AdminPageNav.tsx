/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { Nav, NavItem } from "reactstrap";

import RenkuNavLinkV2 from "~/components/RenkuNavLinkV2";
import { ADMIN_TABS } from "./adminTabs.constants";

interface AdminPageNavProps {
  className?: string;
}
export default function AdminPageNav({ className }: AdminPageNavProps) {
  return (
    <Nav className={cx(className)} data-cy="admin-page-navigation" tabs>
      {ADMIN_TABS.map(({ path, title, icon: Icon, dataCy }) => (
        <NavItem key={path}>
          <RenkuNavLinkV2 end to={path} title={title} data-cy={dataCy}>
            <Icon className="me-1" />
            {title}
          </RenkuNavLinkV2>
        </NavItem>
      ))}
    </Nav>
  );
}
