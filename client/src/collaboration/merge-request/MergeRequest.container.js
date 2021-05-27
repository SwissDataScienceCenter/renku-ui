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

import React, { Component } from "react";
import { NotebookComparisonPresent, MergeRequestPresent } from "./MergeRequest.present";
import Notebook from "../../file/Notebook";
import { ACCESS_LEVELS } from "../../api-client";
import { mergeRequestRowInfo } from "../lists-old/MergeRequestList.present";

class MergeRequestContainer extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      changes: [],
      author: { name: "" },
      contributions: [],
      commits: []
    };
  }

  // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
  componentDidMount() {
    this._isMounted = true;
    this.retrieveChanges();
    this.retrieveContributions();
    this.retrieveCommits();
  }

  retrieveChanges() {
    this.props.client.getMergeRequestChanges(this.props.projectId, this.props.iid)
      .then(resp => {
        if (this._isMounted) this.setState({ ...resp.data });
      });
  }

  appendContribution(newContribution) {
    this.setState(prevState => {
      let newContributions = [...prevState.contributions];
      newContributions.push({ ...newContribution });
      return { ...prevState, contributions: newContributions };
    });
  }

  retrieveContributions() {
    this.props.client.getDiscussions(this.props.projectId, this.props.iid)
      .then(resp => {
        if (!this._isMounted) return;
        this.setState((prevState, props) => {
          return { contributions: resp.data };
        });
      }).catch(error => {
        this.setState((prevState, props) => {
          return { contributions: [] };
        });
      });
  }

  retrieveCommits() {
    this.props.client.getMergeRequestCommits(this.props.projectId, this.props.iid)
      .then(resp => {
        if (!this._isMounted) return;
        this.setState((prevState, props) => {
          return { commits: resp.data };
        });
      }).catch(error => {
        this.setState((prevState, props) => {
          return { commits: [] };
        });
      });
  }

  merge() {
    this.props.client.mergeMergeRequest(this.props.projectId, this.props.iid)
      .then(() => {
        this.props.updateProjectState();
        this.props.history.push(`/projects/${this.props.projectPathWithNamespace}/collaboration/mergerequests`);
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {

    const externalMROverviewUrl = `${this.props.externalUrl}/merge_requests`;
    const externalMRUrl = `${externalMROverviewUrl}/${this.props.iid}/diffs`;

    const notebookComparisonView = (change, i) => {
      return <NotebookComparisonContainer
        key={i} {...this.props}
        filePath={change.new_path}
        ref1={this.state.target_branch}
        ref2={this.state.source_branch} />;
    };

    const rowInfo = mergeRequestRowInfo(this.state);

    const showMergeButton = (this.state.closed_at == null) &&
      (this.state.merged_at == null) &&
      this.state.merge_status === "can_be_merged" && this.props.accessLevel >= ACCESS_LEVELS.DEVELOPER;

    return <MergeRequestPresent
      title={this.state.title}
      author={this.state.author}
      location={this.props.location}
      externalUrl={this.props.externalUrl}
      externalMRUrl={externalMRUrl}
      externalMROverviewUrl={externalMROverviewUrl}
      changes={this.state.changes}
      commits={this.state.commits}
      notebookComparisonView={notebookComparisonView}
      source_branch={this.state.source_branch}
      target_branch={this.state.target_branch}
      onMergeClick={this.merge.bind(this)}
      showMergeButton={showMergeButton}
      mergeRequestRowInfo={rowInfo}
      contributions={this.state ? this.state.contributions : []}
      client={this.props.client}
      iid={this.props.iid}
      appendContribution={this.appendContribution.bind(this)}
      projectId={this.props.projectId}
      mergeRequestsOverviewUrl={this.props.mergeRequestsOverviewUrl}
      history={this.props.history}
      mergeRequestUrl={this.props.mergeRequestUrl}
      mergeRequestDiscussionUrl={this.props.mergeRequestDiscussionUrl}
      mergeRequestChangesUrl={this.props.mergeRequestChangesUrl}
      mergeRequestCommitsUrl={this.props.mergeRequestCommitsUrl}
    />;
  }
}

class NotebookComparisonContainer extends Component {
  render() {
    const notebook1 = <Notebook.Show {...this.props} accessLevel={0} branchName={this.props.ref1} />;
    const notebook2 = <Notebook.Show {...this.props} accessLevel={0} branchName={this.props.ref2} />;

    return <NotebookComparisonPresent
      filePath={this.props.filePath}
      leftNotebookComponent={notebook1}
      rightNotebookComponent={notebook2}
    />;
  }
}

export { MergeRequestContainer };
