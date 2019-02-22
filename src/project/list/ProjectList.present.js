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
import { Link, Route, Switch }  from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, FormText, Input, Label } from 'reactstrap';
import { Nav, NavItem } from 'reactstrap';

import { Avatar, Loader, Pagination,  TimeCaption , RenkuNavLink } from '../../utils/UIComponents';
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

class ProjectNavTabs extends Component {
  render() {
    return (
      <Row key="nav">
        <Col md={12}>
            {
              (this.props.logedIn) ?
                <Nav pills className={'nav-pills-underline'}>
                   <NavItem>
                     <RenkuNavLink to={this.props.urlMap.projectsUrl} alternate={this.props.urlMap.yourProjects}  title="Your Projects" />
                   </NavItem>
                   <NavItem>
                     <RenkuNavLink exact={false} to={this.props.urlMap.starred}  title="Starred Projects" />
                   </NavItem>
                   <NavItem>
                     <RenkuNavLink exact={false} to={this.props.urlMap.projectsSearchUrl}  title="Search" />
                   </NavItem>
                </Nav>
               :
               <span></span>
            }
        </Col>
      </Row>
      )
  }
}


class DisplayEmptyProjects extends Component{
  render() {
    return (<Row>
      <Col md={8} lg={6} xl={4}>
        <p>
          <strong>{this.props.emptyListText}</strong><br/>
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

class DisplayProjects extends Component{
  render() {
    const loading = this.props.loading || false;
    const projectsUrl = this.props.urlMap.projectsUrl;
    const projectNewUrl = this.props.urlMap.projectNewUrl;
    const projectsSearchUrl = this.props.urlMap.projectsSearchUrl;
    const displayProjects = this.props.displayProjects || [];
    const emptyTextDisplay = this.props.emptyListText;

    const rows = displayProjects.map( p => <ProjectListRow key={p.id} projectsUrl={projectsUrl} {...p} />);
    const projectsCol = (loading) ?
      <Col md={{size: 2,  offset: 3}}><Loader /></Col> :
      <Col md={8}>{rows}</Col>;

      if (rows.length > 0 ){
        return (<Row key="projects">{projectsCol}</Row>);
      }
      else {
        if(!loading){
          return <DisplayEmptyProjects
            projectsSearchUrl={projectsSearchUrl}
            projectNewUrl={projectNewUrl}
            emptyListText={emptyTextDisplay}/>
        } else return " ";
    }

  }
}

class ProjectsSearch extends Component {
  render() {
    const loading = this.props.loading || false;
    const projects = this.props.page.projects || [];
    const rows = projects.map( (p) => <ProjectListRow key={p.id} projectsUrl={this.props.urlMap.projectsUrl} {...p} />);

    const projectsCol = (loading) ?
      <Col md={{size: 2,  offset: 3}}><Loader /></Col> :
      <Col md={8}>{rows}</Col>;

    return [<Row key="form">
              {
                (this.props.loggedOutMessage !== undefined) ?
                  <Col md={8} ><span>{this.props.loggedOutMessage}</span><br/><br/></Col>
                :
                  <span></span>
              }
              <Col md={8}>
                <ProjectSearchForm searchQuery={this.props.searchQuery} handlers={this.props.handlers} />
              </Col>
            </Row>,
            <Row key="spacer2"><Col md={8}>&nbsp;</Col></Row>,
            <Row key="projects">{projectsCol}</Row>,
            <Pagination key="pagination" {...this.props} />
          ];
  }
}

class ProjectList extends Component {
  render() {
    const hasUser = this.props.user && this.props.user !== null && this.props.user.id !== null;
    const user = this.props.user;
    const starredProjects = (user) ? user.starredProjects : [];
    const memberProjects = (user) ? user.memberProjects : [];
    const urlMap = this.props.urlMap;
    const loading = this.props.loading;

    return [
      <Row key="header">
        <Col md={3} lg={2}><h1>Projects</h1></Col>
          <Col md={2}>
          {
            (hasUser) ?
              <Link className="btn btn-primary" role="button" to={urlMap.projectNewUrl}>New Project</Link> :
              <span></span>
          }
          </Col>
      </Row>,
      <ProjectNavTabs logedIn={hasUser} key="navbar" urlMap={urlMap}/>,
      <Row key="spacer"><Col md={12}>&nbsp;</Col></Row>,
      <Row key="content">
        <Col key="" md={12}>
            {
              (hasUser) ?
                <Switch>
                  <Route path={urlMap.starred}
                    render={props => <DisplayProjects
                                        urlMap={urlMap}
                                        user={user}
                                        loading={loading}
                                        displayProjects={starredProjects}
                                        emptyListText="You are logged in, but you have not yet starred any projects. Starring a project declares your interest in it. "  />} />
                  <Route path={urlMap.projectsSearchUrl}
                    render={props =>  <ProjectsSearch  {...this.props} />} />
                  <Route path={urlMap.yourProjects}
                    render={props => <DisplayProjects
                                      urlMap={urlMap}
                                      user={user}
                                      displayProjects={memberProjects}
                                      loading={loading}
                                      emptyListText="You are logged in, but you have not yet created any projects. " />} />
                  <Route exact path={urlMap.projectsUrl}
                    render={props => <DisplayProjects
                                      urlMap={urlMap}
                                      user={user}
                                      displayProjects={memberProjects}
                                      loading={loading}
                                      emptyListText="You are logged in, but you have not yet created any projects. " />} />
              </Switch>
            :
              <Switch>
                <Route path={urlMap.starred}
                  render= {props => <ProjectsSearch loggedOutMessage="You need to be logged in to be able to see a list with the projects you starred, therefore we will display all projects for you to explore." {...this.props} />} />
                <Route path={urlMap.projectsSearchUrl}
                  render={ props =>  <ProjectsSearch  {...this.props} />} />
                <Route path={urlMap.yourProjects}
                  render= { props => <ProjectsSearch loggedOutMessage="You need to be logged in to be able to see a list with your own projects, therefore we will display all projects for you to explore." {...this.props} />} />
                <Route exact path={urlMap.projectsUrl}
                  render= { props => <ProjectsSearch {...this.props} />} />
              </Switch>
            }
        </Col>
      </Row>
    ]
  }
}

export default ProjectList;
export { ProjectListRow }
