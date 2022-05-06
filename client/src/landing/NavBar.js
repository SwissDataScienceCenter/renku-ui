/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  landing/NavBar.js
 *  NavBar for logged-in and logged-out users.
 */

import React, { Component, Fragment } from "react";
import { Link, Route, Switch } from "react-router-dom";
import {
  UncontrolledDropdown, DropdownItem, Navbar, Nav, NavbarToggler, Collapse, NavItem, DropdownToggle, DropdownMenu
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBars } from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle, faUser } from "@fortawesome/free-regular-svg-icons";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";

import logo from "./logo.svg";
import { getActiveProjectPathWithNamespace, gitLabUrlFromProfileUrl } from "../utils/helpers/HelperFunctions";
import QuickNav from "../utils/components/quicknav";
import { Url } from "../utils/helpers/url";
import { NavBarWarnings } from "./NavBarWarnings";
import { NotificationsMenu } from "../notifications";
import { LoginHelper } from "../authentication";
import { StatuspageBanner } from "../statuspage";
import "./NavBar.css";
import { UserAvatar } from "../utils/components/Avatar";
import { ExternalDocsLink, ExternalLink } from "../utils/components/ExternalLinks";
import { RenkuNavLink } from "../utils/components/RenkuNavLink";
import { Loader } from "../utils/components/Loader";
import { Docs, Links, RenkuPythonDocs } from "../utils/constants/Docs";
import { useSelector } from "react-redux";


function RenkuNavBar(props) {

  const { user } = props;
  const userAvatar = <UserAvatar person={user.data} size="sm" />;
  const projectMetadata = useSelector((state) => state.stateModel.project?.metadata);
  const sessionShowUrl = Url.get(Url.pages.project.session.show, {
    namespace: projectMetadata["namespace"],
    path: projectMetadata["path"],
    server: ":server",
  });

  const menu = (user.logged) ?
    <LoggedInNavBar {...props} userAvatar={userAvatar} /> :
    <AnonymousNavBar {...props} userAvatar={userAvatar} />;


  return (
    <Switch key="mainNav">
      <Route path={sessionShowUrl} render={() => null} />
      <Route component={() => menu} />
    </Switch>);
}

function gitLabSettingsUrlFromProfileUrl(webUrl) {
  // Yes, the settings URL ends with 'profile'; the profile URL ends with the username
  const comps = webUrl.split("/");
  comps.pop();
  comps.push("-/profile");
  return comps.join("/");
}

class RenkuToolbarItemUser extends Component {
  render() {
    const { location, user } = this.props;
    const gatewayURL = this.props.params.GATEWAY_URL;
    const uiserverURL = this.props.params.UISERVER_URL;
    const redirect_url = encodeURIComponent(this.props.params.BASE_URL);
    if (!user.fetched) {
      return <Loader size="16" inline="true" />;
    }
    else if (!user.logged) {
      const to = Url.get(Url.pages.login.link, { pathname: location.pathname });
      return (<RenkuNavLink to={to} title="Login" />);
    }

    return <UncontrolledDropdown className="nav-item dropdown">
      <Fragment>
        <DropdownToggle className="nav-link" nav caret id="profile-dropdown">
          <FontAwesomeIcon icon={faUser} id="userIcon" />
        </DropdownToggle>
        <DropdownMenu className="user-menu btn-with-menu-options" end key="user-bar" aria-labelledby="user-menu">
          <DropdownItem className="p-0">
            <ExternalLink url={`${gatewayURL}/auth/user-profile`}
              title="Account" className="dropdown-item" role="link" />
          </DropdownItem>
          <DropdownItem divider />
          <a id="logout-link" className="dropdown-item" onClick={() => { LoginHelper.notifyLogout(); }}
            href={`${uiserverURL}/auth/logout?redirect_url=${redirect_url}`}>Logout</a>
        </DropdownMenu>
      </Fragment>
    </UncontrolledDropdown>;
  }
}

