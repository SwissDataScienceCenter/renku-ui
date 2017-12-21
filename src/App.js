
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
 *  incubator-renga-ui
 *
 *  App.js
 *  Coordinator for the application.
 */

import React, { Component } from 'react';
import './App.css';
import logo from './logo.svg';

import { BrowserRouter as Router, Route, Switch, Link, NavLink as RRNavLink }  from 'react-router-dom'
import { NavLink } from 'reactstrap';
// import { IndexLinkContainer } from 'react-router-bootstrap';
// import { FormGroup, FormControl, InputGroup } from 'react-bootstrap'
// import { MenuItem, Nav, Navbar, NavItem, NavDropdown } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

// import About from './About'
// import Landing from './Landing'
import Dataset from './dataset/Dataset'

class RengaNavItem extends Component {
  render() {
    const to = this.props.to;
    const title = this.props.title;
    return <NavLink exact to={to} tag={RRNavLink}>{title}</NavLink>
  }
}

class RengaNavBar extends Component {

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
      case 'new.dataset':
        nextRoute = '/dataset';
        break;
      default:
        break;
    }
    if (null != nextRoute) this.props.history.push(nextRoute);
  }
  render() {
    return (
      <header>
        <nav className="navbar navbar-expand-sm navbar-light bg-light justify-content-between">
          <span className="navbar-brand"><Link to="/"><img src={logo} alt="Renga" height="24" /></Link></span>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <form className="form-inline my-2 my-lg-0">
              <div className="input-group">
                <input className="form-control" type="search" placeholder="Search RENGA" aria-label="Search" />
                <span className="input-group-btn">
                  <button className="btn btn-outline-primary my-2 my-sm-0" type="submit"><FontAwesome name="search" /></button>
                </span>
              </div>
            </form>

            <ul className="navbar-nav mr-auto">
              <RengaNavItem to="/" title="Timeline" />
              <RengaNavItem to="/kus" title="Kus" />
              <RengaNavItem to="/datasets" title="Datasets" />
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <FontAwesome name="plus" />
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  <a className="dropdown-item" href="/dataset_new">Dataset</a>
                  <a className="dropdown-item" href="/ku_new">Ku</a>
                </div>
              </li>
              <RengaNavItem to="/user" title={<FontAwesome name="user-circle" />} />
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}

class RengaFooter extends Component {
  render() {
    return <footer className="footer">
      <div className="container">
        <span className="text-muted"><a href="https://datascience.ch">&copy; SDSC 2017</a></span>
      </div>
    </footer>
  }
}

class Landing extends Component {
  render() {
    return (
      <div key="content">
        <h1>Renga Prototype UI</h1>
        <p className="lead">Welcome to the prototype UI for Renga</p>
        <p>This is a work in progress, but once you have the metadata server running, you can try out the following:</p>
        <ul>
          <li><Link to="/dataset_new">Create a new dataset (only URL/DOI references supported at the moment)</Link></li>
          <li><Link to="/datasets">List datasets</Link></li>
        </ul>
        And once you have created a dataset, you can view it from the list page. Naturally, these actions are available from the top menu bar as well.
      </div>)
  }
}

class App extends Component {
  render() {
    return (
      <Router>
          <div>
            <Route component={RengaNavBar} />
            <main role="main" className="container-fluid">
              <div key="gap">&nbsp;</div>
              <Switch>
                <Route exact path="/"
                  render={p => <Landing key="landing" {...p} />} />
                <Route exact path="/datasets"
                  render={p => <Dataset.List key="datasets" {...p} />} />
                <Route path="/dataset/:id"
                  render={p => <Dataset.View key="dataset" id={p.match.params.id} {...p} />} />
                <Route exact path="/dataset_new" component={Dataset.New} />
              </Switch>
            </main>
            <Route component={RengaFooter} />
          </div>
      </Router>
    );
  }
}

export default App;
