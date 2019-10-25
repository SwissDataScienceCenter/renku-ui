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
 *  incubator-renku-ui
 *
 *  Issue.js
 *  Module for issue features.
 */

import React, {Component} from 'react'

import {Provider, connect} from 'react-redux'

import { Link, NavLink } from 'react-router-dom'

import {Row, Col} from 'reactstrap'
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Badge , ListGroup, ListGroupItem } from 'reactstrap'

import {createStore} from '../utils/EnhancedState'
import State from './Issue.state'
import { Avatar, FieldGroup, TimeCaption, RenkuMarkdown } from '../utils/UIComponents'
import { Contribution, NewContribution } from '../contribution'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip, Card, CardHeader, CardBody } from 'reactstrap';
import { faGitlab } from '@fortawesome/free-brands-svg-icons';
import { faBoxOpen, faBox, faCompress, faExpand } from '@fortawesome/free-solid-svg-icons';


function issueStateBadge(issueStateValue) {
  let issueState = <Badge color="secondary">{issueStateValue}</Badge>;
  if (issueStateValue === 'opened')
    issueState = <Badge color="success">open</Badge>;
  if (issueStateValue === 'closed')
    issueState = <Badge color="primary">complete</Badge>;
  return issueState
}

class IssueVisibility extends Component {
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


class NewIssue extends Component {

  render() {
    const titleHelp = this.props.model.core.displayId.length > 0 ? `Id: ${this.props.model.core.displayId}` : null;
    const statuses = this.props.statuses;
    return <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
      <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the issue"
        help={titleHelp} value={this.props.model.core.title}
        feedback={statuses.title} invalid={statuses.title != null}
        onChange={this.props.onTitleChange}/>
      <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the issue"
        help="A description of the issue helps users understand it and is highly recommended."
        value={this.props.model.core.description} onChange={this.props.onDescriptionChange}/>
      <IssueVisibility value={this.props.model.visibility} onChange={this.props.onVisibilityChange}/>
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
    this.state = {statuses: []}
    this.store = createStore(State.New.reducer);
    this.onSubmit = client => this.handleSubmit.bind(this, client);
    this.projectPathWithNamespace = this.props.projectPathWithNamespace;
  }

  submitData() {
    const state = this.store.getState();
    let body = {}
    body.confidential = state.visibility.level === 'Restricted';
    body.title = state.core.title;
    body.description = state.core.description;
    return [this.projectPathWithNamespace, body]
  }

  handleSubmit(client) {
    const validation = this.validate();
    if (validation.result) {
      client.postProjectIssue(...this.submitData())
        .then(newIssue => {
          this.props.history.push({pathname: `/projects/${this.projectPathWithNamespace}/collaboration/issues`});
        });
    }
  }

  mapStateToProps(state, ownProps) {
    return {model: state}
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

  validate() {
    const state = this.store.getState();
    const errors = [];
    if (state.core.title.trim() === "") {
      errors.push({title: "Please provide a title."});
    }

    const result = errors.length === 0;
    if (!result) {
      this.setState({statuses: errors});
    }
    return {result, errors};
  }

  render() {
    const statuses = {}
    this.state.statuses.forEach((d) => { Object.keys(d).forEach(k => statuses[k] = d[k])});
    const VisibleNewIssue = connect(this.mapStateToProps, this.mapDispatchToProps)(NewIssue);
    return [
      <Row key="header"><Col md={8}><h3>New Issue</h3></Col></Row>,
      <Provider key="new" store={this.store}>
        <Row><Col md={8}>
          <VisibleNewIssue statuses={statuses} onSubmit={this.onSubmit(this.props.client)}/>
        </Col></Row>
      </Provider>
    ]
  }
}


class IssueViewHeader extends Component {

  render() {
    const title = this.props.title || 'no title';
    const description = this.props.description || 'no description';
    const buttonText = this.props.state === 'opened' ? 'Close' : 'Re-open';
    const screenSizeText = this.props.issuesListVisible ? 'Hide issues list' : 'Show issues list';
    const externalUrl = this.props.externalUrl;
    const externalIssueUrl = `${externalUrl}/issues/${this.props.iid}`;
    const time = this.props.updated_at;

    const buttonGit = <span id="tooltipGitView">
      <UncontrolledTooltip placement="top" target="tooltipGitView">
        Open in GitLab
      </UncontrolledTooltip>
      <a href={`${externalIssueUrl}`} role="button" target="_blank" rel="noreferrer noopener">
        <FontAwesomeIcon className="icon-link" icon={faGitlab} />
      </a>
    </span>

    const actionButton = <span id="tootltipActionView" onClick={this.props.onIssueStateChange}>
      <UncontrolledTooltip placement="top" target="tootltipActionView">
        {buttonText} Issue
      </UncontrolledTooltip>
      {this.props.state === 'opened' ?
        <FontAwesomeIcon  className="icon-link  text-success" icon={faBoxOpen}/>
        :
        <FontAwesomeIcon  className="icon-link  text-primary" icon={faBox}/>
      }
    </span>

    const toogleViewSize = <span id="tootltipToogleViewSize" onClick={this.props.toogleIsuesListVisibility}>
      <UncontrolledTooltip placement="top" target="tootltipToogleViewSize">
        {screenSizeText }
      </UncontrolledTooltip>
      { this.props.issuesListVisible ?
        <FontAwesomeIcon  className="icon-link" icon={faExpand}/>
        :
        <FontAwesomeIcon  className="icon-link" icon={faCompress}/>
      }
    </span>

    return <Row><Col key="image" md={1} sm={1} className="float-right text-center" style={{maxWidth:'62px'}}>
      <Avatar size="lg" person={this.props.author} />
      <small className="d-sm-inline-flex text-center">{this.props.author ? this.props.author.name : null}</small>
    </Col>
    <Col key="body" md={10} sm={10} className="float-left">
      <Card className="triangle-border left">
        <CardHeader icon="success" className="bg-transparent align-items-baseline">
          <Row>
            <Col md={8}>
              <strong>{title}</strong>&nbsp;&nbsp;
              <span className="caption align-baseline">
                <TimeCaption key="timecaption" caption="Updated" time={time}/>
              </span>
            </Col>
            <Col md={4}>
              <div className="float-right">
                {buttonGit}
                {toogleViewSize}
                {actionButton}
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <RenkuMarkdown markdownText={description} />
        </CardBody>
      </Card></Col></Row>
  }
}

// We sort the date strings instead of actual Date objects here - ok due to ISO format.
const IssueViewContributions = (props) => props.contributions
  .sort((el1, el2) => el1.created_at > el2.created_at ? 1 : -1)
  .filter(c => c.system !== true)
  .map(cont => <Contribution key={cont.id} contribution={cont} {...props}/>);


class IssueView extends Component {
  render() {
    const components = [
      <IssueViewHeader key="header" {...this.props} />,
      <IssueViewContributions key="contributions" {...this.props} />,
    ];
    if (this.props.state === 'opened') components.push(<NewContribution key="newContribution" {...this.props} />);
    return components;
  }
}

class View extends Component {