class RenkuToolbarItemPlus extends Component {
  render() {
    // Display the Issue/Notebook server related header options only if a project is active.
    const activeProjectPathWithNamespace = getActiveProjectPathWithNamespace(this.props.currentPath);
    const issueDropdown = activeProjectPathWithNamespace ?
      (
        <DropdownItem className="p-0">
          <Link className="dropdown-item" id="navbar-issue-new"
            to={`/projects/${activeProjectPathWithNamespace}/collaboration/issues/issue_new`}>
            Issue
          </Link>
        </DropdownItem>
      )
      : null;
    const datasetDropdown = activeProjectPathWithNamespace ?
      (
        <DropdownItem className="p-0">
          <Link className="dropdown-item" id="navbar-dataset-new"
            to={`/projects/${activeProjectPathWithNamespace}/datasets/new`}>
            Dataset
          </Link>
        </DropdownItem>
      )
      : null;
    const projectDropdown = (
      <DropdownItem className="p-0">
        <Link className="dropdown-item" id="navbar-project-new"
          to="/projects/new">
          Project
        </Link>
      </DropdownItem>
    );

    return <UncontrolledDropdown className="nav-item dropdown">
      <Fragment>
        <DropdownToggle className="nav-link" nav caret id="plus-dropdown">
          <FontAwesomeIcon icon={faPlus} id="createPlus" />
        </DropdownToggle>
        <DropdownMenu className="plus-menu btn-with-menu-options" end key="plus-bar" aria-labelledby="plus-menu">
          {projectDropdown}
          {issueDropdown}
          {datasetDropdown}
        </DropdownMenu>
      </Fragment>
    </UncontrolledDropdown>;
  }
}

function RenkuToolbarHelpMenu(props) {

  return <UncontrolledDropdown className="nav-item dropdown">
    <Fragment>
      <DropdownToggle className="nav-link" nav caret>
        <FontAwesomeIcon icon={faQuestionCircle} id="helpDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu className="help-menu btn-with-menu-options" key="help-bar" aria-labelledby="help-menu">
        <DropdownItem className="p-0">
          <Link className="dropdown-item" to="/help">Help</Link>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="p-0">
          <ExternalDocsLink url={Docs.READ_THE_DOCS_ROOT}
            title="Renku Docs" className="dropdown-item" />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
            title="Renku CLI Docs" className="dropdown-item" />
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="p-0">
          <ExternalDocsLink url={Links.DISCOURSE} title="Forum" className="dropdown-item" />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink url={Links.GITTER}
            title="Gitter" className="dropdown-item" />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink url={Links.GITHUB}
            title="GitHub" className="dropdown-item" />
        </DropdownItem>
      </DropdownMenu>
    </Fragment>
  </UncontrolledDropdown>;
}

function RenkuToolbarGitLabMenu(props) {
  const user = props.user;
  if (!user.fetched)
    return "";

  else if (!user.data.id)
    return "";

  const gitLabUrl = gitLabUrlFromProfileUrl(user.data.web_url);

  return <UncontrolledDropdown className="nav-item dropdown">
    <Fragment>
      <DropdownToggle className="nav-link" nav caret id="gitLab-menu">
        <FontAwesomeIcon icon={faGitlab} id="gitLabDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu className="gitLab-menu btn-with-menu-options" end key="gitLab-bar" aria-labelledby="gitLab-menu">
        <DropdownItem className="p-0">
          <ExternalLink url={gitLabUrl}
            title="GitLab" className="dropdown-item" role="link" />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalLink url={gitLabSettingsUrlFromProfileUrl(user.data.web_url)}
            title="Settings" className="dropdown-item" role="link" />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalLink url={user.data.web_url} title="Profile" className="dropdown-item" role="link" />
        </DropdownItem>
      </DropdownMenu>
    </Fragment>
  </UncontrolledDropdown>;
}

function RenkuToolbarNotifications(props) {
  if (!props.notifications)
    return null;

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <NotificationsMenu {...props} />
    </UncontrolledDropdown>
  );
}

class LoggedInNavBar extends Component {

