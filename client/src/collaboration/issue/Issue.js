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

import React, { Component } from "react";
import { Provider, connect } from "react-redux";
import { Row, Col, Button, Alert } from "reactstrap";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import { faBoxOpen, faBox } from "@fortawesome/free-solid-svg-icons";
import { API_ERRORS } from "../../api-client";
import { createStore } from "../../utils/EnhancedState";
import State from "./Issue.state";
import {
  ExternalIconLink, RenkuMarkdown, TimeCaption, TooltipToggleButton, GoBackButton
} from "../../utils/UIComponents";
import { Contribution, NewContribution } from "../../contribution";
import { Loader } from "../../utils/UIComponents";
import { issueFormSchema } from "../../model/RenkuModels";
import { FormGenerator } from "../../utils/formgenerator";
import _ from "lodash";

let iFormSchema = _.cloneDeep(issueFormSchema);

function New(props) {

  if (iFormSchema == null)
    iFormSchema = _.cloneDeep(issueFormSchema);

  const issuesUrl = `/projects/${props.projectPathWithNamespace}/collaboration/issues`;

  const onCancel = (e, handlers) => {
    handlers.removeDraft();
    props.history.push({ pathname: issuesUrl });
  };

  const submitData = (mappedInputs) => {
    let body = {};
    body.confidential = mappedInputs.visibility === "restricted";
    body.title = mappedInputs.title;
    body.description = mappedInputs.description;
    return [props.projectPathWithNamespace, body];
  };

  const submitCallback = (e, mappedInputs, handlers) => {
    handlers.setSubmitLoader({ value: true, text: "Creating issue, please wait..." });
    props.client.postProjectIssue(...submitData(mappedInputs))
      .then(newIssue => {
        handlers.removeDraft();
        handlers.setSubmitLoader({ value: false, text: "" });
        props.history.push({ pathname: issuesUrl });
      }).catch(error=> {
        handlers.setSubmitLoader({ value: false, text: "" });
        handlers.setServerErrors(error.message);
      });
  };

  return (
    <Row>
      <Col md={8}>
        <FormGenerator
          title="Create Issue"
          btnName="Create Issue"
          submitCallback={submitCallback}
          model={iFormSchema}
          modelTop={props.model}
          formLocation={props.location.pathname}
          onCancel={onCancel} />
      </Col>
    </Row>
  );
}

class IssueViewHeader extends Component {

  render() {
    if (this.props.error !== undefined && this.props.error.case === API_ERRORS.notFoundError) {
      return <Alert color="danger">Error 404: The issue that was selected does not exist or could not be accessed.
        <br /> <br /> You can go back to the issues list and see available issues for this project. &nbsp;
        <Button color="danger" size="sm"
          onClick={() => this.props.history.push(this.props.issuesUrl)}>Back to list</Button>
      </Alert>;
    }

    if (this.props.error !== undefined) {
      return <Alert color="danger">Error: There was an error retrieving the issue.
        <br /> <br /> You can go back to the issues list and see available issues for this project. &nbsp;
        <Button color="danger" size="sm"
          onClick={() => this.props.history.push(this.props.issuesUrl)}>Back to list</Button>
      </Alert>;
    }

    if (this.props.title === undefined)
      return <Loader />;

    const title = this.props.title || "no title";
    const description = this.props.description || " ";
    const buttonText = this.props.state === "opened" ? "Close" : "Re-open";
    const externalUrl = this.props.externalUrl;
    const externalIssueUrl = `${externalUrl}/issues/${this.props.iid}`;
    const time = this.props.created_at;
    const author = this.props.author ? this.props.author.username : null;
    const buttonGit = <ExternalIconLink tooltip="Open in GitLab" icon={faGitlab} to={externalIssueUrl} />;

    const actionButton =
      <TooltipToggleButton
        onClick={this.props.onIssueStateChange} tooltip={`${buttonText} Issue`}
        active={this.props.state === "opened"}
        activeIcon={faBoxOpen} inactiveIcon={faBox}
        activeClass="text-success" inactiveClass="text-primary" />;

    return <div>
      <GoBackButton label="Back to list" url={this.props.issuesUrl}/>
      <Row key="title" className="pb-2">
        <Col sm={8} style={{ overflow: "hidden" }}>
          <h3>{title}</h3>
        </Col>
        <Col sm={3} className="float-right pt-3" style={{ textAlign: "end" }}>
          {buttonGit}
          {actionButton}
        </Col>
      </Row>
      <Row key="description" className="pb-2">
        <Col sm={11}>
          <RenkuMarkdown
            projectPathWithNamespace={this.props.projectPathWithNamespace}
            filePath={""}
            fixRelativePaths={true}
            // change to default branch if this class is used
            branch={"master"}
            markdownText={description}
            client={this.props.client}
            projectId={this.props.projectId}
          />
        </Col>
      </Row>
      <Row key="info">
        <Col style={{ borderBottom: "1px solid #dee2e6" }} className="pb-1">
          <span className="caption align-baseline">
            <TimeCaption key="timeCaption" caption="Created" time={time} endCaption={"by @" + author}/>
          </span>
        </Col>
      </Row>
    </div>;
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
    if (this.props.state === "opened") components.push(<NewContribution key="newContribution" {...this.props} />);
    return components;
  }
}

