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

class ProjectList extends Component {
  render() {
    const loading = this.props.loading || false;
    const projects = this.props.page.projects || [];
    const hasUser = this.props.user && this.props.user.id != null;
    const rows = projects.map((d, i) => <ProjectListRow key={i} projectsUrl={this.props.urlMap.projectsUrl} {...d} />);
    const projectsCol = (loading) ?
      <Col md={{size: 2,  offset: 3}}><Loader /></Col> :
      <Col md={8}>{rows}</Col>
    return [
      <Row key="header">
        <Col md={3} lg={2}><h1>Projects</h1></Col>
        <Col md={2}>
          {
            (hasUser) ?
              <Link className="btn btn-primary" role="button" to={this.props.urlMap.projectNewUrl}>New Project</Link> :
              <span></span>
          }
        </Col>
      </Row>,
      <Row key="spacer1"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="form">
        <Col md={8}>
          <ProjectSearchForm searchQuery={this.props.searchQuery} handlers={this.props.handlers} />
        </Col>
      </Row>,
      <Row key="spacer2"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="projects">{projectsCol}</Row>,
      <Pagination key="pagination" {...this.props} />
    ]
  }
}

export default ProjectList;
export { ProjectListRow }
