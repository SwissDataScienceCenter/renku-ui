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

import React, { Component } from 'react';
import { Link }  from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, FormText, Input, Label } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';

import { Avatar, Loader, Pagination,  TimeCaption } from '../../utils/UIComponents';
import { ProjectTagList } from '../shared';

class ProjectListRow extends Component {
  render() {
    const projectsUrl = this.props.projectsUrl;
    const title =
      <Link to={`${projectsUrl}/${this.props.id}`}>
        {this.props.path_with_namespace || 'no title'}
      </Link>
    const description = this.props.description !== '' ? this.props.description : 'No description available';
    return (
      <Row className="project-list-row">
        <Col md={2} lg={1}><Avatar person={this.props.owner} /></Col>
        <Col md={10} lg={11}>
          <p><b>{title}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<ProjectTagList taglist={this.props.tag_list} /></p>
          <p>{description} <TimeCaption caption="Updated" time={this.props.last_activity_at} /> </p>
        </Col>
      </Row>
    );
  }
}

class ProjectSearchForm extends Component {

  render() {
    return [<Form key="form" onSubmit={this.props.handlers.onSearchSubmit} inline>
      <FormGroup>
        <Label for="searchQuery" hidden>Query</Label>
        <Input name="searchQuery" id="searchQuery" placeholder="Search Text" style={{minWidth: "300px"}}
          value={this.props.searchQuery} onChange={this.props.handlers.onSearchQueryChange} />
      </FormGroup>
      &nbsp;
      <Button color="primary" onClick={this.props.handlers.onSearchSubmit}>
        Search
      </Button>
    </Form>,
    <FormText key="help" color="muted">Search with empty text to browse all projects.</FormText>
    ]
  }
}

class ProjectListNav extends Component {

  render() {
    const selected = this.props.selected;
    return <Nav pills className={'nav-pills-underline'}>
      <NavItem>
        <NavLink href="#" active={selected === 'your_projects'}
          onClick={this.props.handlers.onMember}>Your Projects</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="#" active={selected === 'starred'}
          onClick={this.props.handlers.onStarred}>Starred Projects</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="#" active={selected === 'explore'}
          onClick={this.props.handlers.onExplore}>Explore</NavLink>
      </NavItem>
      <NavItem>
          &nbsp;&nbsp;
          <Link className="btn btn-primary" role="button" to={this.props.urlMap.projectNewUrl}>New Project</Link>
          <span></span>
      </NavItem>
    </Nav>
  }
}

class StarredEmptyProjects extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <p>
          You are logged in, but you have not yet starred any projects.
          Starring a project declares your interest in it.
          If there is a project you work on or want to follow, you should search for it in
          the <Link to={this.props.projectsUrl}>project search</Link>, click on it to view, and star it.
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
      return <Row key="projects"><Col md={8}>{rows}</Col></Row>
    else {
      const projectNewUrl = this.props.urlMap.projectNewUrl;
      return <StarredEmptyProjects projectsUrl={projectsUrl}
        projectNewUrl={projectNewUrl} />
    }
  }
}

class YourEmptyProjects extends Component {
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <p>
          You are logged in, but you have not yet created any projects.
          If there is a project you work on or want to follow, you should search for it in
          the <Link to={this.props.projectsUrl}>project search</Link>, click on it to view, and star it.
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
    const rows = projects.map(p => <ProjectListRow key={p.id} projectsUrl={projectsUrl} {...p} />);
    if (rows.length > 0)
      return <Row key="projects"><Col md={8}>{rows}</Col></Row>
    else {
      const projectNewUrl = this.props.urlMap.projectNewUrl;
      return <YourEmptyProjects projectsUrl={projectsUrl}
        projectNewUrl={projectNewUrl} />
    }
  }
}

class ExploreProjects extends Component {
  render() {
    const projects = this.props.projects || [];
    const projectsUrl = this.props.urlMap.projectsUrl;
    const rows = projects.map(p => <ProjectListRow key={p.id} projectsUrl={projectsUrl} {...p} />);
    if (rows.length > 0)
      return <Row key="projects"><Col md={8}>{rows}</Col></Row>
    else {
      const projectNewUrl = this.props.urlMap.projectNewUrl;
      return <YourEmptyProjects projectsUrl={projectsUrl}
        projectNewUrl={projectNewUrl} />
    }
  }
}



class ProjectList extends Component {
  render() {
    const loading = this.props.loading || false;
    const projects = this.props.page.projects || [];
    const hasUser = this.props.user && this.props.user.id != null;
    const rows = projects.map((d, i) => <ProjectListRow key={i} projectsUrl={this.props.urlMap.projectsUrl} {...d} />);

    const user = this.props.user;
    const starredProjects = (user) ? user.starredProjects : [];
    const memberProjects = (user) ? user.memberProjects : [];

    let selected = this.props.selected;
    const urlMap = this.props.urlMap;

    const nav = <ProjectListNav selected={selected} urlMap={urlMap}
      handlers={this.props.handlers}
      />

      let visibleTab;

      const projectsCol = (loading) ?
        <Col md={{size: 2,  offset: 3}}><Loader /></Col> :
        <Col md={8}>{rows}</Col>

      if(selected===undefined  || selected === 'explore'){
        selected = 'explore'
        visibleTab = <div>  <Row key="form">
                <Col md={8}>
                  <ProjectSearchForm searchQuery={this.props.searchQuery} handlers={this.props.handlers} />
                </Col>
              </Row>
              <Row key="spacer2"><Col md={8}>&nbsp;</Col></Row>
              <Row key="projects">{projectsCol}</Row>,
              <Pagination key="pagination" {...this.props} /></div>
      }
      else if (selected ==='starred')
        visibleTab = <Starred urlMap={urlMap} projects={starredProjects} />
      if(selected === 'your_projects')
        visibleTab = <YourProjects urlMap={urlMap} projects={memberProjects} />



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
  /*    <Row key="header">
        <Col md={3} lg={2}><h1>Projects</h1></Col>
        <Col md={2}>
          {
            (hasUser) ?
              <Link className="btn btn-primary" role="button" to={this.props.urlMap.projectNewUrl}>New Project</Link> :
              <span></span>
          }
        </Col>
      </Row>,*/
      // <Row key="nav">
      //   <Col md={12}>
      //     {nav}
      //   </Col>
      // </Row>,
      // <Row key="spacer1"><Col md={8}>&nbsp;</Col></Row>,

  /*    <Row key="form">
        <Col md={8}>
          <ProjectSearchForm searchQuery={this.props.searchQuery} handlers={this.props.handlers} />
        </Col>
      // </Row>,*/
      // <Row key="spacer2"><Col md={8}>&nbsp;</Col></Row>,
      // <Row key="projects">{projectsCol}</Row>,
      // <Pagination key="pagination" {...this.props} />
    ]
  }
}

export default ProjectList;
export { ProjectListRow }
