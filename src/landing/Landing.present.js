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
 *  incubator-renku-ui
 *
 *  Landing.present.js
 *  Presentational components.
 */



import React, { Component } from 'react';

import { Link }  from 'react-router-dom'

import { Nav, NavItem, NavLink } from 'reactstrap';
import { Row, Col } from 'reactstrap';

class Explore extends Component {
  render() {
    return (<div>
      <h1>Explore</h1>
      Here are some things we think you might like based on what you have been working on.
      You also have access to an advanced search here. (Coming soon)
    </div>
    )
  }
}

class YourNetwork extends Component {
  render() {
    return (<div>
      <h1>Your Network</h1>
      Here is some activity from your network. (Not yet implemented)
    </div>
    )
  }
}

class YourActivity extends Component {
  render() {
    return (<div>
      <h1>Your Activity</h1>
      This is what you have been working on.<br /><br />
      Not yet implemented, but in the meantime, take a look at <Link to="/projects">Projects</Link>.
    </div>
    )
  }
}

class ProjectListRow extends Component {

  render() {
    // TODO: Replace all paths with props to allow routing to be controlled at the top level
    const title = <Link to={`/projects/${this.props.id}`}>{this.props.path_with_namespace}</Link>
    return (
      <Row className="project-list-row">
        <Col md={9}>
          <p><b>{title}</b></p>
        </Col>
      </Row>
    );
  }
}

class Starred extends Component {
  render() {
    const projects = this.props.projects || [];
    const rows = projects.map(p => <ProjectListRow key={p.id} {...p} />);
    return (<div>
      <h1>Starred Projects</h1>
      These are the projects you have starred.<br /><br />
      {rows}
    </div>
    )
  }
}

class Welcome extends Component {
  render() {
    return (<div>
      <h1>Welcome</h1>
      Welcome to Renku!<br /><br />
    </div>
    )
  }
}

class LoggedInNav extends Component {
  render() {
    const selected = this.props.selected;
    return <Nav pills className={'nav-pills-underline'}>
      <NavItem>
        <NavLink href="#" active={selected === 'starred'}
          onClick={this.props.onStarred}>Starred</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="#" active={selected === 'your_activity'}
          onClick={this.props.onYourActivity}>Activity</NavLink>
      </NavItem>
      <NavItem><NavLink href="#" active={selected === 'your_network'}
        onClick={this.props.onYourNetwork}>Network</NavLink></NavItem>
      <NavItem><NavLink href="#" active={selected === 'explore'}
        onClick={this.props.onExplore}>Explore</NavLink></NavItem>
    </Nav>
  }
}

class AnonymousNav extends Component {
  render() {
    const selected = this.props.selected;
    return <Nav pills className={'nav-pills-underline'}>
      <NavItem>
        <NavLink href="#" active={selected === 'welcome'}
          onClick={this.props.onWelcome}>Welcome</NavLink>
      </NavItem>
      <NavItem><NavLink href="#" active={selected === 'explore'}
        onClick={this.props.onExplore}>Explore</NavLink></NavItem>
    </Nav>
  }
}

class Home extends Component {
  render() {
    let selected = this.props.ui.selected;
    let nav = null;
    // Make sure the selected tab is valid for the user
    if (this.props.user != null && this.props.user.id != null) {
      if (selected === 'welcome') selected = 'starred';
      nav = <LoggedInNav selected={selected}
        onStarred={this.props.onStarred}
        onYourActivity={this.props.onYourActivity}
        onYourNetwork={this.props.onYourNetwork}
        onExplore={this.props.onExplore} />
    } else {
      if (selected === 'your_network') selected = 'welcome';
      else if (selected === 'starred') selected = 'welcome';
      nav = <AnonymousNav selected={selected}
        onWelcome={this.props.onWelcome}
        onExplore={this.props.onExplore} />
    }
    // const visibleTab = <ProjectList {...this.props} />
    let visibleTab = <YourActivity />
    if (selected === 'your_network') visibleTab = <YourNetwork />
    if (selected === 'explore') visibleTab = <Explore />
    if (selected === 'starred') visibleTab = this.props.starred;
    if (selected === 'welcome') visibleTab = <Welcome />
    return [
      <Row key="nav">
        <Col md={12}>
          {nav}
        </Col>
      </Row>,
      <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>,
      <Row key="content">
        <Col md={12}>
          {visibleTab}
        </Col>
      </Row>
    ]
  }
}

export default { Home, Starred };
