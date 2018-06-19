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

import React, { Component } from 'react';
import { SimpleChange, NotebookComparisonPresent, MergeRequestPresent } from './MergeRequest.present';
import Notebook from '../file/Notebook'

class MergeRequestContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      changes: []
    }
  }

  // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
  componentDidMount() {
    this._isMounted = true;
    this.props.client.getMergeRequestChanges(this.props.projectId, this.props.iid)
      .then(d => {
        if (this._isMounted) this.setState({...d});
      });
  }

  merge() {
    this.props.client.mergeMergeRequest(this.props.projectId, this.props.iid)
      .then(() => {
        this.props.history.push(`/projects/${this.props.projectId}/mergeRequests`)
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {

    const externalMRUrl = `${this.props.externalUrl}/merge_requests/${this.props.iid}/diffs`

    const simpleChanges = this.state.changes
      .filter((change) => change.new_path.split('.').pop() !== 'ipynb')
      .map((change, i) => <SimpleChange {...change} key={i}/>);

    const notebookChanges = this.state.changes
      .filter((change) => change.new_path.split('.').pop() === 'ipynb')
      .map((change, i) => {
      //TODO: What if a notebook has been modified and renamed at the same time?
        return <NotebookComparisonContainer
          key={i} {...this.props}
          filePath={change.new_path}
          ref1={this.state.target_branch}
          ref2={this.state.source_branch}
        />;
      });
    return <MergeRequestPresent
      title={this.state.title}
      externalMRUrl={externalMRUrl}
      simpleChanges={simpleChanges}
      notebookChanges={notebookChanges}
      source_branch={this.state.source_branch}
      target_branch={this.state.target_branch}
      onMergeClick={this.merge.bind(this)}
      canBeMerged={this.state.merge_status === 'can_be_merged'}
    />
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

export { MergeRequestContainer }
