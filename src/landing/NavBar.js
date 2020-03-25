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

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons/";

import logo from "./logo.svg";
import { ExternalDocsLink, Loader, RenkuNavLink, UserAvatar } from "../utils/UIComponents";
import { getActiveProjectPathWithNamespace } from "../utils/HelperFunctions";
import QuickNav from "../utils/quicknav";

import "./NavBar.css";


class RenkuNavBar extends Component {
  render() {
    const { user } = this.props;
    const userAvatar = <UserAvatar person={user.data} size="sm" />;

    return (user.logged) ?
      <LoggedInNavBar {...this.props} userAvatar={userAvatar} /> :
      <AnonymousNavBar {...this.props} userAvatar={userAvatar} />;
  }
}

class RenkuToolbarItemUser extends Component {
  render() {
    const { user } = this.props;
    const gatewayURL = this.props.params.GATEWAY_URL;
    const redirect_url = encodeURIComponent(this.props.params.BASE_URL);
    if (!user.fetched)
      return <Loader size="16" inline="true" />;

    else if (!user.data.id)
      return <RenkuNavLink to="/login" title="Login" previous={this.props.location.pathname} />;


    return <li className="nav-item dropdown">
      { /* eslint-disable-next-line */ }
      <a key="button" className="nav-link dropdown-toggle" id="profile-dropdown" role="button"
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {this.props.userAvatar}
      </a>
      <div key="menu" className="dropdown-menu dropdown-menu-right" aria-labelledby="profile-dropdown">
        <a className="dropdown-item" target="_blank" rel="noreferrer noopener"
          href={`${gatewayURL}/auth/user-profile`}>Profile</a>
        <Link className="dropdown-item" to="/help">Help</Link>
        <a id="logout-link" className="dropdown-item"
          href={`${gatewayURL}/auth/logout?redirect_url=${redirect_url}`}>Logout</a>
      </div>
    </li>;

  }
}

class RenkuToolbarItemPlus extends Component {
  render() {
    // Display the Issue/Notebook server related header options only if a project is active.
    const activeProjectPathWithNamespace = getActiveProjectPathWithNamespace(this.props.currentPath);
    const issueDropdown = activeProjectPathWithNamespace ?
      <Link className="dropdown-item" to={`/projects/${activeProjectPathWithNamespace}/collaboration/issues/issue_new`}>
        Issue
      </Link>
      : null;
    const datasetDropdown = activeProjectPathWithNamespace ?
      <Link className="dropdown-item" to={`/projects/${activeProjectPathWithNamespace}/datasets/new`}>
        Dataset
      </Link>
      : null;
    const projectDropdown = <Link className="dropdown-item" id="navbar-project-new" to="/project_new">
      Project
    </Link>;

    return <li className="nav-item dropdown">
      { /* eslint-disable-next-line */}
      <a className="nav-link dropdown-toggle" id="plus-dropdown" role="button"
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <FontAwesomeIcon icon={faPlus} id="createPlus" />
      </a>
      <div key="plus-menu" className="dropdown-menu dropdown-menu-right" aria-labelledby="plus-dropdown">
        {projectDropdown}
        {issueDropdown}
        {datasetDropdown}
      </div>
    </li>;
  }
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
    // TODO If there is is an active project, show it in the navbar
    return (
      <header>
        <nav className="navbar navbar-expand-sm navbar-light bg-light justify-content-between">
          <span className="navbar-brand">
            <Link to="/"><img src={logo} alt="Renku" height="24" /></Link>
          </span>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <QuickNav client={this.props.client} model={this.props.model} />

            <ul className="navbar-nav mr-auto">
              <RenkuNavLink to="/projects" title="Projects" />
              <RenkuNavLink to="/datasets" title="Datasets" />
              <RenkuNavLink to="/environments" title="Environments" />
            </ul>

            <ul className="navbar-nav">
              <RenkuToolbarItemPlus currentPath={this.props.location.pathname}/>
              <RenkuToolbarItemUser {...this.props} />
            </ul>
          </div>
        </nav>
      </header>
    );
  }
}

class AnonymousNavBar extends Component {

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
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <QuickNav client={this.props.client} model={this.props.model} />

            <ul className="navbar-nav mr-auto">
              <RenkuNavLink to="/projects" title="Projects" />
              <RenkuNavLink to="/datasets" title="Datasets" />
            </ul>
            <ul className="navbar-nav">
              <RenkuToolbarItemUser {...this.props} />
            </ul>
          </div>
        </nav>
      </header>
    );
  }
}

class FooterNavbar extends Component {
  render() {
    return (
      <footer className="footer">
        <Navbar className="flex-nowrap">
          <span>&copy; SDSC {(new Date()).getFullYear()}</span>
          <Nav className="ml-auto">
            <Link className="nav-link" to="/">
              <img src={logo} alt="Renku" height="21" />
            </Link>
          </Nav>
          <Nav className="ml-auto">
            <RenkuNavLink to="/help" title="Help" />
            <ExternalDocsLink url="https://renku.discourse.group" title="Forum" alignment="nav-link"/>
            <ExternalDocsLink url="https://gitter.im/SwissDataScienceCenter/renku" title="Gitter" alignment="nav-link"/>
            <ExternalDocsLink url="https://datascience.ch/who-we-are" title="About" alignment="nav-link"/>
          </Nav>
        </Navbar>
      </footer>
    );
  }
}

export { RenkuNavBar, FooterNavbar };