class View extends Component {

  constructor(props) {
    super(props);
    this._mounted = false;
    this.store = createStore(State.View.reducer);
    this.store.dispatch(this.retrieveIssue());
    this.state = { contributions: [] };
  }

  async componentDidMount() {
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
          dispatch(State.View.setAll(resp.data));
        }).catch(error => {
          dispatch(State.View.setAll({ error: error }));
        });
    };
  }

  appendContribution(newContribution) {
    this.setState(prevState => {
      let newContributions = [...prevState.contributions];
      newContributions.push({ ...newContribution });
      return { ...prevState, contributions: newContributions };
    });
  }

  async retrieveContributions() {
    const { client, projectId, issueIid, user, projectPathWithNamespace } = this.props;
    let contributions;
    try {
      // use different query for anonymous and logged user
      if (user.logged) {
        const resp = await client.getContributions(projectId, issueIid);
        contributions = resp.data;
      }
      else {
        const resp = await client.getContributionsAnonymous(projectPathWithNamespace, issueIid);
        contributions = resp.data.map(item => item.notes[0]);
      }
      if (!this._mounted)
        return;
      this.setState({ contributions });
    }
    catch (e) {
      this.setState({ contributions: [] });
    }
  }


  mapStateToProps(state, ownProps) {
    return state;
  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onIssueStateChange: (e) => {
        e.preventDefault();
        const issueState = this.store.getState().state;

        // FIXME: This is a terrible hack which relies on the issue being updated on the server before force-updating
        // FIXME: the entire project component. The problem here ist that the Issue list and the Issue detail components
        // FIXME: are siblings and they both hold the same information in their state (which is therefore duplicated).
        // FIXME: On click, the respective state information in both siblings state needs to be updated.
        // FIXME: The proper solution would be to elevate this information to the state their common parent and update
        // FIXME: it there.

        if (issueState === "opened") {
          this.props.client.closeIssue(this.props.projectId, this.props.issueIid)
            .then(() => this.props.updateProjectView());
        }
        else if (issueState === "closed") {
          this.props.client.reopenIssue(this.props.projectId, this.props.issueIid)
            .then(() => this.props.updateProjectView());
        }
        else {
          throw Error(`Unknown state ${this.props.state}`);
        }
        // We don't even need to dispatch anything as the entire project component needs to be re-rendered
        // (and the information reloaded from the server) anyway.
        // dispatch(State.View.IssueState.change());
      }
    };
  }

  render() {
    const VisibleIssueView = connect(this.mapStateToProps, this.mapDispatchToProps.bind(this))(IssueView);
    let propsNoStore = { ...this.props, store: null };
    return <Provider key="new" store={this.store}>
      <VisibleIssueView
        contributions={this.state ? this.state.contributions : []}
        appendContribution={this.appendContribution.bind(this)}
        expanded={this.state ? this.state.expanded : false}
        {...propsNoStore} />
    </Provider>;
  }
}

export default { New, View };
