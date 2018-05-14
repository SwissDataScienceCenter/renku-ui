
/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  App.js
 *  Coordinator for the application.
 */

import React, { Component } from 'react';
import './App.css';
import logo from './logo.svg';

import { BrowserRouter as Router, Route, Switch, Link, Redirect }  from 'react-router-dom'
// import { IndexLinkContainer } from 'react-router-bootstrap';
// import { FormGroup, FormControl, InputGroup } from 'react-bootstrap'
// import { MenuItem, Nav, Navbar, NavItem, NavDropdown } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

// import About from './About'
// import Landing from './Landing'
import Project from './project/Project'
import Ku from './ku/Ku'
import Landing from './landing/Landing'
import Login from './login'
import { RenkuNavLink, UserAvatar } from './utils/UIComponents'
// import Lineage from './lineage'


function getActiveProjectId(currentPath) {
  try {
    return currentPath.match(/\/projects\/(\d+)/)[0].replace('/projects/', '')
  } catch(TypeError) {
    return null
  }
}

class RenkuNavBar extends Component {

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
    const userState = this.props.userState.getState();
    const loggedIn =  Object.keys(userState.user || {}).length > 0;

    // Display the Ku related header options only if a project is active.
    const activeProjectId = getActiveProjectId(this.props.location.pathname);
    const kuDropdown = activeProjectId ? <RenkuNavLink to={`/projects/${activeProjectId}/ku_new`} title="Ku" /> : null;
    // TODO If there is is an active project, show it in the navbar

    return (
      <header>
        <nav className="navbar navbar-expand-sm navbar-light bg-light justify-content-between">
          <span className="navbar-brand"><Link to="/"><img src={logo} alt="Renku" height="24" /></Link></span>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <form className="form-inline my-2 my-lg-0">
              <div className="input-group">
                <input className="form-control border-primary" type="search"
                  placeholder="Search Renku" aria-label="Search" />
                <span className="input-group-append">
                  <button className="btn btn-outline-primary my-2 my-sm-0" type="submit">
                    <FontAwesome name="search" />
                  </button>
                </span>
              </div>
            </form>

            <ul className="navbar-nav mr-auto">
              <RenkuNavLink to="/projects" title="Projects"/>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                  aria-haspopup="true" aria-expanded="false">
                  <FontAwesome name="plus" />
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  <RenkuNavLink to="/project_new" title="Project" />
                  {kuDropdown}
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                  aria-haspopup="true" aria-expanded="false">
                  {this.props.userAvatar}
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  {loggedIn ? <RenkuNavLink to="/user" title="Profile" /> : null }
                  {loggedIn ? <RenkuNavLink to="/logout" title="Logout" /> : <RenkuNavLink to="/login" title="Login" />}
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}

class RenkuFooter extends Component {
  render() {
    return <footer className="footer">
      <div className="container">
        <span className="text-muted">
          <a href="https://datascience.ch">&copy; SDSC {(new Date()).getFullYear()}</a>
        </span>
      </div>
    </footer>
  }
}

class App extends Component {
  render() {
    const userAvatar = <UserAvatar userState={this.props.userState} />
    return (
      <Router>
        <div>
          <Route render={props => <RenkuNavBar userAvatar={userAvatar} {...props} {...this.props}/>} />
          <main role="main" className="container-fluid">
            <div key="gap">&nbsp;</div>
            <Switch>

              {/* Route forces trailing slashes on routes ending with a numerical id */}
              <Route exact strict path="/*(\d+)" render={props => <Redirect to={`${props.location.pathname}/`}/>}/>
              <Route exact path="/logout"
                render={p => <Login.Logout key="logout" {...p} {...this.props} />} />
              <Route exact path="/login"  render = {
                p => <Login.Login key="login" {...p} {...this.props}/>} />
              <Route exact path="/login/redirect/gitlab"
                render={p => <Login.GitlabRedirect key="gitlabRedirect" {...p} {...this.props}/>} />
              <Route exact path="/"
                render={p => <Landing.Home key="landing" userState={this.props.userState} {...p} />} />
              <Route exact path="/projects"
                render={p => <Project.List key="projects" {...p} client={this.props.client} />} />

              {/*TODO: This route should be handled by <Route path="/projects/:id(\d+)" too. Until this is the
                 TODO: case, the ku_new route must be listed BEFORE the project one.   */}
              <Route exact path="/projects/:projectId(\d+)/ku_new"
                render={(p) => <Ku.New key="ku_new" client={this.props.client} {...p}/>}/>
              {/* pull out the underlying parts of the url and pass them to the project view */}
              <Route path="/projects/:id(\d+)"
                render={p => <Project.View key="project" id={p.match.params.id} {...p}
                  client={this.props.client} userState={this.props.userState} params={this.props.params}/>}/>
              <Route exact path="/project_new"
                render={(p) => <Project.New key="project_new" client={this.props.client} {...p}/> }/>
            </Switch>
          </main>
          <Route component={RenkuFooter} />
        </div>
      </Router>
    );
  }
}

export default App;
export { getActiveProjectId };
