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
import { Link, useLocation, useMatch } from "react-router";
import {
  Collapse,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavbarToggler,
  NavItem,
} from "reactstrap";

import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import { ExternalLink } from "../../components/LegacyExternalLinks";
import { RenkuToolbarItemUser } from "../../components/navbar/NavBarItems";
import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { Links } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import useLocationHash from "../../utils/customHooks/useLocationHash.hook";
import { GROUP_CREATION_HASH } from "../groupsV2/new/createGroup.constants";
import StatusBanner from "../platform/components/StatusBanner";
import { PROJECT_CREATION_HASH } from "../projectsV2/new/createProjectV2.constants";
import { useGetUserQueryState } from "../usersV2/api/users.api";

const RENKU_LOGO = "/static/public/img/logo.svg";

function NavbarItemPlus() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  const [, setHash] = useLocationHash();
  const toggleNewProject = useCallback(() => {
    setHash(PROJECT_CREATION_HASH);
  }, [setHash]);
  const toggleNewGroup = useCallback(() => {
    setHash(GROUP_CREATION_HASH);
  }, [setHash]);

  return (
    <Dropdown isOpen={isOpen} toggle={toggleOpen} className="nav-item">
      <DropdownToggle
        nav
        className={cx("nav-link", "fs-3")}
        data-cy="navbar-new-entity"
        id="plus-dropdown"
      >
        <PlusCircle className="bi" id="createPlus" />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem data-cy="navbar-project-new" onClick={toggleNewProject}>
          Project
        </DropdownItem>
        <DropdownItem data-cy="navbar-group-new" onClick={toggleNewGroup}>
          Group
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function NavbarItemHelp() {
  const { params } = useContext(AppContext);
  const privacyPolicyConfigured =
    params?.TERMS_PAGES_ENABLED ?? DEFAULT_APP_PARAMS.TERMS_PAGES_ENABLED;

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <Dropdown
      data-cy="help-dropdown"
      isOpen={isOpen}
      toggle={toggleOpen}
      className="nav-item"
    >
      <DropdownToggle nav className={cx("nav-link", "fs-3")}>
        <QuestionCircle className="bi" id="helpDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu>
        <Link
          data-cy="help-link"
          className="dropdown-item"
          to={ABSOLUTE_ROUTES.v2.help.root}
        >
          Help
        </Link>
        {privacyPolicyConfigured && (
          <Link
            data-cy="privacy-policy-link"
            className="dropdown-item"
            to={ABSOLUTE_ROUTES.v2.help.privacy}
          >
            Privacy Policy
          </Link>
        )}
        <DropdownItem divider />
        <ExternalLink
          className="dropdown-item"
          role="link"
          title="Forum"
          url={Links.DISCOURSE}
        />
        <ExternalLink
          className="dropdown-item"
          role="link"
          title="Gitter"
          url={Links.GITTER}
        />
        <ExternalLink
          className="dropdown-item"
          role="link"
          title="GitHub"
          url={Links.GITHUB}
        />
      </DropdownMenu>
    </Dropdown>
  );
}

export default function NavbarV2() {
  const { pathname } = useLocation();
  const { data: user } = useGetUserQueryState();

  const [isOpen, setIsOpen] = useState(false);
  const { params } = useContext(AppContext);

  const onToggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const matchesShowSessionPage = useMatch(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.show
  );

  if (
    (!user?.isLoggedIn && pathname === ABSOLUTE_ROUTES.root) ||
    matchesShowSessionPage
  ) {
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
              <img src={RENKU_LOGO} alt="Renku" height="50" />
            </RenkuNavLinkV2>
          </div>
          <div className="ms-auto">
            <NavbarToggler onClick={onToggle} className={cx("border-0", "p-2")}>
              <List className="bi" />
            </NavbarToggler>
          </div>
          <Collapse isOpen={isOpen} navbar>
            <Nav
              className={cx(
                "align-items-center",
                "flex-row",
                "gap-3",
                "gap-lg-0",
                "justify-content-end",
                "ms-lg-auto",
                "pe-2",
                "pe-lg-0"
              )}
              navbar
            >
              <NavItem>
                <RenkuNavLinkV2
                  data-cy="navbar-link-search"
                  end
                  title="Search"
                  to={ABSOLUTE_ROUTES.v2.search}
                >
                  <Search className="bi" /> Search
                </RenkuNavLinkV2>
              </NavItem>
              <NavItem>
                <RenkuNavLinkV2
                  data-cy="navbar-link-dashboard"
                  end
                  title="Dashboard"
                  to={ABSOLUTE_ROUTES.v2.root}
                >
                  {user?.isLoggedIn ? "Dashboard" : "Home"}
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
