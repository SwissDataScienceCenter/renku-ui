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

import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import DOMPurify from "dompurify";
import { isEqual } from "lodash";
import styles from "./File.module.scss";

import React, { memo, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { Clipboard } from "../components/clipboard/Clipboard";
import { ExternalIconLink, ExternalLink } from "../components/ExternalLinks";
import { Loader } from "../components/Loader";
import { TimeCaption } from "../components/TimeCaption";
import LazyNotebookPreview from "../components/notebook/LazyNotebookRender";
import { formatBytes } from "../utils/helpers/HelperFunctions";
import FileAndLineageSwitch from "./FileAndLineageComponents";
import FilePreview from "./FilePreview";

import "../../node_modules/highlight.js/styles/atom-one-light.css";

const commitMessageLengthLimit = 120;

/**
 * Display the Card with file information. Has the following parameters:
 *
 * @param {string} gitLabUrl - Url to GitLab.
 * @param {string} filePath - Path of the file
 * @param {Object} commit - Information from GitLab about the commit.
 * @param {Component} buttonGraph - Button to switch to graph view
 * @param {Component} buttonGit - Button to switch to GitLab.
 * @param {Component} buttonJupyter - Button to switch to Jupyter.
 * @param {Object} body - Content to show as the body of the card
 * @param {Component} isLFSBadge - Badge to show for LFS (or null)
 */
class FileCard extends React.Component {
  render() {
    let commitHeader = null;
    if (this.props.commit) {
      const commitLinkHref = `${this.props.gitLabUrl}/commit/${this.props.commit.id}`;
      const title =
        this.props.commit.title.length > commitMessageLengthLimit
          ? this.props.commit.title.slice(0, commitMessageLengthLimit) + "..."
          : this.props.commit.title;
      commitHeader = (
        <ListGroup flush>
          <ListGroupItem className="border-bottom">
            <div className="d-flex justify-content-between flex-wrap">
              <div>
                <a
                  href={commitLinkHref}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Commit: {this.props.commit.short_id}
                </a>{" "}
                &nbsp;
                {title}
              </div>
              <div className="caption">
                {this.props.commit.author_name}
                {", "}
                <TimeCaption
                  datetime={this.props.commit.committed_date}
                  enableTooltip
                  noCaption
                />
              </div>
            </div>
          </ListGroupItem>
        </ListGroup>
      );
    }
    return (
      <Card>
        <CardHeader
          id="file-card-header"
          className="d-flex align-items-center bg-white justify-content-between pe-3 ps-3 flex-wrap"
        >
          <div className="d-flex align-items-end overflow-hidden gap-2">
            {this.props.isLFSBadge}
            <div className="fw-bold text-truncate">{this.props.filePath}</div>
            {this.props.fileSize ? (
              <div className="flex-grow-0 flex-shrink-0">
                <small> {formatBytes(this.props.fileSize)}</small>
              </div>
            ) : null}
            <Clipboard
              clipboardText={this.props.filePath}
              className="icon-link d-flex"
            />
          </div>
          <div
            className={cx(
              styles.fileIconLinks,
              "d-flex",
              "align-items-center",
              "gap-3"
            )}
          >
            {this.props.buttonShareLinkSession}
            {this.props.buttonDownload}
            {this.props.buttonJupyter}
            {this.props.buttonGit}
            <span className="ms-2">{this.props.buttonGraph}</span>
          </div>
        </CardHeader>
        {commitHeader}
        {this.props.body}
      </Card>
    );
  }
}

/**
 * Display a file with some metadata. Has the following parameters:
 *
 * @param {string} externalUrl - Url to GitLab.
 * @param {string} filePath - Path of the file
 * @param {string} gitLabFilePath - Path of the file in gitLab
 * @param {string} lineagesPath - Path to get the lineage
 * @param {Component} buttonJupyter - A button to connect to jupyter
 * @param {Object} file - The file object from GitLab (can be null)
 * @param {Object} commit - The commit object from GitLab (can be null)
 * @param {Object} error - The error object from GitLab (can be null)
 */
class ShowFile extends React.Component {
  render() {
    const gitLabFilePath = this.props.gitLabFilePath;
    const branch = this.props.branch ?? "master";
    const buttonGraph =
      this.props.lineagesPath !== undefined ? (
        <FileAndLineageSwitch
          insideFile={true}
          history={this.props.history}
          switchToPath={`${this.props.lineagesPath}/${gitLabFilePath}`}
        />
      ) : null;

    const buttonGit = (
      <ExternalIconLink
        tooltip="Open in GitLab"
        icon={faGitlab}
        to={`${this.props.externalUrl}/blob/${branch}/${gitLabFilePath}`}
      />
    );

    if (this.props.error !== null) {
      const { fileInfo } = this.props;
      const filePath =
        fileInfo && fileInfo.path
          ? fileInfo.path
          : this.props.gitLabFilePath.split("\\").pop().split("/").pop();
      const body =
        fileInfo && fileInfo.type === "tree" ? (
          <Card>
            <CardBody>Folder</CardBody>
          </Card>
        ) : (
          this.props.error
        );

      return (
        <FileCard
          gitLabUrl={this.props.externalUrl}
          filePath={filePath}
          commit={this.props.commit}
          buttonGraph={buttonGraph}
          buttonGit={buttonGit}
          buttonJupyter={this.props.buttonJupyter}
          buttonShareLinkSession={this.props.buttonShareLinkSession}
          body={body}
          isLFSBadge={null}
          fileSize={this.props.fileSize}
        />
      );
    }

    if (this.props.file == null) {
      return (
        <Card>
          <CardHeader className="d-flex align-items-center bg-white justify-content-between pe-3 ps-3">
            &nbsp;
          </CardHeader>
          <CardBody>
            Downloading... <Loader inline size={16} />
          </CardBody>
        </Card>
      );
    }

    const isLFS = this.props.hashElement ? this.props.hashElement.isLfs : false;
    const isLFSBadge = isLFS ? (
      <Badge className="lfs-badge" color="white">
        LFS
      </Badge>
    ) : null;
    const downloadLink = `${this.props.externalUrl}/-/raw/${branch}/${gitLabFilePath}?inline=false`;
    const buttonDownload = (
      <ExternalIconLink
        tooltip="Download File"
        icon={faDownload}
        to={downloadLink}
      />
    );
    const body = (
      <FilePreview
        file={this.props.file}
        downloadLink={downloadLink}
        {...this.props}
      />
    );

    return (
      <FileCard
        gitLabUrl={this.props.externalUrl}
        filePath={this.props.filePath}
        commit={this.props.commit}
        buttonGraph={buttonGraph}
        buttonGit={buttonGit}
        buttonJupyter={this.props.buttonJupyter}
        buttonShareLinkSession={this.props.buttonShareLinkSession}
        body={body}
        isLFSBadge={isLFSBadge}
        buttonDownload={buttonDownload}
        downloadLink={downloadLink}
        fileSize={this.props.fileSize}
      />
    );
  }
}

class FileNoPreview extends React.Component {
  render() {
    const downloadLink = (
      <ExternalLink
        title="download the file"
        role="link"
        showLinkIcon={true}
        iconAfter={true}
        url={this.props.url}
        customIcon={faDownload}
      />
    );

    // LFS or very big files
    if (this.props.lfs || this.props.hardLimitReached) {
      const reason = this.props.hardLimitReached
        ? `the file is too big (more than ${formatBytes(this.props.hardLimit)})`
        : "the file is stored in Git LFS";
      return (
        <CardBody key="file preview" className="pb-0">
          <p>The preview is not available because {reason}.</p>
          <p>You can still {downloadLink}</p>
        </CardBody>
      );
    }

    // Big preview-able files
    if (!this.props.previewAnyway) {
      const loadButton = (
        <Button
          color="link"
          className="p-0 align-baseline"
          onClick={() => {
            this.props.loadAnyway();
          }}
        >
          preview it anyway
        </Button>
      );
      return (
        <CardBody key="file preview" className="pb-0">
          <p>
            The preview may be slow because the file is large (more than{" "}
            {formatBytes(this.props.softLimit)}).
          </p>
          <p>
            You can {loadButton} or {downloadLink}
          </p>
        </CardBody>
      );
    }

    // No need to return anything when the preview is allowed
    return null;
  }
}

/**
 * Modes of showing notebook source code.
 */
const NotebookSourceDisplayMode = {
  DEFAULT: "DEFAULT",
  SHOWN: "SHOWN",
  HIDDEN: "HIDDEN",
};
/**
 * Modify the cell metadata according to the hidden policy
 *
 * @param {object} [cell] - The cell to process
 * @param {array} [accumulator] - The place to store the result
 */
function tweakCellMetadataHidden(cell, accumulator) {
  const clone = { ...cell };
  clone.metadata = { ...cell.metadata };
  clone.metadata.hide_input = true;
  accumulator.push(clone);
}

/**
 * Modify the cell metadata according to the show policy
 *
 * @param {object} [cell] - The cell to process
 * @param {array} [accumulator] - The place to store the result
 */
function tweakCellMetadataShow(cell, accumulator) {
  const clone = { ...cell };
  clone.metadata = { ...cell.metadata };
  clone.metadata.hide_input = false;
  accumulator.push(clone);
}

/**
 * Modify the cell metadata according to the default policy
 *
 * @param {object} [cell] - The cell to process
 * @param {array} [accumulator] - The place to store the result
 */
function tweakCellMetadataDefault(cell, accumulator) {
  if (cell.metadata.jupyter == null) {
    accumulator.push(cell);
  } else {
    const clone = { ...cell };
    clone.metadata = { ...cell.metadata };
    clone.metadata.hide_input = clone.metadata.jupyter.source_hidden;
    accumulator.push(clone);
  }
}

/**
 * Modify the notebook metadata so it is correctly processed by the renderer.
 *
 * @param {object} [nb] - The notebook to process
 * @param {string} [displayMode] - The mode to use to process the notebook
 */
function tweakCellMetadata(
  nb,
  displayMode = NotebookSourceDisplayMode.DEFAULT
) {
  // Scan the cell metadata, and, if jupyter.source_hidden === true, set hide_input = true
  const result = { ...nb };
  result.cells = [];
  const cellMetadataFunction =
    displayMode === NotebookSourceDisplayMode.DEFAULT
      ? tweakCellMetadataDefault
      : displayMode === NotebookSourceDisplayMode.HIDDEN
      ? tweakCellMetadataHidden
      : tweakCellMetadataShow;
  nb.cells.forEach((cell) => cellMetadataFunction(cell, result.cells));
  if (displayMode === NotebookSourceDisplayMode.SHOWN) {
    // Set the hide_input to false;
    result["metadata"] = { ...result["metadata"] };
    result["metadata"]["hide_input"] = false;
  }
  return result;
}

/**
 * Remove any problematic content from the cells
 *
 * @param {object} [cell] - The cell to process
 * @param {array} [accumulator] - The place to store the result
 */
function sanitizeCell(cell, accumulator) {
  const clone = { ...cell };
  if (clone.outputs == null) {
    accumulator.push(clone);
    return;
  }
  const outputs = clone.outputs.map((oo) => {
    const o = { ...oo };
    o.data = { ...oo.data };
    if (o.data["text/html"] != null)
      o.data["text/html"] = [
        DOMPurify.sanitize([o.data["text/html"].join("\n")]),
      ];
    return o;
  });
  clone.outputs = outputs;
  accumulator.push(clone);
}

/**
 * Modify the notebook cells to sanitize HTML content
 *
 * @param {object} [nb] - The notebook to process
 */
function sanitizeNotebook(nb) {
  const result = { ...nb };
  result.cells = [];
  nb.cells.forEach((cell) => sanitizeCell(cell, result.cells));
  return result;
}

function NotebookDisplayForm(props) {
  const displayMode = props.displayMode;
  const setDisplayMode = props.setDisplayMode;
  const [overrideMode, setOverrideMode] = useState(
    NotebookSourceDisplayMode.SHOWN
  );

  function setOverride(override) {
    if (override) setDisplayMode(overrideMode);
    else setDisplayMode(NotebookSourceDisplayMode.DEFAULT);
  }

  function setLocalMode(mode) {
    setOverrideMode(mode);
    setDisplayMode(mode);
  }

  const overrideControl =
    displayMode === NotebookSourceDisplayMode.DEFAULT ? null : (
      <ButtonGroup key="controls" className="mt-2" size="sm">
        <Button
          onClick={() => setLocalMode(NotebookSourceDisplayMode.SHOWN)}
          active={displayMode === NotebookSourceDisplayMode.SHOWN}
        >
          Visible
        </Button>
        <Button
          onClick={() => setLocalMode(NotebookSourceDisplayMode.HIDDEN)}
          active={displayMode === NotebookSourceDisplayMode.HIDDEN}
        >
          Hidden
        </Button>
      </ButtonGroup>
    );

  return (
    <ListGroup key="controls" flush className="border-bottom">
      <ListGroupItem>
        <div className="form-check form-switch">
          <Input
            type="switch"
            id="code-visibility-override"
            name="code-visibility-override"
            className="rounded-pill"
            checked={displayMode !== NotebookSourceDisplayMode.DEFAULT}
            onChange={() => {
              setOverride(displayMode === NotebookSourceDisplayMode.DEFAULT);
            }}
          />
          <Label for="code-visibility-override" check className="me-4">
            Override Code Visibility
          </Label>
        </div>
        <div className="form-rk-green">{overrideControl}</div>
      </ListGroupItem>
    </ListGroup>
  );
}

const StyledNotebook = memo((props) => {
  const [displayMode, setDisplayMode] = useState(
    NotebookSourceDisplayMode.DEFAULT
  );

  if (props.notebook == null) return <div>Loading...</div>;

  const notebook = sanitizeNotebook(
    tweakCellMetadata(props.notebook, displayMode)
  );
  return [
    <NotebookDisplayForm
      key="notebook-display-form"
      displayMode={displayMode}
      setDisplayMode={setDisplayMode}
    />,
    <CardBody key="notebook">
      <LazyNotebookPreview
        defaultStyle={false}
        loadMathjax={false}
        notebook={notebook}
      />
    </CardBody>,
  ];
}, isEqual);
StyledNotebook.displayName = "StyledNotebook";

export {
  FileNoPreview,
  NotebookSourceDisplayMode,
  ShowFile,
  StyledNotebook,
  sanitizeNotebook,
  tweakCellMetadata,
};
