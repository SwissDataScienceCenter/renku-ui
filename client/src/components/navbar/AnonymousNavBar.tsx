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

import { useCallback, useState } from "react";
import { List, Search } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { Collapse, Nav, NavItem, Navbar, NavbarToggler } from "reactstrap";
import { NavBarWarnings } from "../../landing/NavBarWarnings";
import { Url } from "../../utils/helpers/url";
import cx from "classnames";
import { RenkuNavLink } from "../RenkuNavLink";
import {
  RenkuToolbarHelpMenu,
  RenkuToolbarItemUser,
  RenkuToolbarNotifications,
} from "./NavBarItems";
import { RENKU_LOGO } from "./navbar.constans";
import type { AppParams } from "../../utils/context/appParams.types";

interface AnonymousNavBarProps {
  model: unknown;
  notifications: unknown;
  params: AppParams;
}

export default function AnonymousNavBar({
  model,
  notifications,
  params,
}: AnonymousNavBarProps) {
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
                <RenkuNavLink
                  to={Url.get(Url.pages.search)}
                  title="Search"
                  id="link-search"
                  icon={<Search />}
                  className="d-flex gap-2 align-items-center"
                />
              </NavItem>
              <NavItem className="nav-item col-12 col-sm-4 col-lg-auto pe-lg-4">
                <RenkuNavLink
                  to={Url.get(Url.pages.sessions)}
                  title="Sessions"
                  id="link-sessions"
                />
              </NavItem>
              <NavItem className="nav-item col-auto ms-sm-auto">
                <RenkuToolbarHelpMenu firstItem />
              </NavItem>
              <NavItem className="nav-item col-auto">
                <RenkuToolbarNotifications
                  model={model}
                  notifications={notifications}
                />
              </NavItem>
              <NavItem className="nav-item col-auto">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RenkuToolbarItemUser params={params as any} />
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </header>
      <NavBarWarnings model={model} uiShortSha={uiShortSha} />
    </>
  );
}
