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

import { Component } from "react";

import { API_ERRORS } from "../api-client";
import { FileLineage as FileLineagePresent } from "./Lineage.present";

class FileLineage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
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
    this.retrieveFile();
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
        accessLevel={this.props.accessLevel}
        currentNode={this.state.currentNode}
        error={this.state.error}
        filePath={`/projects/${this.props.projectPath}/files/blob/${this.props.path}`}
        fileSize={fileSize}
        graph={this.state.graph}
        retrieveGraph={this.retrieveGraph.bind(this)}
        {...this.props}
      />
    );
  }
}

export { FileLineage };
