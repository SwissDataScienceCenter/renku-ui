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

import React, { Component, useState } from "react";
import ReactDOM from "react-dom";
import { CardBody } from "reactstrap";
import hljs from "highlight.js";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";


import { StyledNotebook, JupyterButtonPresent, ShowFile as ShowFilePresent, FileNoPreview } from "./File.present";
import { API_ERRORS } from "../api-client";
import { atobUTF8 } from "../utils/helpers/Encoding";
import { encodeImageBase64 } from "../utils/components/markdown/RenkuMarkdownWithPathTranslation";
import { RenkuMarkdown } from "../utils/components/markdown/RenkuMarkdown";
import { ShareLinkSessionIcon } from "../utils/components/shareLinkSession/ShareLinkSession";

const PDF_EXTENSION = "pdf";
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "tiff", "gif", "svg"];
const CODE_EXTENSIONS = [
  "bat", "cwl", "dcf", "ini", "jl", "job", "js", "json", "m", "mat", "parquet", "prn", "py", "r", "rmd",
  "rout", "rproj", "rs", "rst", "scala", "sh", "toml", "ts", "xml", "yaml", "yml",
  "c", "cc", "cxx", "cpp", "h", "hh", "hxx", "hpp", // C++
  "f", "for", "ftn", "fpp", "f90", "f95", "f03", "f08" // Fortran
];
// eslint-disable-next-line
const TEXT_EXTENSIONS = ["csv", "dockerignore", "gitattributes", "gitkeep", "gitignore", "renkulfsignore", "txt"];

// FIXME: Unify the file viewing for issues (embedded) and independent file viewing.
// FIXME: Fix positioning of input tags when rendering Jupyter Notebooks.

class FilePreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = { previewAnyway: false };
  }

  getFileExtension = () => {
    if (!this.props.file)
      return null;

    if (this.props.file.file_name.match(/\.(.*)/) === null)
      return null;
    return this.props.file.file_name.split(".").pop().toLowerCase();
  };
  fileIsCode = () => CODE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileIsText = () => TEXT_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileIsImage = () => IMAGE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileIsPDF = () => PDF_EXTENSION === this.getFileExtension();
  fileHasNoExtension = () => this.getFileExtension() === null;
  fileIsLfs = () => {
    if (this.props.hashElement && this.props.hashElement.isLfs)
      return true;
    return false;
  }

  loadAnyway = () => {
    this.setState({ previewAnyway: true });
  }

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
      return null;

    // LFS files and big files
    if (this.fileIsLfs() || (this.props.previewThreshold &&
      this.props.file.size > this.props.previewThreshold.soft && !this.state.previewAnyway)) {
      return (
        <FileNoPreview
          url={this.props.downloadLink}
          lfs={this.fileIsLfs()}
          softLimit={this.props.previewThreshold.soft}
          softLimitReached={this.props.file.size > this.props.previewThreshold.soft}
          hardLimit={this.props.previewThreshold.hard}
          hardLimitReached={this.props.file.size > this.props.previewThreshold.hard}
          previewAnyway={this.state.previewAnyway}
          loadAnyway={this.loadAnyway.bind(this)}
        />
      );
    }

    // Various types of images
    if (this.fileIsImage()) {
      return (
        <CardBody key="file preview" className="bg-white">
          <img
            className="image-preview"
            alt={this.props.file.file_name}
            src={encodeImageBase64(this.props.file.file_name, this.props.file.content)}
          />
        </CardBody>
      );
    }

    // pdf document
    if (this.fileIsPDF()) {
      return (
        <CardBody key="file preview" className="pb-0 bg-white">
          <PDFViewer file={`data:application/pdf;base64,${this.props.file.content}`}/>
        </CardBody>
      );
    }

    // Free text
    if (this.fileIsText()) {
      return (
        <CardBody key="file preview" className="pb-0 bg-white">
          <pre className="no-highlight">
            <code>{atobUTF8(this.props.file.content)}</code>
          </pre>
        </CardBody>
      );
    }

    // Markdown
    if (this.getFileExtension() === "md") {
      let content = atobUTF8(this.props.file.content);
      return (
        <CardBody key="file preview" className="pb-0 bg-white">
          <RenkuMarkdown
            projectPathWithNamespace={this.props.projectPathWithNamespace}
            filePath={this.props.file.file_path}
            markdownText={content}
            projectId={this.props.projectId}
            fixRelativePaths={this.props.insideProject}
            branch={this.props.branch}
            client={this.props.client}
          />{" "}
        </CardBody>
      );
    }

    // Jupyter Notebook
    if (this.getFileExtension() === "ipynb") {
      return (
        // Do not wrap in a CardBody, the notebook container does that itself
        <JupyterNotebookContainer
          key="notebook-body"
          notebook={JSON.parse(atobUTF8(this.props.file.content))}
          filePath={this.props.file.file_path}
          {...this.props}
        />
      );
    }

    // Code with syntax highlighting
    if (this.fileIsCode()) {
      return (
        <CardBody key="file preview" className="pb-0 bg-white">
          <pre className={`hljs ${this.getFileExtension()} bg-white`}>
            <code>{atobUTF8(this.props.file.content)}</code>
          </pre>
        </CardBody>
      );
    }

    // No extensions
    if (this.fileHasNoExtension()) {
      return (
        <CardBody key="file preview" className="pb-0 bg-white">
          <pre className={"hljs bg-white"}>
            <code>{atobUTF8(this.props.file.content)}</code>
          </pre>
        </CardBody>
      );
    }

    // File extension not supported
    return (
      <CardBody key="file preview" className="pb-0 bg-white">
        <p>{`Unable to preview file with extension .${this.getFileExtension()}`}</p>
      </CardBody>
    );
  }
}

export default function PDFViewer(props) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <Document
      file={props.file}
      onLoadSuccess={onDocumentLoadSuccess}
      renderMode="svg">
      {
        Array.from(
          new Array(numPages),
          (el, index) => (
            <Page
              className="rk-pdf-page"
              key={`page_${index + 1}`}
              pageNumber={index + 1}
            />
          ),
        )
      }
    </Document>
  );
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

export { FilePreview, JupyterNotebookContainer as JupyterNotebook, JupyterButton, ShowFile };
