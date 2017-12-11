/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  Dataset.js
 *  Module for dataset features.
 */

import React, { Component } from 'react';

import { Provider, connect } from 'react-redux'
import { createStore } from 'redux'

import { Row, Col } from 'reactstrap';
import { Button, ButtonGroup, FormGroup, FormText, Input, Label } from 'reactstrap';
import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap'

import State from './DatasetState'

function displayIdFromTitle(title) {
  // title.Author: Alex K. - https://stackoverflow.com/users/246342/alex-k
  // Source: https://stackoverflow.com/questions/6507056/replace-all-whitespace-characters/6507078#6507078
  title = title.replace(/\s/g, "-");
  title = title.toLowerCase();
  return title;
}

class FieldGroup extends Component {
  render() {
    const label = this.props.label,
      help = this.props.help,
      props = this.props;
    return <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
      {help && <FormText color="muted">{help}</FormText>}
    </FormGroup>
  }
}

class DataVisibility extends Component {
  render() {
    return <FormGroup>
        <Label>Visibility</Label>
        <Input type="select" placeholder="visibility" onChange={this.props.onChange}>
          <option value="public">Public</option>
          <option value="restricted">Restricted</option>
        </Input>
      </FormGroup>
  }
}

class FileUpload extends Component {
  // From https://bootsnipp.com/snippets/featured/bootstrap-drag-and-drop-upload
  render() {
    return (<div>
      <CardTitle>Select Files</CardTitle>
      <div className="form-inline">
        <div className="form-group">
          <input type="file" name="files[]" id="js-upload-files" multiple />
        </div>
        <button type="submit" className="btn btn-sm btn-primary" id="js-upload-submit">Upload</button>
      </div>
    </div>)
  }
}

class ReferenceSpecification extends Component {

  render() {
    let urlValue = this.props.state['url'] ? this.props.state['url'] : "";
    let authorValue = this.props.state['author'] ? this.props.state['author'] : "";
    return [
      <CardTitle key="title">Reference</CardTitle>,
      <FieldGroup key="url" id="url" type="text" label="URL or DOI"
        placeholder="The URL or DOI for the dataset" value={urlValue} onChange={(v) => this.props.onChange("url", v)} />,
      <FieldGroup key="author" id="author" type="text" label="Author"
        placeholder="The author of the original data" value={authorValue}
        onChange={(v) => this.props.onChange("author", v)} />,
    ]
  }
}

class DataRegistration extends Component {
  constructor(props) {
    super(props);
    this.state = { registration: "reference", reference: {} }
    this.onChange = this.handleChange.bind(this);
    this.onReferenceChange = this.handleReferenceChange.bind(this);
  }

  handleChange(v) {
    this.setState({registration: v});
    this.props.onChange(this.state);
  }

  handleReferenceChange(key, e) {
    let reference = this.state.reference;
    reference[key] = e.target.value;
    this.setState({reference: reference });
    this.props.onChange(this.state);
  }

  render() {
    const buttonToolbar = (
      <ButtonGroup>
        <Button onClick={() => this.handleChange("reference")} active={this.state.registration === "reference"}>Reference</Button>
        <Button onClick={() => this.handleChange("upload")} active={this.state.registration === "upload"}>Upload</Button>
      </ButtonGroup>);
    // const panelChild = this.state.registration === "reference" ? <UrlSpecification /> : <FileUpload />
    const panelChild =
      this.state.registration === "reference" ?
        <ReferenceSpecification onChange={this.onReferenceChange} state={this.state.reference} /> :
        <FileUpload />
    return (
      <Card>
        <CardHeader>{buttonToolbar}</CardHeader>
        <CardBody>{panelChild}</CardBody>
      </Card>
    )
  }
}

class NewDataSet extends Component {
  constructor(props) {
    super(props);
    this.state = { dataRegistrationState: { } };
    // TODO Move handling of visibility and data registration state to redux
    this.onVisibilityChange = this.handleVisibilityChange.bind(this);
    this.onDataRegistrationChange = this.handleDataRegistrationChange.bind(this);
  }

  handleVisibilityChange(e) { this.setState({ visibility: e.target.value }); }
  handleDataRegistrationChange(dataRegistrationState) {
    this.setState({dataRegistrationState});
  }

  render() {
    const titleHelp = this.props.core.displayId.length > 0 ? `Id: ${this.props.core.displayId}` : null;
    return <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
      <FieldGroup id="title" type="text" label="Title" value={this.props.core.title}
        placeholder="A brief name to identify the dataset" onChange={this.props.onTitleChange}
        help={titleHelp} />
      <FieldGroup id="description" type="textarea" label="Description" value={this.props.core.description} onChange={this.props.onDescriptionChange}
        placeholder="A description of the dataset" help="A description of the data set helps users understand it and is highly recommended." />
      <DataVisibility onChange={this.onVisibilityChange} />
      <DataRegistration onChange={this.onDataRegistrationChange} state={this.state.dataRegistration} />
      <br />
      <Button color="primary" onClick={this.props.onSubmit}>
        Create
      </Button>
    </form>
  }
}

class New extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.reducer);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  submitData() {
    return this.store.getState();
  }

  handleSubmit() {
    console.log("Submit", this.submitData());
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onTitleChange: (e) => { dispatch(State.Core.set('title', e.target.value)) },
      onDescriptionChange: (e) => { dispatch(State.Core.set('description', e.target.value)) }
    }
  }

  render() {
    const VisibleNewDataSet = connect(this.mapStateToProps, this.mapDispatchToProps)(NewDataSet);
    return [
      <Row key="header"><Col md={8}><h1>New Dataset</h1></Col></Row>,
      <Provider key="new" store={this.store}>
        <Row><Col md={8}><VisibleNewDataSet onSubmit={this.onSubmit} /></Col></Row>
      </Provider>
    ]
  }
}

class View extends Component {
  render() {
    return <h1 key="header">Dataset View</h1>
  }
}

export default { New, View };
export { displayIdFromTitle };
