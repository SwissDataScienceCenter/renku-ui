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
import { SimpleChange, NotebookComparisonPresent } from './MergeRequest.present';
import Notebook from '../file/Notebook'
import { Button } from 'reactstrap'

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
    const mergeButton = <Button
      color="primary" onClick={event => {
        event.preventDefault();
        this.merge.bind(this)()
      }}>
      {'Accept Changes'}
    </Button>;

    const changes = this.state.changes.map((change, i) => {
      if (change.new_path.split('.').pop() !== 'ipynb') {
        return <SimpleChange {...change} key={i}/>
      }

      //TODO: What if a notebook has been modified and renamed at the same time?
      return <NotebookComparisonContainer
        key={i} {...this.props}
        filePath={change.new_path}
        ref1={this.state.target_branch}
        ref2={this.state.source_branch}
      />;
    });
    return <span>
      {mergeButton}
      {changes}
    </span>;
  }
}

class NotebookComparisonContainer extends Component {
  render() {
    const notebook1 = <Notebook.Show {...this.props} branchName={this.props.ref1} />;
    const notebook2 = <Notebook.Show {...this.props} branchName={this.props.ref2} />;

    return <NotebookComparisonPresent leftNotebookComponent={notebook1} rightNotebookComponent={notebook2} />;
  }
}

export { MergeRequestContainer }
