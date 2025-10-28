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
import { useCallback, useContext, useState } from "react";
import { List, Search } from "react-bootstrap-icons";
import { Link } from "react-router";
import {
  Badge,
  Collapse,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
} from "reactstrap";
import { NavBarWarnings } from "../../features/landing/components/NavBar/NavBarWarnings";
import StatusBanner from "../../features/platform/components/StatusBanner";
import SunsetV1Button from "../../features/projectsV2/shared/SunsetV1Button";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";
import RenkuNavLinkV2 from "../RenkuNavLinkV2";
import AnnounceV2Banner from "./AnnounceV2Banner";
import { RENKU_LOGO } from "./navbar.constants";
import {
  RenkuToolbarHelpMenu,
  RenkuToolbarItemUser,
  RenkuToolbarNotifications,
} from "./NavBarItems";

export default function AnonymousNavBar() {
  const { params, model, notifications } = useContext(AppContext);
  const uiShortSha = params?.UI_SHORT_SHA;

  const [isOpen, setIsOpen] = useState(false);

  const onToggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <>
      <header
        className={cx(
          "navbar",
          "navbar-expand-lg",
          "bg-navy",
          "rk-navbar",
          "p-0"
        )}
      >
        <Navbar
          color="primary"
          className={cx(
            "container",
            "flex-wrap",
            "flex-lg-nowrap",
            "renku-container"
          )}
        >
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-row",
              "gap-3",
              "me-3"
            )}
          >
            <Link
              id="link-home"
              to={ABSOLUTE_ROUTES.v1.root}
              className={cx("m-0", "navbar-brand", "p-0")}
            >
              <img
                src={RENKU_LOGO}
                alt="Renku"
                height="50"
                className="d-block"
              />
            </Link>
            <Badge color="warning">Legacy</Badge>
            <SunsetV1Button outline />
          </div>
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
                  to={ABSOLUTE_ROUTES.v1.search}
                >
                  <Search />
                  Search
                </RenkuNavLinkV2>
              </NavItem>
              <NavItem className="nav-item col-12 col-sm-4 col-lg-auto pe-lg-4">
                <RenkuNavLinkV2
                  id="link-sessions"
                  to={ABSOLUTE_ROUTES.v1.sessions}
                >
                  Sessions
                </RenkuNavLinkV2>
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
      <AnnounceV2Banner />
      <StatusBanner params={params} />
      <NavBarWarnings model={model} uiShortSha={uiShortSha} />
    </>
  );
}
