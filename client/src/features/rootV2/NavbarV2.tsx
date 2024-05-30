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
import { useCallback, useContext, useState } from "react";
import {
  List,
  PlusCircleFill,
  QuestionCircle,
  Search,
} from "react-bootstrap-icons";
import { Link, useMatch } from "react-router-dom-v5-compat";
import {
  Collapse,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  Navbar,
  NavbarToggler,
} from "reactstrap";

import AppContext from "../../utils/context/appContext";
import { ExternalDocsLink } from "../../components/ExternalLinks";
import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import { RenkuToolbarItemUser } from "../../components/navbar/NavBarItems";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { Links } from "../../utils/constants/Docs";
import BackToV1Button from "../projectsV2/shared/BackToV1Button";
import WipBadge from "../projectsV2/shared/WipBadge";

const RENKU_ALPHA_LOGO = "/static/public/img/logo-yellow.svg";

function NavbarItemPlus() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <Dropdown isOpen={isOpen} toggle={toggleOpen} className="nav-item">
      <DropdownToggle
        className={cx("nav-link", "fs-5", "ps-sm-2", "pe-2")}
        nav
        caret
        id="plus-dropdown"
      >
        <PlusCircleFill className="bi" id="createPlus" />
      </DropdownToggle>
      <DropdownMenu
        aria-labelledby="plus-menu"
        className={cx("plus-menu", "btn-with-menu-options", "z-3")}
        end
      >
        <DropdownItem className="p-0">
          <Link
            className="dropdown-item"
            data-cy="navbar-project-new"
            to="/v2/projects/new"
          >
            Project
          </Link>
        </DropdownItem>
        <DropdownItem className="p-0">
          <Link
            className="dropdown-item"
            data-cy="navbar-group-new"
            to="/v2/groups/new"
          >
            Group
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function NavbarItemHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <Dropdown
      data-cy="help-dropdown"
      isOpen={isOpen}
      toggle={toggleOpen}
      className="nav-item"
    >
      <DropdownToggle
        className={cx("nav-link", "fs-5", "px-2", "ps-sm-2")}
        nav
        caret
      >
        <QuestionCircle className="bi" id="helpDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu
        className={cx("help-menu", "btn-with-menu-options")}
        key="help-bar"
        aria-labelledby="help-menu"
      >
        <DropdownItem className="p-0">
          <Link
            data-cy="help-link"
            className="dropdown-item"
            to={ABSOLUTE_ROUTES.v2.help.root}
          >
            Help
          </Link>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Links.DISCOURSE}
            title="Forum"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Links.GITTER}
            title="Gitter"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Links.GITHUB}
            title="GitHub"
            className="dropdown-item"
          />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default function NavbarV2() {
  const [isOpen, setIsOpen] = useState(false);
  const { params } = useContext(AppContext);

  const onToggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const matchesShowSessionPage = useMatch(
    "/v2/projects/:namespace/:slug/sessions/show/:session"
  );

  if (matchesShowSessionPage) {
    return null;
  }

  return (
    <header
      className={cx(
        "bg-rk-blue",
        "navbar",
        "navbar-expand-lg",
        "navbar-dark",
        "p-0",
        "rk-navbar"
      )}
    >
      <Navbar
        color="primary"
        className={cx(
          "container-fluid",
          "flex-wrap",
          "flex-lg-nowrap",
          "renku-container",
          "px-2"
        )}
      >
        <div
          className={cx(
            "text-white",
            "d-flex",
            "align-items-center",
            "flex-wrap",
            "gap-2"
          )}
        >
          <RenkuNavLinkV2
            id="link-home"
            data-cy="link-home"
            to="/v2/"
            className={cx("navbar-brand", "me-2", "pb-0", "pt-0")}
          >
            <img
              src={RENKU_ALPHA_LOGO}
              alt="Renku v2 (alpha)"
              className="pe-2"
              height="50"
            />
          </RenkuNavLinkV2>
          <WipBadge label="2.0 Alpha" />
          <BackToV1Button outline={true} />
        </div>
        <NavbarToggler onClick={onToggle} className="border-0">
          <List className={cx("bi", "text-rk-white")} />
        </NavbarToggler>
        <Collapse isOpen={isOpen} navbar>
          <Nav
            className={cx(
              "flex-row",
              "flex-wrap",
              "flex-sm-nowrap",
              "justify-content-end",
              "align-items-center",
              "ms-lg-auto"
            )}
            navbar
          >
            <NavItem className="me-3">
              <RenkuNavLinkV2 end to="search" title="Search">
                <Search className="bi" /> Search
              </RenkuNavLinkV2>
            </NavItem>
            <NavItem className="me-3">
              <RenkuNavLinkV2 end to="/v2/" title="Dashboard">
                Dashboard
              </RenkuNavLinkV2>
            </NavItem>
            <NavItem className={cx("me-2", "nav-item", "col-auto")}>
              <NavbarItemPlus />
            </NavItem>
            <NavItem className={cx("me-2", "nav-item", "col-auto")}>
              <NavbarItemHelp />
            </NavItem>
            <NavItem className={cx("nav-item", "col-auto")}>
              <RenkuToolbarItemUser params={params!} />
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </header>
  );
}
