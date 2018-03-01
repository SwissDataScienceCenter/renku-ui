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

import React, {Component} from 'react';

import {Provider, connect} from 'react-redux'

import {Link} from 'react-router-dom'

import {Row, Col} from 'reactstrap';
import {Button, FormGroup, Input, Label} from 'reactstrap'
import {Container, Jumbotron} from 'reactstrap'
import {Table} from 'reactstrap'

import {createStore} from '../app-state/enhanced-state'
import State from './Ku.state'
import {Avatar, TimeCaption, FieldGroup} from '../UIComponents'
import { getActiveProjectId } from '../App'
import { Contribution, NewContribution } from '../contribution'


class KuVisibility extends Component {
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


class NewKu extends Component {

  render() {
    const titleHelp = this.props.core.displayId.length > 0 ? `Id: ${this.props.core.displayId}` : null;
    return <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
      <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the ku"
        help={titleHelp}
        value={this.props.core.title} onChange={this.props.onTitleChange}/>
      <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the ku"
        help="A description of the ku helps users understand it and is highly recommended."
        value={this.props.core.description} onChange={this.props.onDescriptionChange}/>
      <KuVisibility value={this.props.visibility} onChange={this.props.onVisibilityChange}/>
      <br/>
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
    this.onSubmit = client => this.handleSubmit.bind(this, client);
    this.projectId = getActiveProjectId(this.props.location.pathname);
  }

  submitData() {
    const state = this.store.getState();
    let body = {}
    body.confidential = state.visibility.level === 'Restricted';
    body.title = state.core.title;
    body.description = state.core.description;
    return [this.projectId, body]
  }

  handleSubmit(client) {
    console.log(this)
    client.postProjectKu(...this.submitData())
      .then(newKu => {
        this.store.dispatch(State.List.append([newKu]));
        this.props.history.push({pathname: `/projects/${this.projectId}/kus/`});
      });
  }

  mapStateToProps(state, ownProps) {
    return state
  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onTitleChange: (e) => {
        dispatch(State.New.Core.set('title', e.target.value))
      },
      onDescriptionChange: (e) => {
        dispatch(State.New.Core.set('description', e.target.value))
      },
      onVisibilityChange: (e) => {
        dispatch(State.New.Visibility.set(e.target.value))
      }
    }
  }

  render() {
    const VisibleNewKu = connect(this.mapStateToProps, this.mapDispatchToProps)(NewKu);
    return [
      <Row key="header"><Col md={8}><h1>New Ku</h1></Col></Row>,
      <Provider key="new" store={this.store}>
        <Row><Col md={8}><VisibleNewKu onSubmit={this.onSubmit(this.props.client)}/></Col></Row>
      </Provider>
    ]
  }
}


class KuViewHeader extends Component {

  render() {
    const title = this.props.title || 'no title';
    const description = this.props.description || 'no description';
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


class KuViewDetails extends Component {

  render() {
    const visibilityLevel = this.props.confidential ? 'restricted' : 'public';
    return (
      <Table key="metadata" size="sm">
        <tbody>
          <tr>
            <th scope="row">Visibility</th>
            <td>{visibilityLevel}</td>
          </tr>
        </tbody>
      </Table>)
  }
}

// We sort the date strings instead of actual Date objects here - ok due to ISO format.
const KuViewContributions = (props) => props.contributions
  .sort((el1, el2) => el1.created_at > el2.created_at ? 1 : -1)
  .map(cont => <Contribution key={cont.id} contribution={cont} client={props.client} projectId={props.projectId}/>);


class KuView extends Component {
  render() {
    return [
      <KuViewHeader key="header" {...this.props} />,
      <KuViewDetails key="details" {...this.props} />,
      <KuViewContributions key="contributions" {...this.props} />,
      <NewContribution key="newContribution" {...this.props} />
    ]
  }
}

class View extends Component {

  constructor(props) {
    super(props);
    this.store = createStore(State.View.reducer);
    this.store.dispatch(this.retrieveKu());
    this.retrieveContributions();
    this.state = {contributions: []}
  }

  retrieveKu() {
    return (dispatch) => {
      return this.props.client.getProjectKu(this.props.projectId, this.props.kuIid).then(d => {
        dispatch(State.View.setAll(d))
      })
    }
  }

  appendContribution(newContribution) {
    this.setState(prevState => {
      let newContributions = [...prevState.contributions];
      newContributions.push({...newContribution});
      return {...prevState, contributions: newContributions}
    })
  }

  retrieveContributions() {
    this.props.client.getContributions(this.props.projectId, this.props.kuIid)
      .then(d => {
        this.setState((prevState, props) => {
          return {contributions: d}
        });
      })
  }


  mapStateToProps(state, ownProps) {
    return state
  }

  mapDispatchToProps(dispatch, ownProps) {
    return {}
  }

  render() {
    const VisibleKuView = connect(this.mapStateToProps, this.mapDispatchToProps)(KuView);
    return <Provider key="new" store={this.store}>
      <VisibleKuView
        contributions={this.state ? this.state.contributions : []}
        appendContribution={this.appendContribution.bind(this)}
        {...this.props}/>
    </Provider>
  }
}

class KuListRow extends Component {

  render() {
    const kuIid = this.props.iid;
    const title = <Link
      to={`/projects/${this.props.projectId}/kus/${kuIid}`}> {this.props.title || 'no title'}
    </Link>;
    const description = this.props.description || 'no description';
    const time = this.props.updated_at;

    return (
      <Row className="ku-list-row">
        <Col md={1}><Avatar/></Col>
        <Col md={9}>
          <p><b>{title}</b></p>
          <p>{description} <TimeCaption caption="Updated" time={time}/></p>
        </Col>
      </Row>
    );
  }
}

class KuList extends Component {
  render() {
    const kus = this.props.kus;
    const rows = kus.map((d, i) => <KuListRow key={i} {...d} projectId={this.props.projectId}/>);
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


  listKus() {
    return (dispatch) => {
      return this.props.client.getProjectKus(this.props.projectId)
        .then(d => dispatch(State.List.set(d)))
    }
  }

  mapStateToProps(state, ownProps) {
    return state
  }

  mapDispatchToProps(dispatch, ownProps) {
    return {}
  }

  render() {
    const VisibleKuList = connect(this.mapStateToProps, this.mapDispatchToProps)(KuList);
    return [
      <Provider key="new" store={this.store}>
        <VisibleKuList projectId={this.props.projectId}/>
      </Provider>
    ]
  }
}

export default { New, View, List};
