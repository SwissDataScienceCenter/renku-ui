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


import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { Url } from "../utils/url";
import { ExternalLink, InfoAlert, MarkdownTextExcerpt, ListDisplay, RenkuMarkdown,
  Loader } from "../utils/UIComponents";
import { StatuspageBanner } from "../statuspage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLandmark, faPlus, faQuestion } from "@fortawesome/free-solid-svg-icons";


function truncatedProjectListRows(projects, urlFullList, gridDisplay) {
  const projectSubset = projects.slice(0, 4);
  const projectItems = projectSubset.map(project => {
    const namespace = project.namespace ? project.namespace.full_path : "";
    const path = project.path;
    const url = Url.get(Url.pages.project, { namespace, path });
    return {
      id: project.id,
      url: url,
      itemType: "project",
      title: project.name,
      slug: project.path_with_namespace,
      description: project.description ?
        <Fragment>
          <MarkdownTextExcerpt markdownText={project.description} singleLine={gridDisplay ? false : true}
            charsLimit={gridDisplay ? 200 : 150} />
          <span className="ms-1">{project.description.includes("\n") ? " [...]" : ""}</span>
        </Fragment>
        : " ",
      tagList: project.tag_list,
      timeCaption: project.last_activity_at,
      mediaContent: project.avatar_url
    };
  });
  const more = (projects.length > projectSubset.length) ?
    (<Link key="more" to={urlFullList}>more projects...</Link>)
    : null;

  return <Fragment>
    <ListDisplay
      itemsType="project"
      search={null}
      currentPage={null}
      gridDisplay={gridDisplay}
      totalItems={projectItems.length}
      perPage={projectItems.length}
      items={projectItems}
      gridColumnsBreakPoint={{
        default: 2,
        1100: 2,
        700: 2,
        500: 1
      }}
    />
    { more}
  </Fragment>;
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
    if (this.props.loading) { projectsComponent = <Loader key="loader" />; }
    else if (projects.length > 0) {
      projectsComponent = truncatedProjectListRows(projects, projectsUrl, true);
    }
    else {
      const { projectNewUrl } = this.props.urlMap;
      projectsComponent = <YourEmptyProjects key="empty-projects" projectsSearchUrl={projectsSearchUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />;
    }
    return <Fragment>
      <h3 key="header">Your Projects</h3>
      {projectsComponent}
    </Fragment>;
  }
}

class RenkuIntroText extends Component {
  render() {
    return <RenkuMarkdown key="readme" markdownText={this.props.welcomePage} />;
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

function LoggedInNewVersionBanner() {

  const newVersionBannerStyle = {
    fontSize: "larger"
  };

  return <InfoAlert color="primary" timeout={20}>
    <div className="d-flex justify-content-center align-items-center" style={newVersionBannerStyle}>
      <div>
        <span role="img" aria-label="tada">🎉</span> {" "}
        Welcome to the new Renku UI!  {" "}
        <span role="img" aria-label="tada">🎉</span> {" "}
        <Link to={Url.get(Url.pages.help.changes)} className="link-rk-dark">
          Learn about what has changed.
        </Link>
      </div>
    </div>
  </InfoAlert>;
}

class LoggedInHome extends Component {
  render() {
    const urlMap = this.props.urlMap;
    const { user } = this.props;
    const projects = this.props.projects.featured;
    const neverLoaded = projects.fetched ? false : true;
    return [
      <LoggedInNewVersionBanner key="new-version-banner" />,
      <Row key="username">
        <Col xs={12}>
          <StatuspageBanner siteStatusUrl={urlMap.siteStatusUrl} statuspageId={this.props.statuspageId}
            statuspageModel={this.props.statuspageModel} />
        </Col>
        <Col xs={6}>
          <h3 className="pt-4 fw-bold">{user.data.username} @ Renku</h3>
        </Col>
      </Row>,
      <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>,
      <Row key="content">
        <Col xs={{ order: 2 }} md={{ size: 6, order: 1 }}>
          <YourProjects urlMap={urlMap} loading={neverLoaded || projects.fetching} projects={projects.member} />
          <Row><Col md={12}>&nbsp;</Col></Row>
        </Col>
        <Col xs={{ order: 1 }} md={{ size: 6, order: 2 }}>
          <Welcome {...this.props} />
        </Col>
      </Row>,
      <Row className="fs-3 fw-bold" key="links">
        <Col sm={4}>
          <div>
            <Link to={Url.get(Url.pages.help)} className="link-rk-dark text-decoration-none">
              Learn More... <FontAwesomeIcon icon={faQuestion} />
            </Link>
          </div>
        </Col>
        <Col sm={4}>
          <div>
            <ExternalLink role="link" className="link-rk-dark text-decoration-none"
              url="https://renku.readthedocs.io/en/latest/tutorials/01_firststeps.html"
              title="...do the tutorial... " customIcon={faLandmark} iconAfter={true}/>
          </div>
        </Col>
        <Col sm={4}>
          <div>
            <Link to={Url.get(Url.pages.project.new)} className="link-rk-dark text-decoration-none">
              ...or create a project <FontAwesomeIcon icon={faPlus} />
            </Link>
          </div>
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
