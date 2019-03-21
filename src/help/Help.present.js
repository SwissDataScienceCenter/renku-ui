/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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
 *  Help.present.js
 *  Presentational components for help.
 */


import React, { Component } from 'react';
import { Route }  from 'react-router-dom';
import { RenkuNavLink } from '../utils/UIComponents';

import { Row, Col } from 'reactstrap';
import { Nav, NavItem } from 'reactstrap';


class HelpNav extends Component {
  render() {
    return (
      <Nav pills className={'nav-pills-underline'}>
        <NavItem>
          <RenkuNavLink to={this.props.url.base} alternate={this.props.url.getting} title="Getting Help" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.url.tutorials} title="Tutorials" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.url.features} title="Features" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.url.setup} title="Set Up / Admin" />
        </NavItem>
      </Nav> 
    )
  }
}

class HelpGetting extends Component {
  render() {
    return (
      <div>
        <h2>Gitter</h2>
        <p>
          Want to reach out to the development team? Contact us
          on <a href="https://gitter.im/SwissDataScienceCenter/renku" target="_blank" rel="noreferrer noopener">
            Gitter</a>,
          we would be happy to chat with you.
        </p>
        <h2>GitHub</h2>
        <p>
          Renku is open source and being developed
          on <a href="https://github.com/SwissDataScienceCenter/renku" target="_blank" rel="noreferrer noopener">
            GitHub</a>.
          We encourage you to contact us with questions, comments, issues, or any kind of feedback.
        </p>
      </div>
    )
  }
}

class HelpTutorials extends Component {
  render() {
    return (
      <div>
        <h2>First steps</h2>
        <p>
          If you are here for the first time or you are not sure how to use Renku, we reccomend you to go through
          our <a href="https://renku.readthedocs.io/en/latest/user/firststeps.html"
            target="_blank" rel="noreferrer noopener">tutorial</a>.
        </p>
      </div>
    )
  }
}

class HelpFeatures extends Component {
  render() {
    return (
      <div>
        <h2>Features</h2>
        <p>
          Renku consists of a collection of services, including a web-based user interface
          and a command-line client, exploiting in a coherent setup the joint features of:
        </p>
        <ul>
          <li><a href="https://gitlab.com" target="_blank" rel="noreferrer noopener">
            GitLab</a> -  repository management</li>
          <li><a href="http://jupyter.org/hub" target="_blank" rel="noreferrer noopener">
            JupyterHub</a> - interactive notebooks</li>
          <li><a href="https://kubernetes.io" target="_blank" rel="noreferrer noopener">
            Kubernetes</a> - container orchestration</li>
          <li><a href="https://www.keycloak.org" target="_blank" rel="noreferrer noopener">
            Keycloak</a> - identity and access management</li>
          <li>
            <a href="https://www.commonwl.org" target="_blank" rel="noreferrer noopener">
              Common Workflow Language</a> - analysis workflows &amp; tools description
          </li>
        </ul>
        <p>
          More information is available in
          our <a href="https://renku.readthedocs.io/en/latest/introduction/index.html#features"
            target="_blank" rel="noreferrer noopener">documentation</a>.
        </p>
      </div>
    )
  }
}

class HelpSetup extends Component {
  render() {
    return (
      <div>
        <h2>Running the platform</h2>
        <p>
          It is easy to deploy the Renku platform
          on <a href="https://github.com/kubernetes/minikube" target="_blank" rel="noreferrer noopener">
              minikube</a>.
          You can find the instructions on
          our <a href="https://renku.readthedocs.io/en/latest/developer/setup.html"
            target="_blank" rel="noreferrer noopener">documentation</a>.
        </p>
      </div>
    )
  }
}

class HelpContent extends Component {
  render() {
    return [
      <Route exact path={this.props.url.base} key="base" 
        render={props => <HelpGetting key="getting" {...this.props} />} />,
      <Route path={this.props.url.getting} key="getting" 
        render={props => <HelpGetting key="getting" {...this.props} />} />,
      <Route path={this.props.url.tutorials} key="tutorials" 
        render={props => <HelpTutorials key="tutorials" {...this.props} />} />,
      <Route path={this.props.url.features} key="features" 
        render={props => <HelpFeatures key="features" {...this.props} />} />,
      <Route path={this.props.url.setup} key="setup" 
        render={props => <HelpSetup key="setup" {...this.props} />} />,
    ]        
  }
}

class Help extends Component {
  render() {
    return [
      <Row key="header"><Col md={8}><h1>Using Renku</h1></Col></Row>,
      <Row key="spacePre"><Col xs={12}>&nbsp;</Col></Row>,
      <Row key="nav"><Col xs={12}><HelpNav {...this.props} /></Col></Row>,
      <Row key="spacePost"><Col xs={12}>&nbsp;</Col></Row>,
      <Row key="content"><Col md={8}><HelpContent {...this.props} /></Col></Row>,
    ];
  }
}

export { Help }
