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

import React, { Component } from "react";

import { API_ERRORS } from "../api-client";
import { GraphIndexingStatus } from "../project/Project";
import { FileLineage as FileLineagePresent } from "./Lineage.present";

class FileLineage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      graphStatusPoller: null,
      graphStatusWaiting: false,
      webhookJustCreated: null,
      graph: null,
      currentNode: { id: null, type: null },
      file: null,
    };
  }

  componentDidMount() {
    // TODO This should work a little differently for robustness:
    // - Get the dot/master deployment URL (environment external_url) from gitlab
    // - Get the job from gitlab
    // - Combine the file name from the external_url and the job information to retrieve the file
    // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
    this._isMounted = true;
    this.retrieveGraph();
    this.startPollingProgress();
    this.retrieveFile();
  }

  componentWillUnmount() {
    if (this._isMounted) this.stopPollingProgress();

    this._isMounted = false;
  }

  async startPollingProgress() {
    if (this._isMounted && !this.state.graphStatusPoller) {
      this.props.fetchGraphStatus().then((progress) => {
        if (
          this._isMounted &&
          !this.state.graphStatusPoller &&
          progress !== GraphIndexingStatus.MAX_VALUE &&
          progress !== GraphIndexingStatus.NO_WEBHOOK
        ) {
          const poller = setInterval(this.checkStatus, 2000);
          this.setState({ graphStatusPoller: poller });
        }
      });
    }
  }

  stopPollingProgress() {
    const { graphStatusPoller } = this.state;
    if (this._isMounted && graphStatusPoller) {
      clearTimeout(graphStatusPoller);
      this.setState({ graphStatusPoller: null });
    }
  }

  checkStatus = () => {
    if (this._isMounted && !this.state.graphStatusWaiting) {
      this.setState({ graphStatusWaiting: true });
      this.props.fetchGraphStatus().then((progress) => {
        if (this._isMounted) {
          this.setState({ graphStatusWaiting: false });
          if (
            progress === GraphIndexingStatus.MAX_VALUE ||
            progress === GraphIndexingStatus.NO_WEBHOOK
          ) {
            this.stopPollingProgress();
            if (progress === GraphIndexingStatus.MAX_VALUE)
              this.retrieveGraph();
          }
        }
      });
    }
  };

  createWebhook(e) {
    this.setState({ webhookJustCreated: true });
    this.props.createGraphWebhook(e).then(() => {
      if (this._isMounted) {
        // remember that the graph status endpoint is not updated instantly, better adding a short timeout
        setTimeout(() => {
          if (this._isMounted) this.startPollingProgress();
        }, 1000);
        // updating this state slightly later avoids UI flickering
        setTimeout(() => {
          if (this._isMounted) this.setState({ webhookJustCreated: false });
        }, 1500);
      }
    });
  }

  async retrieveGraph() {
    if (!this.props.projectPath) return;
    try {
      this.props.client
        .getFileLineage(this.props.projectPath, this.props.path)
        .then((graph) => {
          if (this._isMounted) {
            if (!graph) {
              this.setState({ graph: { edges: [], nodes: [] } });
            } else {
              let currentNode = { id: null, type: null };
              graph.nodes.forEach((node) => {
                if (
                  (node.type === "Directory" || node.type === "File") &&
                  node.location === this.props.path
                )
                  currentNode = node;
              });
              this.setState({ graph, currentNode });
            }
          }
        })
        .catch((error) => {
          this.handleFileLineageError(error);
        });
    } catch (error) {
      this.handleFileLineageError(error);
    }
  }

  handleFileLineageError(error) {
    if (this._isMounted) {
      if (error.case === API_ERRORS.notFoundError)
        this.setState({ error: "No lineage information." });
      else this.setState({ error: "Could not load lineage." });
    }
  }

  //WE DO THIS SO WE CAN GET THE FILE SIZE!!!
  retrieveFile() {
    const client = this.props.client;
    const branch = this.props.branch;
    let filePath = this.props.gitFilePath;
    // The projectId has not yet been retrieved; this function will be called again
    if (this.props.projectId == null) return;

    client
      .getRepositoryFile(this.props.projectId, filePath, branch, "base64")
      .catch((e) => {
        if (!this._isMounted) return null;
        if (e.case !== API_ERRORS.notFoundError)
          this.setState({ error: "Could not load file with path " + filePath });
      })
      .then((json) => {
        if (!this._isMounted) return null;
        if (!this.state.error) this.setState({ file: json });
        return json;
      });
  }

  render() {
    let fileSize = this.state.file ? this.state.file.size : undefined;

    // If the file is LFS this means that to get the real file size we need to read
    // the file string we get with the LFS info
    if (
      this.props.hashElement &&
      this.props.hashElement.isLfs &&
      this.state.file
    ) {
      const splitFile = atob(this.state.file.content).split("size ");
      if (splitFile.length === 2) fileSize = splitFile[splitFile.length - 1];
    }

    return (
      <FileLineagePresent
        retrieveGraph={this.retrieveGraph.bind(this)}
        graph={this.state.graph}
        error={this.state.error}
        createWebhook={this.createWebhook.bind(this)}
        webhookJustCreated={this.state.webhookJustCreated}
        filePath={`/projects/${this.props.projectPathWithNamespace}/files/blob/${this.props.path}`}
        currentNode={this.state.currentNode}
        accessLevel={this.props.accessLevel}
        {...this.props}
        fileSize={fileSize}
      />
    );
  }
}

export { FileLineage };
