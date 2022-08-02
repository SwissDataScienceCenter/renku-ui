/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Commits.js
 *  Commits code and presentation.
 */

import React from "react";
import { Row, Col, ListGroup, ListGroupItem, ButtonGroup, Button, UncontrolledTooltip } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";

import Time from "./../../helpers/Time";

import "./Commits.css";
import { Loader } from "../Loader";
import { TimeCaption } from "../TimeCaption";
import { ExternalLink } from "../ExternalLinks";
import { Clipboard } from "../Clipboard";

// Constants
const CommitElement = {
  DATE: "date",
  COMMIT: "commit"
};


// Helper functions
function createDateObject(commit) {
  return {
    type: CommitElement.DATE,
    date: Time.parseDate(commit.committed_date),
    readableDate: Time.getReadableDate(commit.committed_date)
  };
}

function createCommitsObjects(commits) {
  const enhancedCommits = commits.reduce(
    (data, commit) => {
      if (!data.lastDate || !Time.isSameDay(data.lastDate, commit.committed_date)) {
        data.lastDate = commit.committed_date;
        data.list.push(createDateObject(commit));
      }
      data.list.push({ ...commit, type: CommitElement.COMMIT });

      return data;
    },
    { lastDate: null, list: [] }
  );

  return enhancedCommits.list;
}


// React components

/**
 * Display a list of commits with links to GilLab pages
 *
 * @param {Object[]} props.commits - list of commits as returned by GitLab api
 * @param {string} props.urlRepository - project's repository url
 * @param {string} props.urlDiff - project's diff url (different based on the context where
 *     the component is used. E.G. merge requests vs branch browsing)
 * @param {Object} [props.fetched] - nullable date of last fetch
 * @param {bool} [props.fetching] - whether or not it's currently fetching
 */
function CommitsView(props) {
  let { fetched, fetching } = props;
  if (!(fetched != null))
    fetched = true;
  if (!(fetching != null))
    fetching = false;

  if (fetching)
    return (<Loader />);

  const enhancedCommits = createCommitsObjects(props.commits);
  const commitsView = enhancedCommits.map(commit =>
    <SingleCommit
      key={commit.id ? commit.id : commit.readableDate}
      commit={commit}
      urlBrowse={`${props.urlRepository}/tree/`}
      urlDiff={props.urlDiff}
    />
  );
  return (<ListGroup>{commitsView}</ListGroup>);
}


/**
 * Create a React commit element
 *
 * @param {Object} props.commit - commit object as returned by GitLab api
 * @param {string} props.url - project's repository url
 */
function SingleCommit(props) {
  if (props.commit.type === CommitElement.COMMIT) {
    const idCopyButton = `btn-commit-copy-${props.commit.id}`;
    const idBrowseButton = `btn-commit-browse-${props.commit.id}`;
    const idDiffButton = `btn-commit-diff-${props.commit.id}`;
    const urlBrowse = `${props.urlBrowse}${props.commit.id}`;
    const urlDiff = `${props.urlDiff}${props.commit.id}`;

    return (
      <ListGroupItem className="commit-object">
        <Row>
          <Col xs={12} md className="commit-cut-message">
            <ExternalLink
              id={idDiffButton}
              role="text"
              title={props.commit.message}
              url={urlDiff}
            />
            <UncontrolledTooltip placement="top" target={idDiffButton}>
              Diff to parent
            </UncontrolledTooltip>
            <br />
            <span className="small">{props.commit.author_name} </span>
            <TimeCaption caption={"authored"} time={props.commit.committed_date} />
          </Col>
          <Col xs={12} md="auto" className="d-md-flex">
            <ButtonGroup className="text-monospace m-auto commit-buttons" size="sm">
              <Button color="rk-background" className="border" disabled>{props.commit.short_id}</Button>
              <Button color="rk-background rounded-0" className="border" id={idCopyButton}>
                <Clipboard clipboardText={props.commit.id} />
              </Button>
              <UncontrolledTooltip placement="top" target={idCopyButton}>
                Copy commit SHA
              </UncontrolledTooltip>
              <ExternalLink
                id={idBrowseButton}
                title={<FontAwesomeIcon icon={faFolderOpen} />}
                url={urlBrowse}
                color="rk-background"
                className="text-primary last-item-button-group border"
              />
              <UncontrolledTooltip placement="top" target={idBrowseButton}>
                Browse files
              </UncontrolledTooltip>
            </ButtonGroup>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
  return (
    <ListGroupItem className="commit-date">
      <Row>
        <Col>
          <span>{props.commit.readableDate}</span>
        </Col>
      </Row>
    </ListGroupItem>
  );
}


// Export
const CommitsUtils = {
  ElementType: CommitElement,
  createDateObject,
  createCommitsObjects
};

export { CommitsView, CommitsUtils };
