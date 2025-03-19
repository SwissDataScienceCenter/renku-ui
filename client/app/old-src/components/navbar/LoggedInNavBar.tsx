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
import { useCallback, useState } from "react";
import { List, Search } from "react-bootstrap-icons";
import { Link } from "@remix-run/react";
import { Collapse, Nav, NavItem, Navbar, NavbarToggler } from "reactstrap";
import StatusBanner from "../../features/platform/components/StatusBanner";
import { NavBarWarnings } from "../../landing/NavBarWarnings";
import { AppParams } from "../../utils/context/appParams.types";
import { Url } from "../../utils/helpers/url";
import RenkuNavLinkV2 from "../RenkuNavLinkV2";
import {
  RenkuToolbarGitLabMenu,
  RenkuToolbarHelpMenu,
  RenkuToolbarItemPlus,
  RenkuToolbarItemUser,
  RenkuToolbarNotifications,
} from "./NavBarItems";
import { RENKU_LOGO } from "./navbar.constans";

interface LoggedInNavBarProps {
  model: unknown;
  notifications: unknown;
  params: AppParams;
}

export default function LoggedInNavBar({
  model,
  notifications,
  params,
}: LoggedInNavBarProps) {
  const uiShortSha = params.UI_SHORT_SHA;

  const [isOpen, setIsOpen] = useState(false);

  const onToggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <>
      <header className="navbar navbar-expand-lg navbar-dark rk-navbar p-0">
        <Navbar
          color="primary"
          className="container-fluid flex-wrap flex-lg-nowrap renku-container"
        >
          <Link
            id="link-home"
            data-cy="link-home"
            to={Url.get(Url.pages.landing)}
            className="navbar-brand me-2 pb-0 pt-0"
          >
            <img src={RENKU_LOGO} alt="Renku" height="50" className="d-block" />
          </Link>
          <NavbarToggler onClick={onToggle} className="border-0">
            <List className="bi text-rk-white" />
          </NavbarToggler>
          <Collapse isOpen={isOpen} navbar className="">
            <Nav
              className={cx(
                "navbar-nav",
                "flex-row",
                "flex-wrap",
                "flex-sm-nowrap",
                "align-items-center",
                "ms-lg-auto"
              )}
            >
              <NavItem className="nav-item col-12 col-sm-4 col-lg-auto pe-lg-4">
                <RenkuNavLinkV2
                  className={cx("d-flex", "gap-2", "align-items-center")}
                  id="link-search"
                  to={Url.get(Url.pages.search)}
                >
                  <Search />
                  Search
                </RenkuNavLinkV2>
              </NavItem>
              <NavItem
                id="link-dashboard"
                data-cy="link-dashboard"
                className="nav-item col-12 col-sm-4 col-lg-auto pe-lg-4"
              >
                <RenkuNavLinkV2
                  id="link-dashboard"
                  to={Url.get(Url.pages.landing)}
                >
                  Dashboard
                </RenkuNavLinkV2>
              </NavItem>
              <NavItem className="nav-item col-auto ms-sm-auto">
                <RenkuToolbarItemPlus />
              </NavItem>
              <NavItem className="nav-item col-auto">
                <RenkuToolbarGitLabMenu />
              </NavItem>
              <NavItem className="nav-item col-auto">
                <RenkuToolbarHelpMenu />
              </NavItem>
              <NavItem className="nav-item col-auto">
                <RenkuToolbarNotifications
                  model={model}
                  notifications={notifications}
                />
              </NavItem>
              <NavItem className="nav-item col-auto">
                <RenkuToolbarItemUser params={params} />
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </header>
      <StatusBanner params={params} />
      <NavBarWarnings model={model} uiShortSha={uiShortSha} />
    </>
  );
}
