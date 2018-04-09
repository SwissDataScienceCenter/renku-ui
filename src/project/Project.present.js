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

import { Link, Route }  from 'react-router-dom'

import { Row, Col } from 'reactstrap';
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Container } from 'reactstrap'
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Card, CardBody, CardHeader } from 'reactstrap';
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
    const titleHelp = this.props.display.slug.length > 0 ? `Id: ${this.props.display.slug}` : null;
    return [
      <Row key="header"><Col md={8}>
        <h1>New Project</h1>
      </Col></Row>,
      <Row key="body"><Col md={8}>
        <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
          <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the project"
            help={titleHelp} value={this.props.display.title} onChange={this.props.handlers.onTitleChange} />
          <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the project"
            help="A description of the project helps users understand it and is highly recommended."
            value={this.props.display.description} onChange={this.props.handlers.onDescriptionChange} />
          <DataVisibility value={this.props.meta.visibility} onChange={this.props.handlers.onVisibilityChange} />
          <br/>
          <Button color="primary" onClick={this.props.handlers.onSubmit}>
            Create
          </Button>
        </form>
      </Col></Row>
    ]
  }
}


class ProjectTag extends Component {
  render() {
    return <span><Badge color="primary">{this.props.tag}</Badge>&nbsp;</span>;
  }
}

class ProjectViewHeader extends Component {

  render() {
    const title = this.props.title;
    const lastActivityAt = this.props.lastActivityAt;
    const tag_list = this.props.tag_list || [];
    const star_count = this.props.star_count || 0;
    const description = this.props.description;
    const tags = (tag_list.length > 0) ? tag_list.map(t => <ProjectTag key={t} tag={t} />) : <br />;
    return (
      <Container fluid>
        <Row>
          <Col xs={12} md={9}>
            <h1>{title}</h1>
            <p>
              <span className="lead">{description}</span> <br />
              <TimeCaption key="time-caption" time={lastActivityAt} />
            </p>
          </Col>
          <Col xs={12} md={3}>
            <p>
              {tags}
            </p>
            <p><b>Stars</b> {star_count}</p>
          </Col>
        </Row>
      </Container>
    )
  }
}

class ProjectNav extends Component {

  render() {
    return (
      <Nav pills className={'nav-pills-underline'}>
        <NavItem>
          <RengaNavLink to={this.props.overviewUrl} title="Overview" />
        </NavItem>
        <NavItem>
          <RengaNavLink exact={false} to={this.props.kusUrl} title="Kus" />
        </NavItem>
        <NavItem>
          <RengaNavLink exact={false} to={this.props.notebooksUrl} title="Files" />
        </NavItem>
      </Nav>)
  }
}

class ProjectFilesNav extends Component {

  render() {
    const selected = 'notebooks';
    const dummy = () => { };
    const onData = dummy;
    const onWorkflows = dummy;
    const onOther = dummy;
    // const visibleTab = <ProjectList {...this.props} />
    // let visibleTab = <YourActivity />
    // if (selected === 'your_network') visibleTab = <YourNetwork />
    // if (selected === 'explore') visibleTab = <Explore />
    return (
      <Nav pills className={'flex-column'}>
        <NavItem><NavLink href="#" active={selected === 'notebooks'}
          onClick={onData}>Notebooks</NavLink></NavItem>
        <NavItem><NavLink href="#" active={selected === 'data'}
          onClick={onData}>Data</NavLink></NavItem>
        <NavItem><NavLink href="#" active={selected === 'workflows'}
          onClick={onWorkflows}>Workflows</NavLink></NavItem>
        <NavItem><NavLink href="#" active={selected === 'other'}
          onClick={onOther}>Other</NavLink></NavItem>
      </Nav>)
  }
}

class ProjectViewReadme extends Component {

  render() {
    const readmeText = this.props.readmeText;
    return (
      <Card className="border-0">
        <CardHeader>README.md</CardHeader>
        <CardBody>
          <ReactMarkdown key="readme" source={readmeText} />
        </CardBody>
      </Card>
    )
  }
}

// class ProjectViewStats extends Component {
//
//   render() {
//     const lastActivityAt = this.props.lastActivityAt;
//     return [
//       <h3 key="header">Stats</h3>,
//       <TimeCaption key="time-caption" time={lastActivityAt} />,
//       <p key="stats">
//         <b>Kus</b> 5; 1 closed, 2 active<br />
//         <b>Contributors</b> 3<br />
//         <b>Notebooks</b> 3
//       </p>,
//     ]
//   }
// }

class ProjectViewOverview extends Component {

  render() {
    // return [
    //   <Col key="stats" sm={12} md={3}><br /><ProjectViewStats {...this.props} /></Col>,
    //   <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" {...this.props} /></Col>
    // ]
    // Hide the stats until we can actually get them from the server
    return <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" {...this.props} /></Col>
  }
}

class ProjectViewKus extends Component {

  render() {
    return [
      <Col key="kulist" sm={12} md={4}>
        {this.props.kuList}
      </Col>,
      <Col key="ku" sm={12} md={8}>
        <Route path={this.props.kuUrl}
          render={props => this.props.kuView(props) }/>
      </Col>
    ]
  }
}

class ProjectViewFiles extends Component {

  render() {
    return [
      <Col key="files" sm={12} md={2}>
        <ProjectFilesNav />
      </Col>,
      <Col key="notebook" sm={12} md={9}>
        <Route path={this.props.notebookUrl}
          render={props => this.props.notebookView(props) }/>
      </Col>
    ]
  }
}

class ProjectView extends Component {

  render() {
    return [
      <Row key="header"><Col xs={12}><ProjectViewHeader key="header" {...this.props} /></Col></Row>,
      <Row key="nav"><Col xs={12}><ProjectNav key="nav" {...this.props} /></Col></Row>,
      <Row key="space"><Col key="space" xs={12}>&nbsp;</Col></Row>,
      <Container key="content" fluid>
        <Row>
          <Route exact path={this.props.overviewUrl}
            render={props => <ProjectViewOverview key="overview" {...this.props} /> }/>
          <Route path={this.props.kusUrl}
            render={props => <ProjectViewKus key="kus" {...this.props} /> }/>
          <Route path={this.props.notebooksUrl}
            render={props => <ProjectViewFiles key="files" {...this.props} /> }/>
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
