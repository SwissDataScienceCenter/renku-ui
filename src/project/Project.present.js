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
 *  incubator-renga-ui
 *
 *  Project.present.js
 *  Presentational components.
 */



import React, { Component } from 'react';

import {  Link, Route }  from 'react-router-dom'

import { Row, Col } from 'reactstrap';
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Container } from 'reactstrap'
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Card, CardHeader } from 'reactstrap';
import { Badge } from 'reactstrap';

import ReactMarkdown from 'react-markdown'

import { Avatar, TimeCaption, FieldGroup, RengaNavLink } from '../utils/UIComponents'

class DataVisibility extends Component {
  render() {
    return <FormGroup>
      <Label>Visibility</Label>
      <Input type="select" placeholder="visibility" value={this.props.value.level} onChange={this.props.onChange}>
        <option value="public">Public</option>
        <option value="restricted">Restricted</option>
      </Input>
    </FormGroup>
  }
}

class ProjectNew extends Component {

  render() {
    const titleHelp = this.props.core.displayId.length > 0 ? `Id: ${this.props.core.displayId}` : null;
    return <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
      <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the project"
        help={titleHelp} value={this.props.core.title} onChange={this.props.onTitleChange} />
      <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the project"
        help="A description of the project helps users understand it and is highly recommended."
        value={this.props.core.description} onChange={this.props.onDescriptionChange} />
      <DataVisibility value={this.props.visibility} onChange={this.props.onVisibilityChange} />
      <br />
      <Button color="primary" onClick={this.props.onSubmit}>
        Create
      </Button>
    </form>
  }
}

class ProjectViewHeader extends Component {

  render() {
    const title = this.props.title;
    const description = this.props.description;
    return (
      <Container fluid>
        <Row>
          <Col sm={12} md={8}>
            <h3>{title}</h3>
            <p className="lead">{description}</p>
          </Col>
          <Col sm={12} md={4}>
            <p>
              <Badge color="primary">python</Badge>&nbsp;
              <Badge color="primary">linear model</Badge>&nbsp;
              <Badge color="primary">weather</Badge>&nbsp;
            </p>
            <p><b>Stars</b> 5</p>
          </Col>
        </Row>
      </Container>
    )
  }
}

class ProjectNav extends Component {

  render() {
    const selected = 'overview';
    const dummy = () => { };
    const onData = dummy;
    const onWorkflows = dummy;
    const onFiles = dummy;
    // const visibleTab = <ProjectList {...this.props} />
    // let visibleTab = <YourActivity />
    // if (selected === 'your_network') visibleTab = <YourNetwork />
    // if (selected === 'explore') visibleTab = <Explore />
    return (
      <Nav pills className={'nav-pills-underline'}>
        <NavItem>
          <RengaNavLink to={this.props.overviewUrl} title="Overview" />
        </NavItem>
        <NavItem>
          <RengaNavLink exact={false} to={this.props.kusUrl} title="Kus" />
        </NavItem>
        <NavItem>
          <RengaNavLink exact={false} to={this.props.notebooksUrl} title="Notebooks" />
        </NavItem>
        <NavItem><NavLink href="#" active={selected === 'data'}
          onClick={onData}>Data</NavLink></NavItem>
        <NavItem><NavLink href="#" active={selected === 'workflows'}
          onClick={onWorkflows}>Workflows</NavLink></NavItem>
        <NavItem><NavLink href="#" active={selected === 'files'}
          onClick={onFiles}>Files</NavLink></NavItem>
      </Nav>)
  }
}

class ProjectViewReadme extends Component {

  render() {
    const readmeText = this.props.readmeText;
    return (
      <Card body className="border-0">
        <CardHeader>README.md</CardHeader>
        <ReactMarkdown key="readme" source={readmeText} />
      </Card>
    )
  }
}

class ProjectViewStats extends Component {

  render() {
    const lastActivityAt = this.props.lastActivityAt;
    return [
      <h3 key="header">Stats</h3>,
      <TimeCaption key="time-caption" time={lastActivityAt} />,
      <p key="stats">
        <b>Kus</b> 5; 1 closed, 2 active<br />
        <b>Contributors</b> 3<br />
        <b>Notebooks</b> 3
      </p>,
    ]
  }
}

class ProjectViewOverview extends Component {

  render() {
    return [
      <Col key="stats" sm={12} md={3}><br /><ProjectViewStats {...this.props} /></Col>,
      <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" {...this.props} /></Col>
    ]
  }
}

class ProjectViewKus extends Component {

  render() {
    return [
      <Col key="kulist" sm={12} md={4}>
        <br key="spacer" />
        {this.props.kuList}
      </Col>,
      <Col key="ku" sm={12} md={8}>
        <br key="spacer"/>
        <Route path={this.props.kuUrl}
          render={props => this.props.kuView(props) }/>
      </Col>
    ]
  }
}

class ProjectViewNotebooks extends Component {

  render() {
    return [
      <Col key="notebooks" sm={12} md={2}><br />
        <h3>Notebooks</h3>
      </Col>,
      <Col key="notebook" sm={12} md={10}>
        <Route path={this.props.notebookUrl}
          render={props => this.props.notebookView(props) }/>
      </Col>
    ]
  }
}

class ProjectView extends Component {

  render() {
    return [
      <Row key="header"><Col md={12}><ProjectViewHeader key="header" {...this.props} /></Col></Row>,
      <Row key="nav"><Col md={12}><ProjectNav key="nav" {...this.props} /></Col></Row>,
      <Container key="content" fluid>
        <Row>
          <Route exact path={this.props.overviewUrl}
            render={props => <ProjectViewOverview key="overview" {...this.props} /> }/>
          <Route path={this.props.kusUrl}
            render={props => <ProjectViewKus key="kus" {...this.props} /> }/>
          <Route path={this.props.notebooksUrl}
            render={props => <ProjectViewNotebooks key="notebooks" {...this.props} /> }/>
        </Row>
      </Container>
    ]
  }
}

function displayMetadataValue(metadata, field, defaultValue) {
  let value = metadata[field];
  if (value == null) value = defaultValue;
  return value;
}

class ProjectListRow extends Component {
  displayMetadataValue(field, defaultValue) {
    return displayMetadataValue(this.props, field, defaultValue)
  }

  render() {
    // TODO: Replace all paths with props to allow routing to be controlled at the top level
    const title = <Link to={`/projects/${this.props.id}`}>{this.displayMetadataValue('name', 'no title')}</Link>
    const description = this.props.description !== '' ? this.props.description : 'No description available';
    return (
      <Row className="project-list-row">
        <Col md={1}><Avatar person={this.props.owner} /></Col>
        <Col md={9}>
          <p><b>{title}</b></p>
          <p>{description} <TimeCaption caption="Updated" time={this.props.last_activity_at} /> </p>
        </Col>
      </Row>
    );
  }
}

class ProjectList extends Component {
  render() {
    const projects = this.props.projects;
    const rows = projects.map((d, i) => <ProjectListRow key={i} {...d} />);
    return [
      <Row key="header"><Col md={8}><h1>Projects</h1></Col></Row>,
      <Row key="spacer"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="timeline"><Col md={8}>{rows}</Col></Row>
    ]
  }
}

export default { ProjectNew, ProjectView, ProjectList };
