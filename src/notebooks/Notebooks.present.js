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

import React, { Component } from 'react';
import Media from 'react-media';
import { Link } from 'react-router-dom';

import { Form, FormGroup, Label, Input, Button, Row, Col, Table} from 'reactstrap';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faStopCircle, faExternalLinkAlt, faInfoCircle } from '@fortawesome/fontawesome-free-solid';

import { SpecialPropVal } from '../model/Model';
import { Loader, InfoAlert } from '../utils/UIComponents';
import Sizes from '../utils/Media';
import { cleanAnnotations } from '../api-client/notebook-servers';


const Columns = {
  large: {
    default: ["Project", "Commit", "Action"],
    project: ["Branch", "Commit", "Action"]
  },
  compact: {
    default: ["List"],
    project: ["List"],
  }
};

class LogOutUser extends Component {

  constructor(props) {
    super(props);
    this.state = {
      timer: null,
      logedout: false
    }
  }

  componentWillUnmount() {
    this.state.timer.clear()
  }

  componentDidMount() {
    this.setState({
      timer: setTimeout(() => {
        this.setState({ logedout: true });
        this.props.client.doLogout();
      }, 6000)
    });
  }

  render() {
    return (
      this.state.logedout ?
        <Col md={8}>We logged you out.</Col>
        :
        <Col md={{ size: 6, offset: 3 }}>
          <p align="center">You will be logged out because your JupyterLab token expired.
            <br /> Please log in again to continue working with Renku.
          </p>
          <Loader />
        </Col>
    )
  }
}

