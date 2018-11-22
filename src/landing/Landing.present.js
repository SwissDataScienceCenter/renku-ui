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
import ReactMarkdown from 'react-markdown';

import { Nav, NavItem, NavLink } from 'reactstrap';
import { Row, Col } from 'reactstrap';
import { Jumbotron } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faClone from '@fortawesome/fontawesome-free-solid/faClone';
import faCloudUp from '@fortawesome/fontawesome-free-solid/faCloudUploadAlt';
import faCodeBranch from '@fortawesome/fontawesome-free-solid/faCodeBranch';
import faHeart from '@fortawesome/fontawesome-free-solid/faHeart';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import faShield from '@fortawesome/fontawesome-free-solid/faShieldAlt';
import faUserFriends from '@fortawesome/fontawesome-free-solid/faUserFriends';

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

class RenkuIntroText extends Component {
  render() {
    return <ReactMarkdown key="readme" source={this.props.welcomePage} />
  }

}

class StarredEmptyProjects extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <RenkuIntroText welcomePage={this.props.welcomePage}/>
        <p>
          You are logged in, but you have not yet starred any projects.
          Starring a project declares your interest in it.
          If there is a project you work on or want to follow, you should find it in
          the <Link to={this.props.projectsUrl}>project listing</Link>, click on it to view, and star it.
        </p>
        <p>
          Alternatively, you can <Link to={this.props.projectNewUrl}>create a new project</Link>.
        </p>
      </Col>
    </Row>)
  }
}

class Starred extends Component {
  render() {
    const projects = this.props.projects || [];
    const projectsUrl = this.props.urlMap.projectsUrl;
    const rows = projects.map(p => <ProjectListRow key={p.id} projectsUrl={projectsUrl} {...p} />);
    if (rows.length > 0)
      return [
        <Row key="header">
          <Col md={3} lg={2}><h1>Starred</h1></Col>
        </Row>,
        <Row key="spacer"><Col md={8}>&nbsp;</Col></Row>,
        <Row key="projects"><Col md={8}>{rows}</Col></Row>
      ]
    else {
      const projectNewUrl = this.props.urlMap.projectNewUrl;
      return <StarredEmptyProjects projectsUrl={projectsUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />
    }
  }
}

class Welcome extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <RenkuIntroText welcomePage={this.props.welcomePage}/>
        {!this.props.loggedIn ? <p>You are not logged in, but you can still view public projects. If you wish to
            contribute to an existing project or create a new one, please <Link to="/login">log in.</Link></p> : null }
      </Col>
    </Row>)
  }
}

class RenkuProvidesHeader extends Component {
  render() {
    return <h3 className="text-primary">
      {this.props.title} <FontAwesomeIcon icon={this.props.icon} id={this.props.title.toLowerCase()}/>
    </h3>
  }
}

class AnonymousHome extends Component {
  render() {
    const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Suspendisse dolor justo, faucibus non lectus nec, dapibus feugiat orci.
    Aliquam iaculis eros vel interdum tincidunt. Sed consectetur sem nunc, laoreet cursus risus posuere eu.
    Integer a dictum ex, ut aliquam quam. Donec placerat pulvinar elit vitae viverra.
    Nulla facilisi. Nullam dictum lacus nulla, eget congue eros convallis nec.
    Etiam vehicula a sapien eget facilisis.`;

    return [
      <Row key="marquee">
        <Col>
          <Jumbotron className="bg-white text-secondary">
            <Row>
              <Col md={6}>
                <h1>RENKU</h1>
                <h2>Collaborative Data Science</h2>
              </Col>
            </Row>
          </Jumbotron>
        </Col>
      </Row>,
      <Row key="content-header">
        <Col>
          <h1 className="text-center">Renku Provides</h1>
        </Col>
      </Row>,
      <Row key="content-body">
        <Col md={6}>
          <RenkuProvidesHeader title="Reproducibility" icon={faClone} />
          <p className="mb-5">{loremIpsum}</p>

          <RenkuProvidesHeader title="Sharability" icon={faCloudUp} />
          <p className="mb-5">{loremIpsum}</p>

          <RenkuProvidesHeader title="Federation" icon={faUserFriends} />
          <p className="mb-5">{loremIpsum}</p>
        </Col>
        <Col md={6} className="mt-md-5">
          <RenkuProvidesHeader title="Reusability" icon={faCodeBranch} />
          <p className="mb-5">{loremIpsum}</p>

          <RenkuProvidesHeader title="Security" icon={faShield} />
          <p className="mb-5">{loremIpsum}</p>

          <RenkuProvidesHeader title="Discoverability" icon={faSearch} />
          <p className="mb-5">{loremIpsum}</p>
        </Col>
      </Row>,
      <Row key="closing">
        <Col>
          <h3><FontAwesomeIcon icon={faHeart} id="love"/></h3>
        </Col>
      </Row>
    ]
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

class LoggedInHome extends Component {
  render() {
    let selected = this.props.ui.selected;
    const urlMap = this.props.urlMap;
    const welcome = <Welcome {...this.props} />;
    const nav = <LoggedInNav selected={selected} urlMap={urlMap}
      onStarred={this.props.onStarred}
      onYourActivity={this.props.onYourActivity}
      onYourNetwork={this.props.onYourNetwork}
      onExplore={this.props.onExplore} />
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

class Home extends Component {
  render() {
    return (this.props.loggedIn) ? <LoggedInHome {...this.props} /> : <AnonymousHome {...this.props} />
  }
}

export default { Home, Starred };
