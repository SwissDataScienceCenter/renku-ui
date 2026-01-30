/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { PersonCircle } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { LoginHelper } from "../../authentication";
import { useLoginUrl } from "../../authentication/useLoginUrl.hook";
import AdminDropdownItem from "../../features/landing/components/AdminDropdownItem.tsx";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import type { AppParams } from "../../utils/context/appParams.types";
import ExternalLink from "../ExternalLink.tsx";
import { Loader } from "../Loader";
import DropdownItemTag from "./DropdownItemTag.tsx";

interface RenkuToolbarItemUserProps {
  params: AppParams;
}

export function RenkuToolbarItemUser({ params }: RenkuToolbarItemUserProps) {
  const { data: user, isLoading: isLoadingUser } = useGetUserQueryState();

  const gatewayURL = params.GATEWAY_URL;
  const userAccountUrl = `${gatewayURL}/auth/user-profile`;
  const logoutURL = `${gatewayURL}/auth/logout?redirect_url=${encodeURIComponent(
    params.BASE_URL
  )}`;
  const loginUrl = useLoginUrl({ params });

  if (isLoadingUser) {
    return <Loader inline size={16} />;
  } else if (!user?.isLoggedIn) {
    return (
      <NavLink className="px-2" data-cy="navbar-login" href={loginUrl.href}>
        Login
      </NavLink>
    );
  }

  const userPageUrl = generatePath(ABSOLUTE_ROUTES.v2.users.show, {
    username: user?.isLoggedIn ? user.username : "",
  });

  return (
    <UncontrolledDropdown className={cx("nav-item", "dropdown")}>
      <DropdownToggle
        className={cx("nav-link", "fs-3")}
        data-cy="navbar-toggle-user-menu"
        id="profile-dropdown"
        nav
      >
        <PersonCircle className="bi" id="userIcon" />
      </DropdownToggle>
      <DropdownMenu
        aria-labelledby="user-menu"
        className={cx("user-menu", "btn-with-menu-options")}
        end
        key="user-bar"
      >
        <DropdownItemTag tag={Link} to={userPageUrl}>
          Profile
        </DropdownItemTag>

        <DropdownItemTag tag={ExternalLink} href={userAccountUrl}>
          Account
        </DropdownItemTag>

        <DropdownItemTag tag={Link} to={ABSOLUTE_ROUTES.v2.secrets}>
          User Secrets
        </DropdownItemTag>

        <DropdownItemTag tag={Link} to={ABSOLUTE_ROUTES.v2.integrations}>
          Integrations
        </DropdownItemTag>

        <AdminDropdownItem />

        <DropdownItem divider />

        <DropdownItemTag
          data-cy="navbar-logout"
          href={logoutURL}
          icon={null}
          id="logout-link"
          onClick={() => {
            LoginHelper.notifyLogout();
          }}
          tag={ExternalLink}
        >
          Logout
        </DropdownItemTag>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}