class RenderedServerOptions extends Component {
  render() {
    if (this.props.loader) {
      return <Loader />
    }
    const renderedServerOptions = Object.keys(this.props.serverOptions).map(key => {
      const serverOption = this.props.serverOptions[key];
      const onChange = this.props.changeHandlers[key];

      switch (serverOption.type) {
      case 'enum':
        return <FormGroup key={key}>
          <Label>{serverOption.displayName}</Label>
          <EnumOption {...serverOption} onChange={onChange} />
        </FormGroup>;

      case 'int':
        return <FormGroup key={key}>
          <Label>{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
          <RangeOption step={1} {...serverOption} onChange={onChange} />
        </FormGroup>;

      case 'float':
        return <FormGroup key={key}>
          <Label>{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
          <RangeOption step={0.01} {...serverOption} onChange={onChange} />
        </FormGroup>;

      case 'boolean':
        return <FormGroup key={key} check>
          <BooleanOption {...serverOption} onChange={onChange} />
          <Label>{`${serverOption.displayName}`}</Label>
        </FormGroup>;

      default:
        return null;
      }
    });
    return <Form>
      {renderedServerOptions}
      <Button onClick={this.props.onSubmit} color="primary">
        Launch Server
      </Button>
    </Form>
  }
}

class NotebookServerOptions extends Component {
  render() {
    return (
      <div className="container">
        <Row key="header">
          <Col sm={12} md={6}><h3>Launch new Jupyterlab server</h3></Col>
        </Row>
        <Row key="spacer"><Col sm={8} md={6} lg={4} xl={3}>&nbsp;</Col></Row>
        <Row key="form">
          <Col sm={8} md={6} lg={4} xl={3}><RenderedServerOptions {...this.props} /></Col>
        </Row>
      </div>
    );
  }
}

class EnumOption extends Component {
  render() {
    return (
      <Input type="select" id={this.props.id} onChange={this.props.onChange}>
        {this.props.options.map((optionName, i) => {
          return <option key={i} value={optionName}>{optionName}</option>
        })}
      </Input>
    );
  }
}

class BooleanOption extends Component {
  render() {
    return (
      <Input
        type="checkbox"
        id={this.props.id}
        value={this.props.selected}
        onChange={this.props.onChange}
      />
    );
  }
}

class RangeOption extends Component {
  render() {
    return (
      <Input
        type="range"
        id={this.props.id}
        value={this.props.selected}
        onChange={this.props.onChange}
        min={this.props.range[0]}
        max={this.props.range[1]}
        step={this.props.step}
      />
    );
  }
}

class NotebookServerRowAction extends Component {
  render() {
    const {status, name} = this.props;
    const StatusText = {
      "running": "Running",
      "spawn": "Starting",
      "stop": "Stopping",
      "other": "Updating",
    }
    const color = status === "running" ? "success" :
      status === "spawn" ? "warning" :
        status === "stop" ? "danger" : "info";
    const interactive = status === "running" ?
      true :
      false;
    const size = this.props.small ?
      "sm" :
      "";

    if (interactive) {
      return (
        <UncontrolledButtonDropdown>
          <DropdownToggle caret color={color} disabled={!interactive} size={size}>
            { StatusText[status] }
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem href={this.props.url} target="_blank">
              <FontAwesomeIcon icon={faExternalLinkAlt} /> Connect
            </DropdownItem>
            <DropdownItem onClick={(e) => this.props.onStopServer(name)}>
              <FontAwesomeIcon icon={faStopCircle} /> Stop
            </DropdownItem>
            {/* TODO */}
            {/* <DropdownItem divider /> */}
            {/* <DropdownItem disabled>View Logs</DropdownItem> */}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      )
    }
    else {
      return (
        <div>
          <Button className="d-flex" color={color} disabled size={size}>
            { StatusText[status] }
            <Loader size="14" inline="true" margin="1" />
          </Button>
        </div>
        
      )
    }
  }
}

class NotebookServerRowProject extends Component {
  render() {
    return (
      <Link to={ `/projects/${this.props.id}` }>
        {this.props.display}
      </Link>
    )
  }
}

class NotebookServerRowFull extends Component {
  render() {
    const {annotations, status, url} = this.props;
    let columns;
    if (this.props.projectId) {
      columns = [annotations["branch"], annotations["commit-sha"].substring(0,8)];
    }
    else {
      const projectLink = <NotebookServerRowProject
        display={`${annotations["namespace"]}/${annotations["projectName"]}`}
        id={annotations["projectId"]}
      />
      columns = [projectLink, `${annotations["branch"]}/${annotations["commit-sha"].substring(0,8)}`];
    }
    return (
      <tr>
        <td className="align-middle">
          {columns[0]}
        </td>
        <td className="align-middle">
          {columns[1]}
        </td>
        <td className="align-middle">
          <NotebookServerRowAction
            status={status}
            name={this.props.name}
            onStopServer={this.props.onStopServer}
            url={url}
          />
        </td>
      </tr>
    )
  }
}

class NotebookServerRowCompact extends Component {
  render() {
    const {annotations, status, projectId, url} = this.props;
    let rowsHeader, rows;
    if (projectId) {
      rowsHeader = Columns.large.project;
      rows = [annotations["branch"], annotations["commit-sha"].substring(0,8)];
    }
    else {
      rowsHeader = Columns.large.default;
      const projectLink = <NotebookServerRowProject
        display={`${annotations["namespace"]}/${annotations["projectName"]}`}
        id={annotations["projectId"]}
      />
      rows = [projectLink, `${annotations["branch"]}/${annotations["commit-sha"].substring(0,8)}`];
    }

    return (
      <tr>
        <td>
          <span className="font-weight-bold">{rowsHeader[0]}: </span>
          <br className="d-sm-none" />
          <span>{rows[0]}</span>
          <br />
          <span className="font-weight-bold">{rowsHeader[1]}: </span>
          <br className="d-sm-none" />
          <span>{rows[1]}</span>
          <br />
          <NotebookServerRowAction
            status={status}
            name={this.props.name}
            onStopServer={this.props.onStopServer}
            url={url}
            small={true}
          />
        </td>
      </tr>
    )
  }
}

class NotebookServerRow extends Component {
  render() {
    const annotations = cleanAnnotations(this.props.annotations, "renku.io");
    const status = this.props.ready ?
      "running" :
      this.props.pending === "spawn" || this.props.pending === "stop" ?
        this.props.pending :
        "other";

    return (
      <Media query={ Sizes.md }>
        { matches =>
          matches ? (
            <NotebookServerRowFull
              {...this.props} status={status} annotations={annotations} />
          ) : (
            <NotebookServerRowCompact
              {...this.props} status={status} annotations={annotations} />
          )
        }
      </Media>
    )
  }
}

class NotebookServerHeaderFull extends Component {
  render() {
    const columns = this.props.projectId ?
      Columns.large.project :
      Columns.large.default
    return (
      <thead className="thead-light">
        <tr>
          <th className="align-middle">{columns[0]}</th>
          <th className="align-middle">{columns[1]}</th>
          <th className="align-middle" style={{width: "1px"}}>{columns[2]}</th>
        </tr>
      </thead>
    )
  }
}

class NotebookServerHeaderCompact extends Component {
  render() {
    const columns = this.props.projectId ?
      Columns.compact.project :
      Columns.compact.default
    return (
      <thead className="thead-light">
        <tr>
          <th className="align-middle">{columns[0]}</th>
        </tr>
      </thead>
    )
  }
}

class NotebookServersHeader extends Component {
  render() {
    return (
      <Media query={ Sizes.md }>
        { matches =>
          matches ? (
            <NotebookServerHeaderFull {...this.props} />
          ) : (
            <NotebookServerHeaderCompact {...this.props} />
          )
        }
      </Media>
    )
  }
}

class NotebookServersList extends Component {
  render() {
    const serverNames = Object.keys(this.props.servers).sort();
    if (serverNames.length === 0) {
      return <p>No server is currently running. You have to start one to connect to Jupyter.</p>
    }
    const rows = serverNames.map((k, i) =>
      <NotebookServerRow
        key={i}
        onStopServer={this.props.stop}
        projectId={this.props.projectId}
        {...this.props.servers[k]}
      />
    )
    return (
      <Table bordered>
        <NotebookServersHeader projectId={this.props.projectId} />
        <tbody>
          {rows}
        </tbody>
      </Table>
    )
  }
}

/**
 * Displays the list of available notebook servers.
 * 
 * @param {Object} servers   Servers as returned by renku-notebook "/servers" API
 * @param {function} stop   Function to invoke to stop the target notebook, requiring server name as parameter
 * @param {function} projectId   Required to focus on a single project (no project and namespace in the table)
 *     
 */
class NotebookServers extends Component {
  render() {
    const serverData = this.props.servers;
    if (!serverData || serverData === SpecialPropVal.UPDATING ) {
      return <Loader />
    }
    return (
      <Row>
        <Col md={12} lg={10} xl={8}>
          <NotebookServersList {...this.props} />
        </Col>
      </Row>
    )
  }
}

class NotebooksPopup extends Component {
  render() {
    if (this.props.servers) {
      return null;
    }
    return (
      <InfoAlert timeout={0}>
        <FontAwesomeIcon icon={faInfoCircle} /> You can start a new notebook by navigating to a project page.
        <br />Be sure to have at least Developer privileges, then open the Notebook Servers tab.
      </InfoAlert>
    ) 
  }
}

class Notebooks extends Component {
  render() {
    const serverNumbers = Object.keys(this.props.notebooks.all).length;
    return <Row>
      <Col>
        <h1>
          Notebooks
        </h1>
        <NotebookServers
          servers={this.props.notebooks.all}
          stop={this.props.handlers.onStopNotebook}
        />
        <NotebooksPopup servers={serverNumbers} />
      </Col>
    </Row>
  }
}

export { NotebookServerOptions, NotebookServers, LogOutUser, Notebooks }
