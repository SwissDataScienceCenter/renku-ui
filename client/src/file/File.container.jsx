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
import { ShareLinkSessionIcon } from "../components/shareLinkSession/ShareLinkSession";
import SessionFileButton from "../features/session/components/SessionFileButton";
import { ShowFile as ShowFilePresent, StyledNotebook } from "./File.present";

class JupyterNotebookContainer extends Component {
  render() {
    let filePath = this.props.filePath;
    if (filePath && filePath[0] !== "/") filePath = "/" + filePath;

    return (
      <StyledNotebook
        fileName={this.props.filePath.replace(/^.*(\\|\/|:)/, "")}
        notebook={this.props.notebook}
        client={this.props.client}
      />
    );
  }
}

/**
 * File content display container component
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {string} filePath - path to the file - for the JupyterNotebook button. See docs for JupyterButton
 * @param {string} branch - optional branch name, defaults to master
 * @param {Object} branches - for the JupyterNotebook button. See docs for JupyterButton
 */
class ShowFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: null, commit: null, error: null, fileInfo: null };
  }

  // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
  componentDidMount() {
    this._isMounted = true;
    this.retrieveFile();
  }

  componentDidUpdate() {
    // save information about the file once available
    if (this.props.filesTree && this.props.filesTree.hash) {
      const path = this.props.filePath.endsWith("/")
        ? this.props.filePath.substring(0, this.props.filePath.length - 1)
        : this.props.filePath;
      const fileInfo = this.props.filesTree.hash[path];
      if (fileInfo) {
        if (!this.state.fileInfo) this.setState({ fileInfo });
        else if (fileInfo.path !== this.state.fileInfo.path)
          this.setState({ fileInfo });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  retrieveFile() {
    const client = this.props.client;
    const branch = this.props.branch;
    let filePath = this.props.filePath;
    client
      .getRepositoryFile(this.props.projectId, filePath, branch, "base64")
      .catch((e) => {
        if (!this._isMounted) return null;
        if (e.case === API_ERRORS.notFoundError)
          this.setState({
            error:
              "ERROR 404: The file with path '" +
              this.props.filePath +
              "' does not exist.",
          });
        else
          this.setState({
            error: "Could not load file with path " + this.props.filePath,
          });
      })
      .then((json) => {
        if (!this._isMounted) return null;
        if (!this.state.error) this.setState({ file: json });
        return json;
      })
      .then((fileJson) => {
        if (fileJson == null) return;
        const commitId = fileJson.last_commit_id
          ? fileJson.last_commit_id
          : fileJson.commit_id;
        return client.getRepositoryCommit(this.props.projectId, commitId);
      })
      .then((commitJson) => {
        if (!this._isMounted) return null;
        this.setState({ commit: commitJson });
      });
  }

  render() {
    const gitLabFilePath = this.props.filePath;
    let filePath = gitLabFilePath;

    if (this.state.error !== null)
      filePath = this.props.filePath.split("\\").pop().split("/").pop();

    const buttonJupyter = this.props.filePath.endsWith(".ipynb") ? (
      <SessionFileButton filePath={this.props.filePath} />
    ) : null;
    const filters = {
      namespace: this.props.projectNamespace,
      project: this.props.projectPath,
      branch: this.props.branch ? { name: this.props.branch } : undefined,
      commit: this.state.commit,
    };
    const buttonShareLinkSession =
      !this.state.fileInfo || this.state.fileInfo?.type === "tree" ? null : (
        <ShareLinkSessionIcon
          filters={filters}
          filePath={filePath}
          launchNotebookUrl={this.props.launchNotebookUrl}
        />
      );

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

    const previewThreshold = this.props.params.PREVIEW_THRESHOLD;

    return (
      <ShowFilePresent
        externalUrl={this.props.externalUrl}
        filePath={filePath}
        gitLabFilePath={gitLabFilePath}
        lineagesPath={this.props.lineagesPath}
        branches={this.props.branches}
        buttonJupyter={buttonJupyter}
        buttonShareLinkSession={buttonShareLinkSession}
        file={this.state.file}
        commit={this.state.commit}
        error={this.state.error}
        projectId={this.props.projectId}
        client={this.props.client}
        insideProject={true}
        projectPathWithNamespace={this.props.projectPathWithNamespace}
        hashElement={this.props.hashElement}
        fileSize={fileSize}
        history={this.props.history}
        previewThreshold={previewThreshold}
        fileInfo={this.state.fileInfo}
        branch={this.props.branch}
      />
    );
  }
}

export { JupyterNotebookContainer as JupyterNotebook, ShowFile };
