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

import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateTime } from "luxon";
import {
  Button,
  ButtonGroup,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { Clipboard } from "../Clipboard";
import { ExternalLink } from "../ExternalLinks";
import { Loader } from "../Loader";
import { TimeCaption } from "../TimeCaption";
import "./Commits.css";
import { toHumanDateTime } from "../../utils/helpers/DateTimeUtils";

// Constants
const CommitElement = {
  DATE: "date",
  COMMIT: "commit",
};

// Helper functions
function createDateObject(commit) {
  const datetime = DateTime.fromISO(commit.committed_date);
  return {
    type: CommitElement.DATE,
    date: datetime.toJSDate(),
    readableDate: toHumanDateTime({ datetime, format: "date" }),
  };
}

function createCommitsObjects(commits) {
  const enhancedCommits = commits
    .sort((el1, el2) => (el1.committed_date < el2.committed_date ? 1 : -1))
    .reduce(
      (data, commit) => {
        const lastDate = data.lastDate ? DateTime.fromISO(data.lastDate) : null;
        const commitDate = DateTime.fromISO(commit.committed_date);
        if (
          !data.lastDate ||
          !lastDate ||
          !lastDate.hasSame(commitDate, "day")
        ) {
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
  if (!(fetched != null)) fetched = true;
  if (!(fetching != null)) fetching = false;

  if (fetching) return <Loader />;

  const enhancedCommits = createCommitsObjects(props.commits);
  const commitsView = enhancedCommits.map((commit) => (
    <SingleCommit
      key={commit.id ? commit.id : commit.readableDate}
      commit={commit}
      urlBrowse={`${props.urlRepository}/tree/`}
      urlDiff={props.urlDiff}
    />
  ));
  return <ListGroup>{commitsView}</ListGroup>;
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
            <TimeCaption
              datetime={props.commit.committed_date}
              enableTooltip
              prefix="authored"
            />
          </Col>
          <Col xs={12} md="auto" className="d-md-flex">
            <ButtonGroup
              className="text-monospace m-auto commit-buttons"
              size="sm"
            >
              <Button
                color="rk-background"
                className="border rounded-0 rounded-start"
                id={idCopyButton}
              >
                <Clipboard clipboardText={props.commit.id}>
                  <code>{props.commit.short_id}</code>
                </Clipboard>
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
  createCommitsObjects,
};

export { CommitsView, CommitsUtils };
