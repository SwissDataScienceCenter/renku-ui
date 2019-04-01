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

import React, { Component } from 'react';

import { FileLineage as FileLineagePresent } from './Lineage.present';

class FileLineage extends Component {
  constructor(props){
    super(props);
    this.state = {error: null}
  }

  componentDidMount() {
    // TODO This should work a little differently for robustness:
    // - Get the dot/master deployment URL (environment external_url) from gitlab
    // - Get the job from gitlab
    // - Combine the file name from the external_url and the job information to retreive the file
    // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
    this._isMounted = true;
    this.retrieveGraph();
  }

  componentWillUnmount() { this._isMounted = false;  }

  parseNodeIds(graph) {
    // regex to split file:///<type>/<commitSha><path>
    const nodeRegex = /\/\/\/([^/]*)\/([^/]*)(.*)/;
    graph.nodes.forEach(node => {
      const matches = nodeRegex.exec(node.id)
      node.type = matches[1]
      node.commitSha = matches[2]
      if (matches[3]) node.filePath = matches[3]
    })
    return graph;
  }

  async retrieveGraph() {
    if (!this.props.projectPath) return;
    try {
      const fileMeta = await this.props.client.getRepositoryFileMeta(this.props.projectId, this.props.path, 'master')
      this.props.client.getFileLineage(this.props.projectPath, fileMeta.lastCommitId, this.props.path)
        .then(response => response.data)
        .then(graph => this.parseNodeIds(graph))
        .then(graph => {
          if (this._isMounted) this.setState({graph});
        })
    } catch(error) {
      console.error("load graph:", error);
      if (this._isMounted) this.setState({error: 'Could not load lineage.'});
    }
  }

  render() {
    return <FileLineagePresent 
      graph={this.state.graph} 
      error={this.state.error} 
      filePath={this.props.match.url+'/files/blob/'+this.props.path} 
      {...this.props} />
  }
}

export { FileLineage };