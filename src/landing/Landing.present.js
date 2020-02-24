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
import { Link } from 'react-router-dom';
import { Row, Col, Jumbotron } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClone, faCloudUploadAlt as faCloudUp, faCodeBranch, faHeart, faSearch, faShieldAlt as faShield, faUserFriends
} from '@fortawesome/free-solid-svg-icons';

import { RenkuMarkdown, Loader } from '../utils/UIComponents';
import { ProjectListRow } from '../project';

function truncatedProjectListRows(projects, projectsUrl, moreUrl) {
  const maxProjectsRows = 5;
  const projectSlice = projects.slice(0, maxProjectsRows);
  const rows = projectSlice.map(p => <ProjectListRow key={p.id} projectsUrl={projectsUrl} {...p} />);
  const more = (projects.length > maxProjectsRows) ? <Link key="more" to={moreUrl}>more...</Link> : null;
  return [
    <Row key="projects"><Col style={{ overflowX: "auto" }}>{rows}</Col></Row>,
    more
  ]
}

class YourEmptyProjects extends Component {
  render() {
    return (<Row>
      <Col>
        <p>
          You are logged in, but you are not yet a member of any projects.

          If there is a project you work on, you should
          search for it in the <Link to={this.props.projectsSearchUrl}>project search</Link>, click on it to view,
          and fork it.
        </p>
        <p>
          Alternatively, you can <Link to={this.props.projectNewUrl}>create a new project</Link>.
        </p>
      </Col>
    </Row>)
  }
}

