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


import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";

import { RenkuMarkdown, Loader } from "../utils/UIComponents";
import { ProjectListRow } from "../project/list";
import { StatuspageBanner } from "../statuspage";

function truncatedProjectListRows(projects, urlFullList) {
  const maxProjectsRows = 5;
  const projectSlice = projects.slice(0, maxProjectsRows);
  const rows = projectSlice.map(project => <ProjectListRow key={project.id} compact={true} {...project} />);
  const more = (projects.length > maxProjectsRows) ?
    (<Link key="more" to={urlFullList}>more...</Link>)
    : null;
  return [
    <Row key="projects"><Col style={{ overflowX: "auto" }}>{rows}</Col></Row>,
    more
  ];
}

class YourEmptyProjects extends Component {
  render() {
    return (
      <Row>
        <Col>
          <p>
            You are logged in, but you are not yet a member of any projects.
            If there is a project you work on, you should search for it in
            the <Link to={this.props.projectsSearchUrl}>project search</Link>, click on it to view, and fork it.
          </p>
          <p>Alternatively, you can <Link to={this.props.projectNewUrl}>create a new project</Link>.</p>
        </Col>
      </Row>
    );
  }
}

class YourProjects extends Component {
  render() {
    const projects = this.props.projects || [];
    const { projectsUrl, projectsSearchUrl } = this.props.urlMap;

    let projectsComponent = null;
    if (this.props.loading) {
      projectsComponent = <Loader key="loader" />;
    }
    else if (projects.length > 0) {
      projectsComponent = truncatedProjectListRows(projects, projectsUrl);
    }
    else {
      const { projectNewUrl } = this.props.urlMap;
      projectsComponent = <YourEmptyProjects key="empty-projects" projectsSearchUrl={projectsSearchUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />;
    }
    return [
      <h2 key="header">Your Projects</h2>,
      projectsComponent
    ];
  }
}

class RenkuIntroText extends Component {
  render() {
    return <RenkuMarkdown key="readme" markdownText={this.props.welcomePage} />;
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
    </Row>);
  }
}

class Starred extends Component {
  render() {
    const projects = this.props.projects || [];
    const { projectsStarredUrl } = this.props.urlMap;

    let projectsComponent = null;
    if (this.props.loading) {
      projectsComponent = <Loader key="loader" />;
    }
    else if (projects.length > 0) {
      projectsComponent = truncatedProjectListRows(projects, projectsStarredUrl);
    }
    else {
      const { projectNewUrl, projectsSearchUrl } = this.props.urlMap;
      projectsComponent = <StarredEmptyProjects key="empty" projectsSearchUrl={projectsSearchUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />;
    }

    return [
      <h2 key="header">Starred Projects</h2>,
      projectsComponent
    ];
  }
}

class Welcome extends Component {
  render() {
    return (<Row>
      <Col>
        <RenkuIntroText welcomePage={this.props.welcomePage} />
      </Col>
    </Row>);
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
          <StatuspageBanner siteStatusUrl={urlMap.siteStatusUrl} statuspageId={this.props.statuspageId}
            statuspageModel={this.props.statuspageModel} />
          <h1>{user.data.username} @ Renku</h1>
        </Col>
      </Row>,
      <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>,
      <Row key="content">
        <Col xs={{ order: 2 }} md={{ size: 6, order: 1 }}>
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
    ];
  }
}

class Home extends Component {
  render() {
    return (this.props.user.logged) ? <LoggedInHome {...this.props} /> : null;
  }
}

export default { Home };
