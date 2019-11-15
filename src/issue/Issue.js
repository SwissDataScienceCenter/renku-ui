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

import React, { Component, useState } from 'react';
import { Provider, connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { Row, Col, Button, Badge, ListGroup, ListGroupItem, Card, CardHeader, CardBody, Alert } from 'reactstrap';
import { faGitlab } from '@fortawesome/free-brands-svg-icons';
import { faBoxOpen, faBox, faListUl, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_ERRORS } from '../api-client'; 
import { createStore } from '../utils/EnhancedState';
import State from './Issue.state';
import { UserAvatar, ExternalIconLink, RenkuMarkdown, TimeCaption, TooltipToggleButton } from '../utils/UIComponents';
import { Contribution, NewContribution } from '../contribution';
import { Loader } from '../utils/UIComponents';
import { issueFormSchema } from '../model/RenkuModels';
import { FormPanel } from '../utils/formgenerator';

function issueStateBadge(issueStateValue) {
    let issueState = <Badge color="secondary">{issueStateValue}</Badge>;
  if (issueStateValue === 'opened')
    issueState = <Badge color="success">open</Badge>;
  if (issueStateValue === 'closed')
    issueState = <Badge color="primary">complete</Badge>;
  return issueState
}

function New(props){
  
  const [submitLoader, setSubmitLoader] = useState(false);
  const issuesUrl = `/projects/${props.projectPathWithNamespace}/collaboration/issues`;

  const onCancel = e => {
    resetForm();
    props.history.push({pathname: issuesUrl});
  }

  const submitData = () => {
    let body = {}
    body.confidential = issueFormSchema.visibility.value === 'Restricted';
    body.title = issueFormSchema.name.value;
    body.description = issueFormSchema.description.value;
    return [props.projectPathWithNamespace, body];
  }

  const resetForm = () => {
    issueFormSchema.visibility.value = 'Public';
    issueFormSchema.name.value='';
    issueFormSchema.description.value=''
  }

  const submitCallback = e => {
    setSubmitLoader(true);
    props.client.postProjectIssue(...submitData())
      .then(newIssue => {
        resetForm();
        setSubmitLoader(false);
        props.history.push({pathname: issuesUrl});
      });		
  }

  return <Row>
    <Col md={8}>
      <FormPanel
        title="Create Issue" 
        btnName="Create Issue" 
        submitCallback={submitCallback} 
        model={issueFormSchema}
        submitLoader={{value: submitLoader, text:"Creating issue, please wait..."}}
        onCancel={onCancel} />
    </Col>
  </Row>
}

class IssueViewHeader extends Component {

  render() {
    if(this.props.error !== undefined && this.props.error.case === API_ERRORS.notFoundError)
      return <Alert color="danger">Error 404: The issue that was selected does not exist or could not be accessed.
        <br /> <br /> You can go back to the issues list and see available issues for this project. &nbsp;
        <Button color="danger" size="sm" onClick={() => this.props.history.push(this.props.issuesUrl)}>Back to list</Button>
      </Alert>

    if(this.props.error !== undefined)
      return <Alert color="danger">Error: There was an error retrieving the issue.
        <br /> <br /> You can go back to the issues list and see available issues for this project. &nbsp;
        <Button color="danger" size="sm" onClick={() => this.props.history.push(this.props.issuesUrl)}>Back to list</Button>
      </Alert>

    if(this.props.title === undefined)
      return <Loader />;

    const title = this.props.title || 'no title';
    const description = this.props.description || ' ';
    const buttonText = this.props.state === 'opened' ? 'Close' : 'Re-open';
    const externalUrl = this.props.externalUrl;
    const externalIssueUrl = `${externalUrl}/issues/${this.props.iid}`;
    const time = this.props.updated_at;
    const author = this.props.author ? this.props.author.name : null
    const buttonGit = <ExternalIconLink tooltip="Open in GitLab" icon={faGitlab} to={externalIssueUrl} />

    const actionButton =
      <TooltipToggleButton
        onClick={this.props.onIssueStateChange} tooltip={`${buttonText} Issue`}
        active={this.props.state === 'opened'}
        activeIcon={faBoxOpen} inactiveIcon={faBox}
        activeClass="text-success" inactiveClass="text-primary" />

    const backToList =
      <TooltipToggleButton
        onClick={() => this.props.history.push(this.props.issuesUrl)} tooltip={"Back to list"}
        active={true}
        activeIcon={faListUl} />

    return <div>
      <Row className="pb-2">
        <Col sm={7} style={{ overflow: "hidden" }}>
          <h2>{title}</h2>
        </Col>
        <Col md={1} sm={1} style={{ maxWidth: '62px', minWidth: '62px' }}></Col>
        <Col sm={3} className="float-right pt-3" style={{ textAlign: "end" }}>
          {backToList}
          {buttonGit}
          {actionButton}
        </Col>
      </Row>
      <Row>
        <Col key="image" md={1} sm={1} className="float-right text-center" style={{ maxWidth: '62px' }}>
          <UserAvatar size="lg" person={this.props.author} />
        </Col>
        <Col key="body" md={10} sm={10} className="float-left">
          <Card className="triangle-border left">
            <CardHeader icon="success" className="bg-transparent align-items-baseline">
              <Row>
                <Col md={12}>
                  <strong>{author}</strong>&nbsp;&nbsp;
              <span className="caption align-baseline">
                    <TimeCaption key="timecaption" caption="Commented" time={time} />
                  </span>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <RenkuMarkdown markdownText={description} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  }
}

// We sort the date strings instead of actual Date objects here - ok due to ISO format.
const IssueViewContributions = (props) => props.contributions
  .sort((el1, el2) => el1.created_at > el2.created_at ? 1 : -1)
  .filter(c => c.system !== true)
  .map(cont => <Contribution key={cont.id} contribution={cont} {...props} />);


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
    this.state = { contributions: [] }
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
        }).catch(error => {
          dispatch(State.View.setAll({error: error}))
        })
    }
  }

  appendContribution(newContribution) {
    this.setState(prevState => {
      let newContributions = [...prevState.contributions];
      newContributions.push({ ...newContribution });
      return { ...prevState, contributions: newContributions }
    })
  }

  retrieveContributions() {
    this.props.client.getContributions(this.props.projectId, this.props.issueIid)
      .then(resp => {
        if (!this._mounted) return;
        this.setState((prevState, props) => {
          return { contributions: resp.data }
        });
      }).catch(error => {
         this.setState((prevState, props) => {
          return { contributions: [] }
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
    let titleText = this.props.title || 'no title';
    const title = <NavLink activeClassName="selected-issue" to={issueUrl}>
      {titleText}
    </NavLink>

    return <ListGroupItem action className="pr-0 pl-0 pt-1 pb-1" style={{ border: "none" }}>
      <Row>
        <Col sm={8} md={8}>
          <div className="d-flex project-list-row mb-3">
            <div className="mr-2">
              <UserAvatar size="lg" person={this.props.author} />
            </div>
            <div className="issue-text-crop">
              <b>
                <span className="issue-title">
                  {title}
                </span>
              </b><br />
              <span className="issues-description">
                {this.props.description}
              </span>
            </div>
          </div>
        </Col>
        <Col sm={4} md={4} className="float-right" style={{ textAlign: "end" }}>
          <FontAwesomeIcon icon={faComments} /> {this.props.user_notes_count} {issueState}
          <br />
          <small><TimeCaption caption="Updated" time={this.props.updated_at} /></small>
        </Col>
      </Row>
    </ListGroupItem>
  }
}

class IssueList extends Component {
  render() {
    const { issues, user } = this.props;
    const rows = issues.map((d, i) =>
      <IssueListRow key={i} {...d} issueBaseUrl={this.props.collaborationUrl} projectId={this.props.projectId} />);
    return [
      <Row key="header" className="pb-3">
        <Col sm={6}><h2>Issues</h2></Col>
        <Col sm={6}>
          {
            (user.logged) ?
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
      projectId={this.props.projectId} {...this.props} />
  }
}

export default { New, View, List };
