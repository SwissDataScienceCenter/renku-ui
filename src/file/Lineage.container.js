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
import { API_ERRORS } from '../api-client';
import { GraphIndexingStatus } from '../project/Project';

import { FileLineage as FileLineagePresent } from './Lineage.present';

class FileLineage extends Component {
  constructor(props){
    super(props);
    this.state = {
      error: null,
      graphStatusPoller: null,
      graphStatusWaiting: false,
      webhookJustCreated: null
    };
  }

  componentDidMount() {
    // TODO This should work a little differently for robustness:
    // - Get the dot/master deployment URL (environment external_url) from gitlab
    // - Get the job from gitlab
    // - Combine the file name from the external_url and the job information to retreive the file
    // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
    this._isMounted = true;
    this.retrieveGraph();
    this.startPollingProgress();
  }

  componentWillUnmount() {
    if (this._isMounted) {
      this.stopPollingProgress();
    }
    this._isMounted = false;
  }

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

  async startPollingProgress() {
    if (this._isMounted && !this.state.graphStatusPoller) {
      this.props.fetchGraphStatus().then((progress) => {
        if (this._isMounted && !this.state.graphStatusPoller &&
          progress !== GraphIndexingStatus.MAX_VALUE &&
          progress !== GraphIndexingStatus.NO_WEBHOOK) {
          const poller = setInterval(this.checkStatus, 2000);
          this.setState({graphStatusPoller: poller});
        }
      });
    }
  }

  stopPollingProgress() {
    const {graphStatusPoller} = this.state;
    if (this._isMounted && graphStatusPoller) {
      clearTimeout(graphStatusPoller);
      this.setState({graphStatusPoller: null});
    }
  }


  checkStatus = () => {
    if (this._isMounted && !this.state.graphStatusWaiting) {
      this.setState({graphStatusWaiting: true});
      this.props.fetchGraphStatus().then((progress) => {
        if (this._isMounted) {
          this.setState({graphStatusWaiting: false});
          if (progress === GraphIndexingStatus.MAX_VALUE || progress === GraphIndexingStatus.NO_WEBHOOK) {
            this.stopPollingProgress();
            if (progress === GraphIndexingStatus.MAX_VALUE) {
              this.retrieveGraph();
            }
          }
        }
      });
    }
  }

  createWebhook(e) {
    this.setState({webhookJustCreated: true});
    this.props.createGraphWebhook(e).then((data) => {
      if (this._isMounted) {
        // remember that the graph status endpoint is not updated instantly, better adding a short timeout
        setTimeout(() => {
          if (this._isMounted) {
            this.startPollingProgress();
          }
        }, 1000);
        // updating this state slightly later avoids UI flickering
        setTimeout(() => {
          if (this._isMounted) {
            this.setState({webhookJustCreated: false});
          }
        }, 1500);
      }
    });
  }

  async retrieveGraph() {
    if (!this.props.projectPath) return;
    try {
      const fileMeta = await this.props.client.getRepositoryFileMeta(this.props.projectId, this.props.path, 'master')
      this.props.client.getFileLineage(this.props.projectPath, fileMeta.lastCommitId, this.props.path)
        .then(response => response.data)
        .then(graph => this.parseNodeIds(graph))
        .then(graph => {
          if (this._isMounted) this.setState({ graph });
        })
    } catch (error) {
      if (error.case === API_ERRORS.notFoundError) {
        console.error("load graph:", error);
        if (this._isMounted)
          this.setState({ error: 'ERROR 404: Could not load lineage. The file with path ' + this.props.filePath + ' does not exist."' });
      } else {
        console.error("load graph:", error);
        if (this._isMounted)
          this.setState({ error: 'Could not load lineage.' });
      }
    }
  }

  render() {
    return <FileLineagePresent 
      graph={this.state.graph} 
      error={this.state.error} 
      createWebhook={this.createWebhook.bind(this)}
      webhookJustCreated={this.state.webhookJustCreated}
      filePath={this.props.match.url+'/files/blob/'+this.props.path} 
      accessLevel={this.props.accessLevel}
      {...this.props} />
  }
}

export { FileLineage };
