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

import { Link }  from 'react-router-dom'

import { Row, Col } from 'reactstrap';
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Container, Jumbotron } from 'reactstrap'
import { Table } from 'reactstrap'

import ReactMarkdown from 'react-markdown'

import { Avatar, TimeCaption, FieldGroup } from '../UIComponents'




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
      <Jumbotron key="header" fluid>
        <Container fluid>
          <h1>{title}</h1>
          <p className="lead">{description}</p>
        </Container>
      </Jumbotron>
    )
  }
}

class ProjectViewDetails extends Component {

  render() {
    const displayId = this.props.displayId;
    const internalId = this.props.internalId;
    const visibilityLevel = this.props.visibilityLevel;
    const externalUrl = this.props.externalUrl;
    return (
      <Table key="metadata" size="sm">
        <tbody>
          <tr>
            <th scope="row">Id</th>
            <td><a href={externalUrl}>{displayId} [{internalId}]</a></td>
          </tr>
          <tr>
            <th scope="row">Visibility</th>
            <td>{visibilityLevel}</td>
          </tr>
        </tbody>
      </Table>)
  }
}

class ProjectViewReadme extends Component {

  render() {
    const readmeText = this.props.readmeText;
    return [
      <hr key="break" />,
      <ReactMarkdown key="readme" source={readmeText} />
    ]
  }
}

class ProjectView extends Component {

  render() {
    return [
      <Row key="header"><Col md={12}><ProjectViewHeader key="header" {...this.props} /></Col></Row>,
      <Row key="header"><Col md={12}><ProjectViewDetails key="details" {...this.props} /></Col></Row>,
      <Row key="header"><Col md={12}><ProjectViewReadme key="readme" {...this.props} /></Col></Row>
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
    const title = <Link to={`/projects/${this.props.id}`}>{this.displayMetadataValue('name', 'no title')}</Link>
    const description = this.props.description !== '' ? this.props.description : 'No description available';
    return (
      <Row className="project-list-row">
        <Col md={1}><Avatar  /></Col>
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
