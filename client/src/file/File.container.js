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

import { StyledNotebook, JupyterButtonPresent, ShowFile as ShowFilePresent } from "./File.present";
import { API_ERRORS } from "../api-client";
import { ShareLinkSessionIcon } from "../utils/components/shareLinkSession/ShareLinkSession";


class JupyterNotebookContainer extends Component {
  render() {
    let filePath = this.props.filePath;
    if (filePath && filePath[0] !== "/") filePath = "/" + filePath;

    return <StyledNotebook
      fileName={this.props.filePath.replace(/^.*(\\|\/|:)/, "")}
      notebook={this.props.notebook}
      client={this.props.client}
    />;
  }
}

/**
 * Jupyter button container component
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} Object - user object
 * @param {Object} branches - branches data, likely to change in a future release
 * @param {Object} branches.all - list of available branches
 * @param {Object} branches.fetch - function to invoke to refresh branches
 * @param {string} scope.projectNamespace - full path of the reference namespace
 * @param {string} scope.projectPath - path of the reference project
 * @param {string} filePath - relative path of the target notebook file
 * @param {string} launchNotebookUrl - launch notebook url
 */
class JupyterButton extends React.Component {
  componentDidMount() {
    // fetch branches if needed
    if (this.props.user.logged) {
      const { branches } = this.props;
      if (!branches.all.fetched || !branches.all.fetching)
        branches.fetch();
    }
  }

  // we might not need this piece of code if we want to use branches in general
  getDefaultBranch() {
    const { branches, defaultBranch } = this.props;

    // return if we don't have branches (not fetched yet)
    if (!branches.all.standard.length)
      return null;

    // return the full branch object corresponding to the default -- if any is set (this is generally the case)
    if (defaultBranch) {
      const defaultBranchObject = branches.all.standard.find(branch => branch.name === defaultBranch);
      if (defaultBranchObject)
        return defaultBranchObject;
    }

    return branches.all.standard[0]?.name;
  }

  getScope() {
    const scope = {
      namespace: this.props.projectNamespace,
      project: this.props.projectPath,
    };
    // TODO: plug in branch coming from project page when it available
    scope.branch = this.getDefaultBranch();
    return scope;
  }

  render() {
    const { branches, file, user } = this.props;

    // anonymous users can't currently use this feature
    if (!user.logged) {
      return (
        <JupyterButtonPresent
          access={false}
          launchNotebookUrl={this.props.launchNotebookUrl}
        />
      );
    }

    let updating = false;
    if (branches.all.fetching || !branches.all.standard.length)
      updating = true;

    let filePath = "";
    if (file) {
      if (file.file_path)
        filePath = file.file_path;
      else
        filePath = file;
    }

    return (
      <JupyterButtonPresent
        client={this.props.client}
        model={this.props.model}
        access={true}
        scope={this.getScope()}
        filePath={filePath}
        updating={updating}
        location={this.props.location}
        launchNotebookUrl={this.props.launchNotebookUrl} />
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
      const path = this.props.filePath.endsWith("/") ?
        this.props.filePath.substring(0, this.props.filePath.length - 1) :
        this.props.filePath;
      const fileInfo = this.props.filesTree.hash[path];
      if (fileInfo) {
        if (!this.state.fileInfo)
          this.setState({ fileInfo });
        else if (fileInfo.path !== this.state.fileInfo.path)
          this.setState({ fileInfo });
      }
    }
  }

  componentWillUnmount() { this._isMounted = false; }

  retrieveFile() {
    const client = this.props.client;
    const branch = this.props.branch;
    let filePath = this.props.filePath;
    client.getRepositoryFile(this.props.projectId, filePath, branch, "base64")
      .catch(e => {
        if (!this._isMounted) return null;
        if (e.case === API_ERRORS.notFoundError)
          this.setState({ error: "ERROR 404: The file with path '" + this.props.filePath + "' does not exist." });

        else this.setState({ error: "Could not load file with path " + this.props.filePath });
      })
      .then(json => {
        if (!this._isMounted) return null;
        if (!this.state.error)
          this.setState({ file: json });
        return json;
      }).then(fileJson => {
        if (fileJson == null) return;
        const commitId = fileJson.last_commit_id ?
          fileJson.last_commit_id :
          fileJson.commit_id;
        return client.getRepositoryCommit(this.props.projectId, commitId);
      }).then(commitJson => {
        if (!this._isMounted) return null;
        this.setState({ commit: commitJson });
      });
  }

  render() {
    const gitLabFilePath = this.props.filePath;
    let filePath = gitLabFilePath;

    if (this.state.error !== null)
      filePath = this.props.filePath.split("\\").pop().split("/").pop();


    let buttonJupyter = null;
    if (this.props.filePath.endsWith(".ipynb"))
      buttonJupyter = (<JupyterButton {...this.props} file={filePath}/>);
    const filters = {
      namespace: this.props.projectNamespace,
      project: this.props.projectPath,
      branch: this.props.branch ? { name: this.props.branch } : undefined,
      commit: this.state.commit,
    };
    const buttonShareLinkSession =
      !this.state.fileInfo || this.state.fileInfo?.type === "tree" ? null :
        (<ShareLinkSessionIcon
          filters={filters} filePath={filePath} launchNotebookUrl={this.props.launchNotebookUrl} />);

    let fileSize = this.state.file ? this.state.file.size : undefined;

    // If the file is LFS this means that to get the real file size we need to read
    // the file string we get with the LFS info
    if (this.props.hashElement && this.props.hashElement.isLfs && this.state.file) {
      const splitFile = atob(this.state.file.content).split("size ");
      if (splitFile.length === 2)
        fileSize = splitFile[splitFile.length - 1];
    }

    const previewThreshold = this.props.params.PREVIEW_THRESHOLD;

    return <ShowFilePresent
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
    />;
  }
}

export { JupyterNotebookContainer as JupyterNotebook, JupyterButton, ShowFile };
