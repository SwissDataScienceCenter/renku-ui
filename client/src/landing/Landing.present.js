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
import { Url } from "../utils/helpers/url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLandmark, faPlus, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { MarkdownTextExcerpt, RenkuMarkdown } from "../utils/components/markdown/RenkuMarkdown";
import ListDisplay from "../utils/components/List";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { Loader } from "../utils/components/Loader";
import { Docs } from "../utils/constants/Docs";


function truncatedProjectListRows(projects, urlFullList, gridDisplay, lastVisited) {
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
      mediaContent: project.avatar_url,
      visibility: project.visibility
    };
  });
  const more = (projects.length > projectSubset.length || lastVisited) ?
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
    if (this.props.loading)
      return <Loader key="loader" />;

    if (projects.length > 0) {
      projectsComponent = truncatedProjectListRows(projects, projectsUrl, true, this.props.lastVisited);
    }
    else {
      const { projectNewUrl } = this.props.urlMap;
      projectsComponent = <YourEmptyProjects key="empty-projects" projectsSearchUrl={projectsSearchUrl}
        projectNewUrl={projectNewUrl} welcomePage={this.props.welcomePage} />;
    }

    const title = this.props.lastVisited ? "Recent Projects" : "Your Projects";
    return <Fragment>
      <h3 key="header">{title}</h3>
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

class LoggedInHome extends Component {
  render() {
    const urlMap = this.props.urlMap;
    const { user } = this.props;
    const projects = this.props.projects.landingProjects;
    return [
      <Row key="username">
        <Col xs={6}>
          <h3 data-cy="username-home" className="pt-4 fw-bold">{user.data.username} @ Renku</h3>
        </Col>
      </Row>,
      <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>,
      <Row key="content">
        <Col xs={{ order: 2 }} md={{ size: 6, order: 1 }}>
          <YourProjects
            urlMap={urlMap} loading={projects.fetching} projects={projects.list} lastVisited={projects.lastVisited} />
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
              url={Docs.READ_THE_DOCS_TUTORIALS_STARTING}
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
