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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  Navbar,
  NavbarToggler,
  UncontrolledDropdown,
} from "reactstrap";
import { RenkuNavLink } from "../RenkuNavLink";
// import { StatuspageBanner } from "../../statuspage";
// import { NavBarWarnings } from "../../landing/NavBarWarnings";
import {
  faBars,
  faPlus,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useState } from "react";
import {
  Plus,
  PlusLg,
  Search,
  Github,
  QuestionCircle,
} from "react-bootstrap-icons";
import {
  getActiveProjectPathWithNamespace,
  gitLabUrlFromProfileUrl,
} from "../../utils/helpers/HelperFunctions";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import { ExternalDocsLink, ExternalLink } from "../ExternalLinks";
import { RootStateOrAny, useSelector } from "react-redux";
import { User } from "../../model/RenkuModels";
import { Docs, Links, RenkuPythonDocs } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import { NotificationsMenu } from "../../notifications";

const logo = "/static/public/img/logo.svg";

export default function LoggedInNavBar() {
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
            to="/"
            className="navbar-brand me-2 pb-0 pt-0"
          >
            <img src={logo} alt="Renku" height="50" className="d-block" />
          </Link>
          <NavbarToggler onClick={onToggle} className="border-0">
            <FontAwesomeIcon icon={faBars} id="userIcon" color="white" />
          </NavbarToggler>
          <Collapse isOpen={isOpen} navbar className="">
            <Nav className="navbar-nav flex-row flex-nowrap ms-lg-auto">
              <NavItem className="nav-item col-4 col-lg-auto pe-lg-4">
                <RenkuNavLink
                  to="/search"
                  title="Search"
                  id="link-search"
                  icon={<Search />}
                  className="d-flex gap-2 align-items-center"
                />
              </NavItem>
              <NavItem
                id="link-dashboard"
                data-cy="link-dashboard"
                to="/"
                className="nav-item col-4 col-lg-auto pe-lg-4"
              >
                <RenkuNavLink to="/" title="Dashboard" id="link-dashboard" />
              </NavItem>
              <NavItem className="nav-item col-1 col-lg-auto">
                <RenkuToolbarItemPlus />
              </NavItem>
              <NavItem className="nav-item col-1 col-lg-auto">
                <RenkuToolbarGitLabMenu />
              </NavItem>
              <NavItem className="nav-item col-1 col-lg-auto">
                <RenkuToolbarHelpMenu />
              </NavItem>
              <NavItem className="nav-item col-1 col-lg-auto">
                <RenkuToolbarNotifications />
              </NavItem>
              {/*  <NavItem className="nav-item col-1 col-lg-auto">
                <RenkuToolbarItemUser {...this.props} />
              </NavItem> */}
            </Nav>
          </Collapse>
        </Navbar>
      </header>
      {/* <StatuspageBanner
        siteStatusUrl={Url.get(Url.pages.help.status)}
        model={this.props.model}
        location={this.props.location}
      />
      <NavBarWarnings
        model={this.props.model}
        uiShortSha={this.props.params["UI_SHORT_SHA"]}
      /> */}
    </>
  );
}

function RenkuToolbarItemPlus() {
  const location = useLocation();

  // Display the "new dataset" options only if a project is active.
  const activeProjectPathWithNamespace = getActiveProjectPathWithNamespace(
    location.pathname
  );
  const datasetDropdown = activeProjectPathWithNamespace ? (
    <DropdownItem className="p-0">
      <Link
        className="dropdown-item"
        id="navbar-dataset-new"
        to={`/projects/${activeProjectPathWithNamespace}/datasets/new`}
      >
        Dataset
      </Link>
    </DropdownItem>
  ) : null;
  const projectDropdown = (
    <DropdownItem className="p-0">
      <Link
        className="dropdown-item"
        id="navbar-project-new"
        to="/projects/new"
      >
        Project
      </Link>
    </DropdownItem>
  );

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret id="plus-dropdown">
        <FontAwesomeIcon icon={faPlus} id="createPlus" />
      </DropdownToggle>
      <DropdownMenu
        aria-labelledby="plus-menu"
        className="plus-menu btn-with-menu-options"
        end
      >
        {projectDropdown}
        {datasetDropdown}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

function RenkuToolbarGitLabMenu() {
  const user = useSelector<RootStateOrAny, User>(
    (state) => state.stateModel.user
  );

  if (!user.fetched) {
    return null;
  }

  const userData = user.data as
    | {
        id: string;
        web_url: string;
      }
    | { id: null };
  if (!userData.id) {
    return null;
  }

  const gitLabUrl = gitLabUrlFromProfileUrl(userData.web_url);

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret id="gitLab-menu">
        <FontAwesomeIcon icon={faGitlab} id="gitLabDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu
        className="gitLab-menu btn-with-menu-options"
        end
        key="gitLab-bar"
        aria-labelledby="gitLab-menu"
      >
        <DropdownItem className="p-0">
          <ExternalLink
            url={gitLabUrl}
            title="GitLab"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalLink
            url={gitLabSettingsUrlFromProfileUrl(userData.web_url)}
            title="Settings"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalLink
            url={userData.web_url}
            title="Profile"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

function gitLabSettingsUrlFromProfileUrl(webUrl: string): string {
  // Yes, the settings URL ends with 'profile'; the profile URL ends with the username
  const comps = webUrl.split("/");
  comps.pop();
  comps.push("-/profile");
  return comps.join("/");
}

function RenkuToolbarHelpMenu() {
  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret>
        <QuestionCircle className="bi" id="helpDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu
        className="help-menu btn-with-menu-options"
        key="help-bar"
        aria-labelledby="help-menu"
      >
        <DropdownItem className="p-0">
          <Link className="dropdown-item" to="/help">
            Help
          </Link>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Docs.READ_THE_DOCS_ROOT}
            title="Renku Docs"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
            title="Renku CLI Docs"
            className="dropdown-item"
          />
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
    </UncontrolledDropdown>
  );
}

function RenkuToolbarNotifications() {
  const ctx = useContext(AppContext);
  const { model, notifications } = ctx;

  console.log(ctx);

  if (model == null || notifications == null) {
    return null;
  }

  // if (!props.notifications) return null;

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <NotificationsMenu model={model} notifications={notifications} />
    </UncontrolledDropdown>
  );
}
