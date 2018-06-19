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


class MergeRequestPresent extends Component {
  render() {
    const mergeButton = <Button
      size="sm"
      color="success"
      onClick={event => {
        event.preventDefault();
        this.props.onMergeClick();
      }}>
      {'Merge'}
    </Button>;

    const gitLabMRLink = <Button
      size="sm"
      color="link"
      onClick={event => {
        event.preventDefault();
        window.open(`${this.props.externalMRUrl}`);
      }}>
      {'Open merge request in GitLab'}
    </Button>;

    return <span>
      <Row key="title">
        <Col xs={6}><h3 style={{padding: '10px'}}>{this.props.title}</h3></Col>
        <Col xs={6}><p align="right" style={{padding: '10px'}}>{gitLabMRLink}&nbsp;{mergeButton}</p></Col>
      </Row>
      <Table>
        <thead>
          <tr style={{borderTopWidth:'0px'}}>
            <th>{this.props.target_branch}</th>
            <th>{this.props.source_branch}</th>
          </tr>
        </thead>
        <tbody>{this.props.simpleChanges}{this.props.notebookChanges}</tbody>
      </Table>
    </span>
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
        <Badge color="light">{this.props.target_branch}</Badge> {'<--'}
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


class NotebookComparisonPresent extends Component {
  render() {
    return (
      <tr>
        <td>
          <p><br/>{this.props.filePath}</p>
          <div className="notebook-comparison">
            {this.props.leftNotebookComponent}
          </div>
        </td>
        <td>
          <p><br/>{this.props.filePath}</p>
          <div className="notebook-comparison">
            {this.props.rightNotebookComponent}
          </div>
        </td>
      </tr>
    )
  }
}


export { MergeRequestList, SimpleChange, NotebookComparisonPresent, MergeRequestPresent }