  constructor(props) {
    super(props);
    this.onSelect = this.handleSelect.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: true
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleSelect(eventKey, event) {
    let nextRoute = null;
    switch (eventKey) {
      case "new.projects":
        nextRoute = "/projects";
        break;
      default:
        break;
    }
    if (null != nextRoute) this.props.history.push(nextRoute);
  }
  render() {
    return (
      <Fragment>
        <header className="navbar navbar-expand-lg navbar-dark rk-navbar p-0">
          <Navbar color="primary" className="container-fluid flex-wrap flex-lg-nowrap renku-container">
            <Link id="link-home" to="/" className="navbar-brand me-2 pb-0 pt-0">
              <img src={logo} alt="Renku" height="50" className="d-block" />
            </Link>
            <NavbarToggler onClick={this.toggle} className="border-0">
              <FontAwesomeIcon icon={faBars} id="userIcon" color="white" />
            </NavbarToggler>
            <QuickNav client={this.props.client} model={this.props.model} user={this.props.user} />
            <Collapse isOpen={!this.state.isOpen} navbar className="menu-right">
              <Nav className="navbar-nav flex-row flex-wrap ms-lg-auto">
                <NavItem className="nav-item col-4 col-lg-auto pe-lg-4">
                  <RenkuNavLink to="/sessions" title="Sessions" id="link-sessions" />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarItemPlus currentPath={this.props.location.pathname} />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarGitLabMenu user={this.props.user} />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarHelpMenu />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarNotifications {...this.props} />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarItemUser {...this.props} />
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </header>
        <StatuspageBanner siteStatusUrl={Url.get(Url.pages.help.status)}
          model={this.props.model}
          location={this.props.location} />
        <NavBarWarnings model={this.props.model} uiShortSha={this.props.params["UI_SHORT_SHA"]} />
      </Fragment>
    );
  }
}

class AnonymousNavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Fragment>
        <header className="navbar navbar-expand-lg navbar-dark rk-navbar p-0">
          <Navbar color="primary" className="container-fluid flex-wrap flex-lg-nowrap renku-container">
            <Link id="link-home" to="/" className="navbar-brand me-2 pb-0 pt-0">
              <img src={logo} alt="Renku" height="50" className="d-block" />
            </Link>
            <NavbarToggler onClick={this.toggle} className="border-0">
              <FontAwesomeIcon icon={faBars} id="userIcon" color="white" />
            </NavbarToggler>
            <QuickNav client={this.props.client} model={this.props.model} user={this.props.user} />
            <Collapse isOpen={!this.state.isOpen} navbar className="menu-right">
              <Nav className="navbar-nav flex-row flex-wrap ms-lg-auto">
                <NavItem className="nav-item col-4 col-lg-auto pe-4">
                  <RenkuNavLink to="/sessions" title="Sessions" id="link-sessions" />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarHelpMenu />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarNotifications {...this.props} />
                </NavItem>
                <NavItem className="nav-item col-1 col-lg-auto">
                  <RenkuToolbarItemUser {...this.props} />
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </header>
        <NavBarWarnings model={this.props.model} uiShortSha={this.props.params["UI_SHORT_SHA"]} />
      </Fragment>
    );
  }
}

class MaintenanceNavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
    };
  }

  render() {
    return (
      <header>
        <nav className="navbar navbar-expand-sm navbar-light bg-light justify-content-between">
          <span className="navbar-brand">
            <Link to="/"><img src={logo} alt="Renku" height="24" /></Link>
          </span>
          <button className="navbar-toggler mt-3" type="button" data-toggle="collapse"
            data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        </nav>
      </header>
    );
  }
}

function FooterNavbar({ params }) {

  const projectMetadata = useSelector((state) => state.stateModel.project?.metadata);
  const sessionShowUrl = Url.get(Url.pages.project.session.show, {
    namespace: projectMetadata["namespace"],
    path: projectMetadata["path"],
    server: ":server",
  });

  const privacyLink = params && params["PRIVACY_STATEMENT"] ?
    (<RenkuNavLink to="/privacy" title="Privacy" />) :
    null;
  const footer = (
    <footer className="footer">
      <Navbar className="container-fluid flex-wrap flex-lg-nowrap justify-content-between
        renku-container navbar bg-primary navbar-dark">
        <div>
          <span className="text-white-50">&copy; SDSC {(new Date()).getFullYear()}</span>
        </div>
        <div>
          <Nav className="ms-auto">
            <Link className="nav-link" to="/">
              <img src={logo} alt="Renku" className="pb-2" height="44" />
            </Link>
          </Nav>
        </div>
        <div className="d-none d-lg-inline">
          <Nav className="ms-auto">
            <RenkuNavLink to="/help" title="Help" />
            {privacyLink}
            <ExternalDocsLink url={Links.DISCOURSE} title="Forum" className="nav-link" />
            <ExternalDocsLink url={Links.GITTER}
              title="Gitter" className="nav-link" />
            <ExternalDocsLink url={`${Links.HOMEPAGE}/who-we-are`} title="About" className="nav-link" />
          </Nav>
        </div>
      </Navbar>
    </footer>
  );

  return (
    <Switch key="footerNav">
      <Route path={sessionShowUrl} render={() => null} />
      <Route component={() => footer} />
    </Switch>);
}

export { RenkuNavBar, FooterNavbar, MaintenanceNavBar };
export { RenkuToolbarHelpMenu, RenkuToolbarNotifications };
