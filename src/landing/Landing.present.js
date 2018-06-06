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
import { Table } from 'reactstrap';

import { ProjectListRow } from '../project/Project.present';

class Explore extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <h1>Explore</h1>
        <p>We are still working on this. When complete, you will be able to browse and search for projects.
          In the meantime, you can look at all <Link to={this.props.urlMap.projectsUrl}>Projects</Link>.</p>
      </Col>
    </Row>)
  }
}

class YourNetwork extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <h1>Your Network</h1>
        <p>Currently a placeholder, but here you will be able to see what is going on in your network.
        Until this functionality arrives, you can look at
        all <Link to={this.props.urlMap.projectsUrl}>Projects</Link>.</p>
      </Col>
    </Row>)
  }
}

class YourActivity extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <h1>Your Activity</h1>
        <p>What are you working on? What is going on in the projects you contribute to?<br /><br />
          These are the kinds of questions that will be answered here when this functionality is implemented.
          Until then, take a look at <Link to={this.props.urlMap.projectsUrl}>Projects</Link>.</p>
      </Col>
    </Row>)
  }
}


// NOTE: Not yet sure if the table or standard display is better.
// class ProjectTableRow extends Component {
//   render() {
//     const title = <Link to={`${this.props.projectsUrl}/${this.props.id}`}>{this.props.path_with_namespace}</Link>
//     return (<tr>
//       <td>{title}</td>
//       <td>{this.props.description}</td>
//       <td>{this.props.tag_list.join(', ')}</td>
//       <td><TimeCaption key="time-caption" time={this.props.last_activity_at} /></td>
//     </tr>);
//   }
// }
//
// class StarredTable extends Component {
//   render() {
//     const projects = this.props.projects || [];
//     const projectsUrl = this.props.urlMap.projectsUrl;
//     const rows = projects.map(p => <ProjectTableRow key={p.id} projectsUrl={projectsUrl} {...p} />);
//     return (<div>
//       <h1>Starred Projects</h1>
//       <br />
//       <Table>
//         <thead><tr><th>Project</th><th>Description</th><th>Tags</th><th>Last Activity</th></tr></thead>
//         <tbody>
//           {rows}
//         </tbody>
//       </Table>
//     </div>
//     )
//   }
// }

class Starred extends Component {
  render() {
    const projects = this.props.projects || [];
    const projectsUrl = this.props.urlMap.projectsUrl;
    const rows = projects.map(p => <ProjectListRow key={p.id} projectsUrl={projectsUrl} {...p} />);
    return [
      <Row key="header">
        <Col md={3} lg={2}><h1>Starred</h1></Col>
      </Row>,
      <Row key="spacer"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="projects"><Col md={8}>{rows}</Col></Row>
    ]
  }
}

class AnonymousWelcome extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <h1>Welcome to Renku!</h1>
        <p>Renku is software for collaborative data science.</p>
        <p>Here you can share code and data, discuss problems and solutions, and carry out data-science projects.
        </p>
        <p>You are not logged in, but you can still view public projects. If you wish to contribute to an existing
           project or create a new one, please <Link to="/login">log in.</Link></p>
      </Col>
    </Row>
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
    const urlMap = this.props.urlMap;
    let welcome = <AnonymousWelcome urlMap={urlMap} />;
    // Make sure the selected tab is valid for the user
    if (this.props.user != null && this.props.user.id != null) {
      if (selected === 'welcome') selected = 'starred';
      nav = <LoggedInNav selected={selected} urlMap={urlMap}
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
    let visibleTab = <YourActivity urlMap={urlMap} />
    if (selected === 'your_network') visibleTab = <YourNetwork urlMap={urlMap} />
    if (selected === 'explore') visibleTab = <Explore urlMap={urlMap} />
    if (selected === 'starred') visibleTab = this.props.starred;
    if (selected === 'welcome') visibleTab = welcome;
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
