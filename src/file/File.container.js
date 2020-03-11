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
import ReactDOM from "react-dom";
import hljs from "highlight.js";

import { atobUTF8 } from "../utils/Encoding";
import { StyledNotebook, JupyterButtonPresent, ShowFile as ShowFilePresent } from "./File.present";
import { ACCESS_LEVELS } from "../api-client";
import { StatusHelper } from "../model/Model";
import { API_ERRORS } from "../api-client";
import { RenkuMarkdown } from "../utils/UIComponents";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "tiff", "pdf", "gif"];
const CODE_EXTENSIONS = [
  "py", "js", "json", "sh", "r", "txt", "yml", "csv", "parquet", "cwl", "job", "prn", "rout",
  "dcf", "rproj", "rst", "bat", "ini", "rmd"
];

// FIXME: Unify the file viewing for issues (embedded) and independent file viewing.
// FIXME: Javascript highlighting is broken for large files.
// FIXME: Fix positioning of input tags when rendering Jupyter Notebooks.

class FilePreview extends React.Component {

  getFileExtension = () => {
    if (!this.props.file)
      return null;

    if (this.props.file.file_name.match(/\.(.*)/) === null)
      return null;
    return this.props.file.file_name.split(".").pop().toLowerCase();

  };

  fileIsCode = () => CODE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileIsImage = () => IMAGE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileHasNoExtension = () => this.getFileExtension() === null;

  highlightBlock = () => {
    // FIXME: Usage of findDOMNode is discouraged.
    // eslint-disable-next-line
    const baseNode = ReactDOM.findDOMNode(this);
    hljs.highlightBlock(baseNode);
  };

  componentDidMount() {
    if (this.fileIsCode()) this.highlightBlock();
  }
  componentDidUpdate() {
    if (this.fileIsCode()) this.highlightBlock();
  }

  render() {
    // File has not yet been fetched
    if (!this.props.file)
      return "Loading...";

    // Various types of images
    if (this.fileIsImage()) {
      if (atob(this.props.file.content).includes("https://git-lfs.github.com/"))
        return "The image can't be previewed because it's stored in Git LFS.";
      return <img
        className="image-preview"
        alt={this.props.file.file_name}
        src={"data:image;base64," + this.props.file.content}
      />;
    }
    // Code with syntax highlighting
    if (this.fileIsCode()) {
      return (
        <pre className={`hljs ${this.getFileExtension()}`}>
          <code>{atobUTF8(this.props.file.content)}</code>
        </pre>
      );
    }
    // Markdown
    if (this.getFileExtension() === "md") {
      let content = atobUTF8(this.props.file.content);
      return <RenkuMarkdown markdownText={content} />;
    }

    // Jupyter Notebook
    if (this.getFileExtension() === "ipynb") {
      return <JupyterNotebookContainer
        key="notebook-body"
        notebook={JSON.parse(atobUTF8(this.props.file.content), (key, value) => Object.freeze(value))}
        filePath={this.props.file.file_path}
        {...this.props}
      />;
    }

    if (this.fileHasNoExtension()) {
      return (
        <pre className={`hljs ${this.getFileExtension()}`}>
          <code>{atobUTF8(this.props.file.content)}</code>
        </pre>
      );
    }

    // File extension not supported
    return <p>{`Unable to preview file with extension .${this.getFileExtension()}`}</p>;
  }
}

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
 * @param {number} accessLevel - current project access level
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
    if (this.props.accessLevel >= ACCESS_LEVELS.MAINTAINER) {
      const { branches } = this.props;
      if (branches && branches.all && !branches.all.length && !StatusHelper.isUpdating(branches.all))
        branches.fetch();
    }
  }

  getDefaultBranch() {
    const { branches } = this.props;
    if (!branches || !branches.all || StatusHelper.isUpdating(branches.all) || !branches.all.length)
      return null;

    const masterBranch = branches.all.filter(branch => branch.name === "master");
    if (masterBranch.length)
      return "master";

    return branches[0].name;
  }

  getScope() {
    const scope = {
      namespace: this.props.projectNamespace,
      project: this.props.projectPath,
    };
    // TODO: plug in branch and commit coming from project page when it available
    scope.commit = "latest";
    scope.branch = this.getDefaultBranch();
    return scope;
  }

  render() {
    if (this.props.accessLevel < ACCESS_LEVELS.MAINTAINER)
      return (<JupyterButtonPresent access={false} launchNotebookUrl={this.props.launchNotebookUrl} />);

    const { file, branches } = this.props;
    let updating = false;
    if (branches.all && StatusHelper.isUpdating(branches.all))
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
        launchNotebookUrl={this.props.launchNotebookUrl} />
    );
  }
}


/**
 * File content display container component
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {string} filePath - path to the file - for the JupyterNotebook button. See docs for JupyterButton
 * @param {string} branchName - optional branch name, defaults to master
 * @param {Object} branches - for the JupyterNotebook button. See docs for JupyterButton
 */
class ShowFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: null, commit: null, error: null };
  }

  // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
  componentDidMount() {
    this._isMounted = true;
    this.retrieveFile();
  }

  componentWillUnmount() { this._isMounted = false; }

  retrieveFile() {
    const client = this.props.client;
    const branchName = this.props.branchName || "master";
    let filePath = this.props.filePath;
    client.getRepositoryFile(this.props.projectId, filePath, branchName, "base64")
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
        return client.getRepositoryCommit(this.props.projectId, fileJson.last_commit_id);
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
      buttonJupyter = (<JupyterButton {...this.props} file={filePath} />);

    return <ShowFilePresent externalUrl={this.props.externalUrl}
      filePath={filePath}
      gitLabFilePath={gitLabFilePath}
      lineagesPath={this.props.lineagesPath}
      branches={this.props.branches}
      buttonJupyter={buttonJupyter}
      file={this.state.file}
      commit={this.state.commit}
      error={this.state.error} />;
  }
}

export { FilePreview, JupyterNotebookContainer as JupyterNotebook, JupyterButton, ShowFile };
