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
  PlusCircle,
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
  NavbarToggler,
} from "reactstrap";

import { ExternalDocsLink } from "../../components/ExternalLinks";
import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import { RenkuToolbarItemUser } from "../../components/navbar/NavBarItems";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { Links } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import BackToV1Button from "../projectsV2/shared/BackToV1Button";
import WipBadge from "../projectsV2/shared/WipBadge";
import StatusBanner from "../platform/components/StatusBanner";

const RENKU_ALPHA_LOGO = "/static/public/img/logo-yellow.svg";

function NavbarItemPlus() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <Dropdown isOpen={isOpen} toggle={toggleOpen} className="nav-item">
      <DropdownToggle nav className={cx("nav-link", "fs-5")} id="plus-dropdown">
        <PlusCircle className="bi" id="createPlus" />
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
      <DropdownToggle nav className={cx("nav-link", "fs-5")}>
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
    ABSOLUTE_ROUTES.v2.projects.show.sessions.show
  );

  if (matchesShowSessionPage) {
    return null;
  }

  return (
    <>
      <header
        className={cx("navbar-expand-lg", "text-body", "bg-body")}
        data-bs-theme="navy"
      >
        <div className={cx("navbar", "px-2", "px-sm-3", "py-2")}>
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-wrap",
              "gap-3",
              "text-white"
            )}
          >
            <RenkuNavLinkV2
              id="link-home"
              data-cy="link-home"
              to={ABSOLUTE_ROUTES.v2.root}
            >
              <img src={RENKU_ALPHA_LOGO} alt="Renku v2 (beta)" height="50" />
            </RenkuNavLinkV2>
            <WipBadge>2.0 Beta</WipBadge>
            <BackToV1Button outline={true} />
          </div>
          <NavbarToggler onClick={onToggle} className="border-0">
            <List className={cx("bi", "text-rk-white")} />
          </NavbarToggler>
          <Collapse isOpen={isOpen} navbar>
            <Nav
              className={cx(
                "align-items-center",
                "flex-row",
                "gap-3",
                "gap-lg-0",
                "justify-content-end",
                "ms-lg-auto"
              )}
              navbar
            >
              <NavItem>
                <RenkuNavLinkV2
                  end
                  to={ABSOLUTE_ROUTES.v2.search}
                  title="Search"
                >
                  <Search className="bi" /> Search
                </RenkuNavLinkV2>
              </NavItem>
              <NavItem>
                <RenkuNavLinkV2
                  end
                  to={ABSOLUTE_ROUTES.v2.root}
                  title="Dashboard"
                >
                  Dashboard
                </RenkuNavLinkV2>
              </NavItem>
              <NavItem>
                <NavbarItemPlus />
              </NavItem>
              <NavItem>
                <NavbarItemHelp />
              </NavItem>
              <NavItem>
                <RenkuToolbarItemUser params={params!} />
              </NavItem>
            </Nav>
          </Collapse>
        </div>
      </header>
      <StatusBanner params={params} />
    </>
  );
}
