/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
import { Badge, Row, Col, Nav, NavItem, CardHeader } from "reactstrap";
import { Switch, Route } from "react-router-dom";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";

import { TooltipToggleButton, ExternalIconLink, RenkuNavLink, GoBackButton } from "../../utils/UIComponents";
import { Contribution, NewContribution } from "../../contribution";
import { CommitsView } from "../../utils/Commits";
import _ from "lodash/collection";


function MergeRequestHeader(props) {

  const rowInfo = props.mergeRequestRowInfo;
  const { badgeText, badgeColor } = rowInfo;
  const statusBadge = <Badge color={badgeColor}>{badgeText}</Badge>;

  const buttonGit = <ExternalIconLink tooltip="Open in GitLab" icon={faGitlab} to={props.externalMRUrl} />;

  const actionButton = props.showMergeButton ?
    <TooltipToggleButton
      onClick={props.onMergeClick} tooltip={`Merge`}
      active={true}
      activeIcon={faCodeBranch} inactiveIcon={faCodeBranch}
      activeClass="text-success fa-flip-vertical" inactiveClass="text-primary" />
    : null;


  return <Row key="title" className="pb-2">
    <Col sm={8} style={{ overflow: "hidden" }}>
      <h3>{props.title}</h3>
    </Col>
    <Col sm={4} className="float-right pt-3" style={{ textAlign: "end" }}>
      {statusBadge}
      {buttonGit}
      {actionButton}
    </Col>
  </Row>;
}

function MergeRequestNavigation(props) {
  return <Nav tabs>
    <NavItem>
      <RenkuNavLink to="changes" matchpath={true} title="Changes" />
    </NavItem>
    <NavItem>
      <RenkuNavLink to="commits" matchpath={true} title="Commits" />
    </NavItem>
    <NavItem>
      <RenkuNavLink to="discussion" matchpath={true} title="Discussion" />
    </NavItem>
  </Nav>;
}

function ContributionsView(props) {
  // We sort the date strings instead of actual Date objects here - ok due to ISO format.
  const contributions = props.contributions
    .sort((el1, el2) => el1.created_at > el2.created_at ? -1 : 1)
    .filter(c => c.system !== true)
    .map(cont => <Contribution key={cont.id} contribution={cont.notes[0]} {...props} />);

  return [contributions,
    <NewContribution key="newContribution" {...props} mergeRequest={true} />
  ];
}

function ChangesView(props) {

  const opaqueChanges = props.changes
    .filter((change) => change.new_path.split(".").pop() !== "ipynb");

  const notebookChanges = props.changes
    .filter((change) => change.new_path.split(".").pop() === "ipynb");

  return [
    (notebookChanges.length > 0) ?
      <NotebookComparisonList key="notebooks" changes={notebookChanges}
        notebookComparisonView={props.notebookComparisonView}
        target_branch={props.target_branch} source_branch={props.source_branch} /> :
      null,
    (opaqueChanges.length > 0) ?
      <OpaqueChanges key="opaque" changes={opaqueChanges} author={props.author} updated_at={props.updated_at}
        target_branch={props.target_branch} source_branch={props.source_branch} /> :
      null
  ];
}

class MergeRequestPresent extends Component {

  render() {
    if (this.props.title == null) return null;
    return [
      <GoBackButton key="backButton" label="Back to list" url={this.props.mergeRequestsOverviewUrl}/>,
      < MergeRequestHeader key="header" {...this.props} />,
      <Row key="description" className="pb-2">
        <Col sm={11}>
          <p key="lead" className="lead">
            {this.props.author.name} wants to merge changes from branch&nbsp;
            <em><strong>{this.props.source_branch}</strong></em> into&nbsp;
            <em><strong>{this.props.target_branch}</strong></em>.
          </p>
        </Col>
      </Row>,
      <MergeRequestNavigation key="navigation" {...this.props} />,
      <Col key="content" sm={12} md={12}>
        <Switch>
          <Route path={this.props.mergeRequestDiscussionUrl} render={props =>
            <ContributionsView {...this.props} />
          } />
          <Route path={this.props.mergeRequestChangesUrl} render={props =>
            <ChangesView {...this.props} />
          } />
          <Route path={this.props.mergeRequestCommitsUrl} render={props =>
            <div style={{ paddingTop: "20px" }}>
              <CommitsView
                commits={this.props.commits}
                fetched={true}
                fetching={false}
                urlRepository={this.props.externalUrl}
                urlDiff={`${this.props.externalMRUrl}?commit_id=`}
              />
            </div>
          } />
        </Switch>
      </Col>
    ];
  }
}

class SimpleChangeLine extends Component {
  render() {
    let line;
    if (this.props.renamed_file)
      line = `${this.props.old_path} --> ${this.props.new_path}`;
    else
      line = `${this.props.new_path}`;

    return <Row>
      <Col>
        {line}
      </Col>
    </Row>;
  }
}


class NotebookComparisonList extends Component {
  render() {
    const notebookChanges = this.props.changes
      .map((change, i) => this.props.notebookComparisonView(change, i));
    return [
      <br key="space" />,
      <Row key="header" className="mt-4 mb-4"><br /><Col><CardHeader>Notebook Changes</CardHeader></Col></Row>,
      <Row key="titles">
        <Col xs={6}><p><strong>{this.props.target_branch}</strong></p></Col>
        <Col xs={6}><p><strong>{this.props.source_branch}</strong></p></Col>
      </Row>,
      notebookChanges
    ];
  }
}

class NotebookComparisonPresent extends Component {
  render() {
    return (
      <Row>
        <Col xs={6}>
          <p><br />{this.props.filePath}</p>
          <div className="notebook-comparison">
            {this.props.leftNotebookComponent}
          </div>
        </Col>
        <Col xs={6}>
          <p><br />{this.props.filePath}</p>
          <div className="notebook-comparison">
            {this.props.rightNotebookComponent}
          </div>
        </Col>
      </Row>
    );
  }
}

function changeToType(change) {
  if (change.new_file) return "new_file";
  else if (change.deleted_file) return "deleted_file";
  else if (change.renamed_file) return "renamed_file";
  return "modified_file";
}

class OpaqueChanges extends Component {
  render() {
    const groupedChanges = _.groupBy(this.props.changes, changeToType);
    const groupChangeKeys = ["new_file", "deleted_file", "renamed_file", "modified_file"];
    const groupChangeTitleMap = {
      "new_file": "New Files",
      "deleted_file": "Deleted Files",
      "renamed_file": "Renamed Files",
      "modified_file": "Modified Files"
    };
    const opaqueChanges = groupChangeKeys
      .map((k, i) => {
        const changes = groupedChanges[k];
        return (changes) ? <OpaqueChangesGroup title={groupChangeTitleMap[k]} changes={changes} key={i} /> : null;
      });

    return [
      <br key="space" />,
      <Row key="header"><Col><CardHeader>Opaque Changes</CardHeader></Col></Row>,
      opaqueChanges];
  }
}

class OpaqueChangesGroup extends Component {
  render() {

    const opaqueChanges = this.props.changes
      .map((change, i) => <SimpleChangeLine {...change} key={i} />);

    return [
      <Row key="titles" className="mt-4">
        <Col><p><strong>{this.props.title}</strong></p></Col>
      </Row>,
      opaqueChanges];
  }
}


export { NotebookComparisonPresent, MergeRequestPresent };