class YourProjects extends Component {
  render() {
    const projects = this.props.projects || [];
    const projectsUrl = this.props.urlMap.projectsUrl;
    const projectsSearchUrl = this.props.urlMap.projectsSearchUrl;
    let projectsComponent = null;
    if (this.props.loading) {
      projectsComponent = <Loader key="loader" />;
    }
    else if (projects.length > 0) {
      projectsComponent = truncatedProjectListRows(projects, projectsUrl, projectsUrl);
    }
    else {
      const projectNewUrl = this.props.urlMap.projectNewUrl;
      projectsComponent = <YourEmptyProjects key="empty-projects" projectsSearchUrl={projectsSearchUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />
    }
    return [
      <h2 key="header">Your Projects</h2>,
      projectsComponent
    ]
  }
}

class RenkuIntroText extends Component {
  render() {
    return <RenkuMarkdown key="readme" markdownText={this.props.welcomePage} />
  }

}

class StarredEmptyProjects extends Component {
  render() {
    return (<Row>
      <Col>
        <p>
          You are logged in, but you have not yet starred any projects.
          Starring a project declares your interest in it.
          If there is a project you work on or want to follow, you should search for it in
          the <Link to={this.props.projectsSearchUrl}>project search</Link>, click on it to view, and star it.
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
    let projectsComponent = null;
    if (this.props.loading) {
      projectsComponent = <Loader key="loader" />;
    }
    else if (projects.length > 0)
      projectsComponent = truncatedProjectListRows(projects, projectsUrl, this.props.urlMap.projectsStarredUrl);
    else {
      const projectNewUrl = this.props.urlMap.projectNewUrl;
      const projectsSearchUrl = this.props.urlMap.projectsSearchUrl;
      projectsComponent = <StarredEmptyProjects key="empty" projectsSearchUrl={projectsSearchUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />
    }

    return [
      <h2 key="header">Starred Projects</h2>,
      projectsComponent
    ]
  }
}

class Welcome extends Component {
  render() {
    return (<Row>
      <Col>
        <RenkuIntroText welcomePage={this.props.welcomePage} />
      </Col>
    </Row>)
  }
}

class RenkuProvidesHeader extends Component {
  render() {
    return <h3 className="text-primary">
      {this.props.title} <FontAwesomeIcon icon={this.props.icon} id={this.props.title.toLowerCase()} />
    </h3>
  }
}

class AnonymousHome extends Component {
  render() {
    return <div className="container">
      <Row key="marquee">
        <Col>
          <Jumbotron className="bg-white text-secondary">
            <Row>
              <Col md={6}>
                <h1>RENKU</h1>
                <h2>Collaborative Data Science</h2>
              </Col>
              <Col md={6} className="d-md-flex justify-content-center align-items-center">
                <div>
                  <Link to="/login" className="btn btn-primary btn-lg">Login or Sign Up</Link>
                </div>
              </Col>
            </Row>
          </Jumbotron>
        </Col>
      </Row>
      <Row key="content-header">
        <Col>
          <h1 className="text-center">Renku Enables</h1>
        </Col>
      </Row>
      <Row key="content-body">
        <Col md={6}>
          <RenkuProvidesHeader title="Reproducibility" icon={faClone} />
          <p className="mb-5">Renku <b>captures the lineage</b> of your work so recreating a
            critical piece of analysis is always possible. In addition, it tracks the details of
            your <b>computational environment</b> so that others can reliably work with your data and code.</p>

          <RenkuProvidesHeader title="Shareability" icon={faCloudUp} />
          <p className="mb-5">Need to <b>share your results</b> with a colleague? <b>Make your data available</b> to
            a project partner? <b>Work together</b> on a project with a teammate?
            Renku makes all of these easy. And Renku lets you <b>track everyone&#8217;s contribution</b> to
            the final result.
          </p>

          <RenkuProvidesHeader title="Federation" icon={faUserFriends} />
          <p className="mb-5">
            Collaborate across instituational boundries, while maintaining complete control of your resources.
            Federation lets you <b>share</b> information, data, or code <b>without having to make any compromises</b>.
          </p>
        </Col>
        <Col md={6} className="mt-md-5">
          <RenkuProvidesHeader title="Reusability" icon={faCodeBranch} />
          <p className="mb-5">
            Stand on the shoulders of giants: <i>your colleagues</i>. Renku makes it simple
            to <b>reuse code and data</b> in other projects. No need for you to reinvent the
            wheel, and everyone profits from your improvements.
          </p>

          <RenkuProvidesHeader title="Security" icon={faShield} />
          <p className="mb-5">You have the freedom to share code or data with others, with the
            security of having <b>fine-grained control</b> over what is visible and what is kept private.
            You decide what information about your project is available to whom.
          </p>

          <RenkuProvidesHeader title="Discoverability" icon={faSearch} />
          <p className="mb-5">
            The extensible Renku knowledge graph captures information about your
            project&#8217;s data, code, proceses, and lineage. With its <b>powerful search capabilities</b>,
            if it is in the system, you can always find the information you are looking for.
          </p>
        </Col>
      </Row>
      <Row key="tutorial" className="mb-3">
        <Col>
          Want to learn more? Create an account
          and <a href="https://renku.readthedocs.io/en/latest/user/firststeps.html">follow the tutorial</a>.
        </Col>
      </Row>
      <Row key="closing">
        <Col>
          <h3 className="text-primary">
            <FontAwesomeIcon icon={faHeart} id="love" /> Give Renku a try.
            We think you&#8217;ll love it!
          </h3>
        </Col>
      </Row>
    </div>
  }
}


class LoggedInHome extends Component {
  render() {
    const urlMap = this.props.urlMap;
    const { user } = this.props;
    const projects = this.props.projects.featured;
    const neverLoaded = projects.fetched ? false : true;

    return [
      <Row key="username">
        <Col>
          <h1>{user.data.username} @ Renku</h1>
        </Col>
      </Row>,
      <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>,
      <Row key="content">
        <Col xs={{ order: 2 }} md={{ size: 4, order: 1 }}>
          <Row>
            <Col>
              <YourProjects urlMap={urlMap} loading={neverLoaded || projects.fetching} projects={projects.member} />
            </Col>
          </Row>
          <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>
          <Row>
            <Col>
              <Starred welcomePage={this.props.welcomePage}
                urlMap={urlMap} loading={neverLoaded || projects.fetching} projects={projects.starred} />
            </Col>
          </Row>
        </Col>
        <Col xs={{ order: 1 }} md={{ size: 6, order: 2 }}>
          <Welcome {...this.props} />
        </Col>
      </Row>
    ]
  }
}

class Home extends Component {
  render() {
    return (this.props.user.logged) ?
      <LoggedInHome {...this.props} /> :
      <AnonymousHome {...this.props} />;
  }
}

export default { Home, Starred };
