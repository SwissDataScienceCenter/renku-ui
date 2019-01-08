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

import React, { Component } from 'react';
import { Link }  from 'react-router-dom'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'

import logo from './logo.svg';
import { RenkuNavLink } from '../utils/UIComponents'
import { getActiveProjectId } from '../utils/HelperFunctions'
import QuickNav from '../utils/quicknav'


class RenkuToolbarItemUser extends Component {
  render() {
    const gatewayURL = this.props.params.GATEWAY_URL;
    const redirect_url =  encodeURIComponent(this.props.params.BASE_URL);
    if (!this.props.user) {
      return <RenkuNavLink to="/login" title="Login" />
    }
    else {
      return <li className="nav-item dropdown">
        { /* eslint-disable-next-line */ }
        <a key="button" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
          aria-haspopup="true" aria-expanded="false">
          {this.props.userAvatar}
        </a>
        <div key="menu" className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
          <a className="dropdown-item" href="/auth/realms/Renku/account?referrer=renku-ui">Profile</a>
          <a
            className="dropdown-item"
            href={`${gatewayURL}/auth/logout?redirect_url=${redirect_url}`}
          >Logout</a>
        </div>
      </li>
    }
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
    switch(eventKey) {
    case 'new.projects':
      nextRoute = '/projects';
      break;
    default:
      break;
    }
    if (null != nextRoute) this.props.history.push(nextRoute);
  }
  render() {
    // Display the Ku/Notebook server related header options only if a project is active.
    const activeProjectId = getActiveProjectId(this.props.location.pathname);
    const kuDropdown = activeProjectId ? <RenkuNavLink to={`/projects/${activeProjectId}/ku_new`} title="Ku" /> : null;
    const jupyterDropdown = activeProjectId ? <RenkuNavLink to={`/projects/${activeProjectId}/launchNotebook`}
      title="Launch Jupyter" /> : null;
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
            <QuickNav user={this.props.user} client={this.props.client}/>

            <ul className="navbar-nav mr-auto">
              <RenkuNavLink to="/projects" title="Projects"/>
              <RenkuNavLink to="/notebooks" title="Notebooks"/>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                { /* eslint-disable-next-line */ }
                <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                  aria-haspopup="true" aria-expanded="false">
                  <FontAwesomeIcon icon={faPlus} id="createPlus"/>
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  <RenkuNavLink to="/project_new" title="Project" />
                  {kuDropdown}
                  {jupyterDropdown}
                </div>
              </li>
              <RenkuToolbarItemUser {...this.props} />
            </ul>
          </div>
        </nav>
      </header>
    )
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
            <ul className="navbar-nav ml-auto">
              <RenkuToolbarItemUser {...this.props} />
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}

export { LoggedInNavBar, AnonymousNavBar }