  constructor(props) {
    super(props);
    this._mounted = false;
    this.store = createStore(State.View.reducer);
    this.store.dispatch(this.retrieveIssue());
    this.state = {contributions: []}
  }

  componentDidMount() {
    this._mounted = true;
    this.retrieveContributions();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  retrieveIssue() {
    return (dispatch) => {
      return this.props.client.getProjectIssue(this.props.projectId, this.props.issueIid)
        .then(resp => {
          dispatch(State.View.setAll(resp.data))
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
    this.props.client.getContributions(this.props.projectId, this.props.issueIid)
      .then(resp => {
        if (!this._mounted) return;
        this.setState((prevState, props) => {
          return {contributions: resp.data}
        });
      })
  }


  mapStateToProps(state, ownProps) {
    return state
  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onIssueStateChange: (e) => {
        e.preventDefault();
        const issueState = this.store.getState().state;

        // FIXME: This is a terrible hack which relies on the issue being updated on the server before force-updating the
        // FIXME: entire project component. The problem here ist that the Issue list and the Issue detail components
        // FIXME: are siblings and they both hold the same information in their state (which is therefore duplicated).
        // FIXME: On click, the respective state information in both siblings state needs to be updated.
        // FIXME: The proper solution would be to elevate this information to the state their common parent and update
        // FIXME: it there.

        if (issueState === 'opened') {
          this.props.client.closeIssue(this.props.projectId, this.props.issueIid)
            .then(() => this.props.updateProjectView());
        }
        else if (issueState === 'closed') {
          this.props.client.reopenIssue(this.props.projectId, this.props.issueIid)
            .then(() => this.props.updateProjectView());
        }
        else {
          console.log(`Unknown state ${this.props.state}`)
        }
        // We don't even need to dispatch anything as the entire project component needs to be re-rendered
        // (and the information reloaded from the server) anyway.
        // dispatch(State.View.IssueState.change());
      }
    }
  }

  render() {
    const VisibleIssueView = connect(this.mapStateToProps, this.mapDispatchToProps.bind(this))(IssueView);
    return <Provider key="new" store={this.store}>
      <VisibleIssueView
        contributions={this.state ? this.state.contributions : []}
        appendContribution={this.appendContribution.bind(this)}
        expanded={this.state ? this.state.expanded : false}
        {...this.props} />
    </Provider>
  }
}

class IssueListRow extends Component {
  render() {
    const issueIid = this.props.iid;
    const issueUrl = `${this.props.issueBaseUrl}/issues/${issueIid}/`;
    const issueState = issueStateBadge(this.props.state);
    const title = <NavLink activeClassName="selected-issue" to={issueUrl}>{this.props.title || 'no title'}</NavLink>
    const time = new Date(this.props.updated_at);
    const timeBadge = <Badge color="renku-light">{time.toLocaleDateString()}</Badge>

    return <ListGroupItem>
      <span className="issue-title text-break">
        <span className="pr-2"><Avatar size="sm" person={this.props.author} /></span>{title}
      </span>
      <div className="float-right">{timeBadge}</div>
      <div className="float-right pr-2">{issueState}</div>
    </ListGroupItem>
  }
}

class IssueList extends Component {
  render() {
    const issues = this.props.issues;
    const hasUser = this.props.user.id ? true : false;
    const rows = issues.map((d, i) =>
      <IssueListRow key={i} {...d} issueBaseUrl={this.props.collaborationUrl} projectId={this.props.projectId}/>);
    return [
      <Row key="header">
        <Col sm={6}><h2>Issues</h2></Col>
        <Col sm={6}>
          {
            (hasUser) ?
              <small className="float-right" mr={1}>
                <Link className="btn btn-primary" role="button" to={this.props.issueNewUrl}>New Issue</Link>
              </small> :
              null
          }
        </Col>
      </Row>,
      <Row key="issues"><Col xs={12}><ListGroup>{rows}</ListGroup></Col></Row>
    ]
  }
}


class List extends Component {

  render() {
    return <IssueList
      projectId={this.props.projectId} {...this.props}/>
  }
}

export default { New, View, List};
