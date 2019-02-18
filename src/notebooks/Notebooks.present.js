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
import { Form, FormGroup, Label, Input, Button, Row, Col, Table} from 'reactstrap';

class NotebookServerOptions extends React.Component {
  render() {

    const renderedServerOptions = Object.keys(this.props.serverOptions).map(key => {
      const serverOption = this.props.serverOptions[key];
      const onChange = this.props.changeHandlers[key];

      switch (serverOption.type) {

        case 'enum':
          return <FormGroup key={key}>
            <Label>{serverOption.displayName}</Label>
            <EnumOption {...serverOption} onChange={onChange}/>
          </FormGroup>;

        case 'int':
          return <FormGroup key={key}>
            <Label>{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
            <RangeOption step={1} {...serverOption} onChange={onChange}/>
          </FormGroup>;

        case 'float':
          return <FormGroup key={key}>
            <Label>{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
            <RangeOption step={0.01} {...serverOption} onChange={onChange}/>
          </FormGroup>;

        case 'boolean':
          return <FormGroup key={key} check>
            <BooleanOption {...serverOption} onChange={onChange}/>
            <Label>{`${serverOption.displayName}`}</Label>
          </FormGroup>;

        default:
          return null;
      }
    });

    return (
      <div className="container">
        <Row key="header">
          <Col sm={12} md={6}><h3>Launch new Jupyterlab server</h3></Col>
        </Row>
        <Row key="spacer"><Col sm={8} md={6} lg={4} xl={3}>&nbsp;</Col></Row>
        <Row key="form"><Col sm={8} md={6} lg={4} xl={3}>
          <Form>
            {renderedServerOptions}
            <Button onClick={this.props.onSubmit} color="primary">
              Launch Server
            </Button>
          </Form>
        </Col></Row>
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


class NotebookServerRow extends Component {
  render() {
    const name = this.props.name;
    const url = this.props.url;
    return <tr>
      <td>{name}</td>
      <td>
        <a className="btn btn-primary" role="button" href={url}>Connect</a>
      </td>
      <td>
        <button className="btn btn-primary" type="button" onClick={(e) => this.props.onStopServer(name)}>
          Stop
        </button>
      </td>
    </tr>
  }
}

class NotebookServers extends Component {
  render() {
    const serverData = this.props.servers;
    const serverNames = Object.keys(serverData).sort();
    if (serverNames.length === 0) {
      return <p>No servers</p>
    }
    const rows = serverNames.map((k, i) =>
      <NotebookServerRow key={i} onStopServer={this.props.stop} {...serverData[k]} />
    )
    return <Table size={"sm"}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Connect</th>
          <th>Stop</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Table>
  }
}

export { NotebookServerOptions, NotebookServers }
