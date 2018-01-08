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
 *  Ku.js
 *  Module for ku features.
 */

import React, { Component } from 'react';

import { createStore as reduxCreateStore, applyMiddleware, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk'

import { Link }  from 'react-router-dom'

import { Row, Col } from 'reactstrap';
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Container, Jumbotron } from 'reactstrap'
import { Table } from 'reactstrap'

import State from './Ku.state'
import { Avatar, TimeCaption, FieldGroup } from '../UIComponents'

function createStore(reducer) {
  const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(thunk),
    // other store enhancers if any
  );
  return reduxCreateStore(reducer, enhancer);
}

function displayMetadataValue(metadata, field, defaultValue) {
  let value = metadata[field];
  if (value == null) value = defaultValue;
  return value;
}

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

class DatasetReferenceSpecification extends Component {

  render() {
    return [
      <FieldGroup key="dataset" id="dataset" type="text" label="Dataset"
        placeholder="The dataset for the ku" value={this.props.dataset} onChange={(v) => this.props.onChange(v)} />,
    ]
  }
}

class DataRegistration extends Component {
  render() {
    let dataset = (this.props.value.refs.length > 0) ? this.props.value.refs[0].id : ""
    return <DatasetReferenceSpecification value={dataset} onChange={this.props.onChange} />;
  }
}

class NewDataSet extends Component {

  render() {
    const titleHelp = this.props.core.displayId.length > 0 ? `Id: ${this.props.core.displayId}` : null;
    return <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
      <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the ku" help={titleHelp}
        value={this.props.core.title} onChange={this.props.onTitleChange} />
      <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the ku" help="A description of the ku helps users understand it and is highly recommended."
        value={this.props.core.description} onChange={this.props.onDescriptionChange} />
      <DataVisibility value={this.props.visibility} onChange={this.props.onVisibilityChange} />
      <DataRegistration value={this.props.datasets} onChange={this.props.onDatasetsChange} />
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
    this.store = createStore(State.New.reducer);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  submitData() {
    return this.store.getState();
  }

  handleSubmit() {
    const body = JSON.stringify(this.submitData());
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    console.log({ headers, body});
    fetch("api/kus/", {method: 'POST', headers: headers, body: body})
        .then( (response) => {
            if (response.ok) {
              response.json().then( newDataset => {
                this.store.dispatch(State.List.append([newDataset]))
              });
              this.props.history.push({pathname: '/kus/'});
            }
        });
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onTitleChange: (e) => { dispatch(State.New.Core.set('title', e.target.value)) },
      onDescriptionChange: (e) => { dispatch(State.New.Core.set('description', e.target.value)) },
      onVisibilityChange: (e) => { dispatch(State.New.Visibility.set(e.target.value)) },
      onDatasetsChange: (e) => { dispatch(State.New.Datasets.set(e.target.value)) }
    }
  }

  render() {
    const VisibleNewDataSet = connect(this.mapStateToProps, this.mapDispatchToProps)(NewDataSet);
    return [
      <Row key="header"><Col md={8}><h1>New Ku</h1></Col></Row>,
      <Provider key="new" store={this.store}>
        <Row><Col md={8}><VisibleNewDataSet onSubmit={this.onSubmit} /></Col></Row>
      </Provider>
    ]
  }
}

class DataSetViewHeader extends Component {
  displayMetadataValue(field, defaultValue) {
    return displayMetadataValue(this.props.core, field, defaultValue)
  }

  render() {
    const title = this.displayMetadataValue("title", "no title");
    const description = this.displayMetadataValue("description", "no description");
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

class DataSetViewDetails extends Component {

  render() {
    const visibilityLevel = this.props.visibility.level;
    const dataset = (this.props.datasets.refs.length > 0) ? this.props.datasets.refs[0].id : ""
    return (
      <Table key="metadata" size="sm">
        <tbody>
          <tr>
            <th scope="row">Visibility</th>
            <td>{visibilityLevel}</td>
          </tr>
          <tr>
            <th scope="row">Dataset</th>
            <td><Link to={`/dataset/${dataset}`}>{dataset}</Link></td>
          </tr>
        </tbody>
      </Table>)
  }
}

class DataSetView extends Component {

  render() {
    return [
      <DataSetViewHeader key="header" {...this.props} />,
      <DataSetViewDetails key="details" {...this.props} />
    ]
  }
}

class View extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.View.reducer);
    this.store.dispatch(this.retrieveDataset());
  }

  fetchDataset() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    return fetch(`/api/kus/${this.props.id}`, {headers});
  }

  retrieveDataset() {
    return (dispatch) => {
      return this.fetchDataset().then(
        results => results.json().then(d => {
          dispatch(State.View.setAll(d))
        })
      )
    }
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
    }
  }

  render() {
    const VisibleDataSetView = connect(this.mapStateToProps, this.mapDispatchToProps)(DataSetView);
    return (
      <Provider key="new" store={this.store}>
        <VisibleDataSetView />
      </Provider>)
  }
}

class KuListRow extends Component {
  displayMetadataValue(field, defaultValue) {
    return displayMetadataValue(this.props.metadata.core, field, defaultValue)
  }

  render() {
    const kuId = this.props.id;
    const title = <Link to={`/ku/${kuId}`}>{this.displayMetadataValue('title', "no title")}</Link>
    const description = this.displayMetadataValue('description', "no description");
    const time = this.props.updated;

    return (
      <Row className="ku-list-row">
         <Col md={1}><Avatar  /></Col>
         <Col md={9}>
           <p><b>{title}</b></p>
           <p>{description} <TimeCaption caption="Updated" time={time} /> </p>
         </Col>
       </Row>
      );
  }
}

class KuList extends Component {
  render() {
    const kus = this.props.kus;
    const rows = kus.map((d, i) => <KuListRow key={i} {...d} />);
    return [
      <Row key="header"><Col md={8}><h1>Kus</h1></Col></Row>,
      <Row key="spacer"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="timeline"><Col md={8}>{rows}</Col></Row>
   ]
  }
}


class List extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.List.reducer);
    this.store.dispatch(this.listKus());
  }

  fetchKus() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    return fetch("/api/kus/", {headers});
  }

  listKus() {
    return (dispatch) => {
      return this.fetchKus().then(
        results => results.json().then(d => dispatch(State.List.set(d)))
      )
    }
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
    }
  }

  render() {
    const VisibleKuList = connect(this.mapStateToProps, this.mapDispatchToProps)(KuList);
    return [
      <Provider key="new" store={this.store}>
        <VisibleKuList />
      </Provider>
    ]
  }
}

export default { New, View, List };
