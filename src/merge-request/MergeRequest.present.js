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

import React, { Component } from 'react';
import { Table, Row, Col, Button, Badge } from 'reactstrap';
import { Link, Route, Switch } from 'react-router-dom'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faLeftArrow from '@fortawesome/fontawesome-free-solid/faLongArrowAltLeft'


class MergeRequestPresent extends Component {

  getMergeButton() {
    if (!this.props.showMergeButton) return null;

    return <Button
      size="sm"
      color="success"
      onClick={(e) => {
        e.preventDefault();
        this.props.onMergeClick();
      }}>
      {'Merge'}
    </Button>
  }

  getGitLabLink() {
    return <a className="btn btn-primary btn-sm" role="button" target="_blank" size="sm"
      href={this.props.externalMRUrl}>View in GitLab</a>;
  }

  render() {
    if (this.props.title == null) return <p></p>

    const mergeButton= this.getMergeButton();
    const gitLabMRLink = this.getGitLabLink();
    const opaqueChanges = this.props.changes
      .filter((change) => change.new_path.split('.').pop() !== 'ipynb');
    const notebookChanges = this.props.changes
      .filter((change) => change.new_path.split('.').pop() === 'ipynb');

    return [
      <Row key="title">
        <Col xs={6}><h3>{this.props.title}</h3></Col>
        <Col xs={6}>
          <p align="right">{gitLabMRLink}&nbsp;{mergeButton}</p>
        </Col>
      </Row>,
      <p key="lead" className="lead" style={{padding: '10px'}}>
        {this.props.author.name} wants to merge changes from
        branch <em>{this.props.source_branch}</em> into <em>{this.props.target_branch}</em>.
      </p>,
      (opaqueChanges.length > 0) ?
        <OpaqueChanges key="opaque" changes={opaqueChanges}
          target_branch={this.props.target_branch} source_branch={this.props.source_branch} /> :
        null,
      (notebookChanges.length > 0) ?
        <NotebookComparisonList key="notebooks" changes={notebookChanges}
          notebookComparisonView={this.props.notebookComparisonView}
          target_branch={this.props.target_branch} source_branch={this.props.source_branch} /> :
        null
    ]
  }
}

class MergeRequestList extends Component {
  render() {
    const rows = this.props.mergeRequests.map((d, i) => {
      const mrUrl = `${this.props.mrOverviewUrl}/${d.iid}`;
      return <Switch key={i}>
        <Route exact path={mrUrl}
          render={() => <MergeRequestListItem active={true} {...d} mrUrl={mrUrl}/> }/>
        <Route path={this.props.mrOverviewUrl}
          render={() => <MergeRequestListItem active={false} {...d} mrUrl={mrUrl}/> }/>
      </Switch>;
    });
    return <Row key="mr"><Col>{rows}</Col></Row>
  }
}

class MergeRequestListItem extends Component {
  render() {
    const className = this.props.active ? 'underline-nav font-weight-bold' : 'font-weight-normal';
    const badgeText = this.props.merge_status === 'can_be_merged' ? 'Can be merged' : 'Conflicts';
    const badgeColor = this.props.merge_status === 'can_be_merged' ? 'success' : 'danger';
    const statusBadge = <Badge color={badgeColor}>{badgeText}</Badge>;

    const title = this.props.active ? this.props.title :
      <Link to={this.props.mrUrl}>{this.props.title}</Link>;

    return <span>
      <p className={className} style={{marginBottom: '0px'}}>{title}</p>
      <p style={{marginTop: '0px'}}>
        <Badge color="light">{this.props.target_branch}</Badge> <FontAwesomeIcon icon={faLeftArrow} />
        <Badge color="light">{this.props.source_branch}</Badge> &nbsp;&nbsp;
        {statusBadge}
      </p>
    </span>
  }
}


class SimpleChange extends Component {
  render() {
    let line;
    if (this.props.new_file) {
      line = `New file: ${this.props.new_path}`
    }
    else if (this.props.deleted_file) {
      line = `Deleted file: ${this.props.new_path}`
    }
    else if (this.props.renamed_file) {
      line = `Renamed file: ${this.props.old_path} --> ${this.props.new_path}`
    }
    else {
      line = `Modified file: ${this.props.new_path}`
    }
    return <tr><td></td><td>{line}</td></tr>
  }
}

class NotebookComparisonList extends Component {
  render() {
    const notebookChanges = this.props.changes
      .map((change, i) => this.props.notebookComparisonView(change, i));
    return [
      <Row key="header"><Col><h3>Notebook Changes</h3></Col></Row>,
      <Row key="titles">
        <Col xs={6}><p><strong>{this.props.target_branch}</strong></p></Col>
        <Col xs={6}><p><strong>{this.props.source_branch}</strong></p></Col>
      </Row>,
      notebookChanges
    ]
  }
}

class NotebookComparisonPresent extends Component {
  render() {
    return (
      <Row>
        <Col xs={6}>
          <p><br/>{this.props.filePath}</p>
          <div className="notebook-comparison">
            {this.props.leftNotebookComponent}
          </div>
        </Col>
        <Col xs={6}>
          <p><br/>{this.props.filePath}</p>
          <div className="notebook-comparison">
            {this.props.rightNotebookComponent}
          </div>
        </Col>
      </Row>
    )
  }
}

class OpaqueChanges extends Component {
  render() {
    const opaqueChanges = this.props.changes
      .map((change, i) => <SimpleChange {...change} key={i}/>)
    return (<Row key="simple"><Col>
      <h3>Opaque Changes</h3>
      <Table>
        <thead>
          <tr style={{borderTopWidth:'0px'}}>
            <th>{this.props.target_branch}</th>
            <th>{this.props.source_branch}</th>
          </tr>
        </thead>
        <tbody>{opaqueChanges}</tbody>
      </Table>
    </Col></Row>)
  }
}


export { MergeRequestList, SimpleChange, NotebookComparisonPresent, MergeRequestPresent }
