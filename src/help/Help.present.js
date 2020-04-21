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

import React, { Component } from "react";
import { Route } from "react-router-dom";
import { ExternalDocsLink, ExternalIconLink, RenkuNavLink } from "../utils/UIComponents";

import { Row, Col } from "reactstrap";
import { Nav, NavItem } from "reactstrap";

import { faDiscourse, faGithub, faGitter } from "@fortawesome/free-brands-svg-icons";

class HelpNav extends Component {
  render() {
    return (
      <Nav pills className={"nav-pills-underline"}>
        <NavItem>
          <RenkuNavLink to={this.props.url.base} alternate={this.props.url.getting} title="Getting Help" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.url.documentation} title="Documentation" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.url.features} title="Features" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.url.setup} title="Set Up / Admin" />
        </NavItem>
      </Nav>
    );
  }
}

class HelpGetting extends Component {
  render() {
    const flexBasis = "500px";
    return [
      <div key="intro" className="d-flex mb-3">
        <div style={{ flex: "0 1", flexBasis }}>
          There are several channels available for getting help with Renkulab. Depending on your needs, one or another
          may be better for you.
        </div>
      </div>,
      <div key="main1" className="d-flex mb-3 flex-wrap">
        <div className="mr-4" style={{ flex: "0 1", flexBasis }}>
          <h2>
            <ExternalIconLink url="https://renku.discourse.group" icon={faDiscourse} title="Forum" />
          </h2>
          <p>
            We maintain a <ExternalDocsLink url="https://renku.discourse.group" title="help forum" /> for
            discussion about Renku. This is a good place to ask questions and find answers.
          </p>
        </div>
        <div className="mr-4" style={{ flex: "0 1", flexBasis }}>
          <h2>
            <ExternalIconLink url="https://gitter.im/SwissDataScienceCenter/renku" icon={faGitter} title="Gitter" />
          </h2>
          <p>
            Want to reach out to the development team live? Contact us on{" "}
            <ExternalDocsLink url="https://gitter.im/SwissDataScienceCenter/renku" title="Gitter" />, we would be happy
            to chat with you.
          </p>
        </div>
        <div className="mr-4" style={{ flex: "0 1", flexBasis }}>
          <h2>
            <ExternalIconLink
              url="https://github.com/SwissDataScienceCenter/renku"
              icon={faGithub}
              title="GitHub"
            />
          </h2>
          <p>
            Renku is open source and being developed on{" "}
            <ExternalDocsLink url="https://github.com/SwissDataScienceCenter/renku" title="GitHub" />. This is the best
            place to report issues and ask for new features, but feel free to contact us with questions, comments, or
            any kind of feedback.
          </p>
        </div>
      </div>
    ];
  }
}

class HelpDocumentation extends Component {
  render() {
    return (
      <div>
        <h2>
          <ExternalDocsLink url="https://renku.readthedocs.io/en/latest/tutorials/firststeps.html"
            title="Tutorial" />
        </h2>
        <p>
          If you are here for the first time or you are not sure how to use Renku, we recommend you
          to go through our {" "}
          <ExternalDocsLink url="https://renku.readthedocs.io/en/latest/tutorials/firststeps.html" title="tutorial" />.
        </p>
        <h2>
          <ExternalDocsLink url="https://renku.readthedocs.io/en/latest/"
            title="Renku" /> and {" "}
          <ExternalDocsLink url="https://renku-python.readthedocs.io/en/latest/"
            title="Renku CLI" /> Documentation
        </h2>
        <p>
          Documentation on the Renku project in general is at {" "}
          <ExternalDocsLink url="https://renku.readthedocs.io/en/latest/" title="renku.readthedocs.io" />.
        </p>
        <p>
          The command-line-interface is documented in detail at {" "}
          <ExternalDocsLink url="https://renku-python.readthedocs.io/en/latest/" title="renku-python.readthedocs.io" />.
        </p>
      </div>
    );
  }
}

class HelpFeatures extends Component {
  render() {
    return (
      <Row>
        <Col md={8}>
          <h2>Features</h2>
          <p>
            Renku consists of a collection of services, including a web-based user interface and a command-line client,
            exploiting in a coherent setup the joint features of:
          </p>
          <ul>
            <li>
              <a href="https://gitlab.com" target="_blank" rel="noreferrer noopener">
                GitLab
              </a>{" "}
              - repository management
            </li>
            <li>
              <a href="http://jupyter.org/hub" target="_blank" rel="noreferrer noopener">
                JupyterHub
              </a>{" "}
              - interactive notebooks
            </li>
            <li>
              <a href="https://kubernetes.io" target="_blank" rel="noreferrer noopener">
                Kubernetes
              </a>{" "}
              - container orchestration
            </li>
            <li>
              <a href="https://www.keycloak.org" target="_blank" rel="noreferrer noopener">
                Keycloak
              </a>{" "}
              - identity and access management
            </li>
            <li>
              <a href="https://www.commonwl.org" target="_blank" rel="noreferrer noopener">
                Common Workflow Language
              </a>{" "}
              - analysis workflows &amp; tools description
            </li>
          </ul>
          <p>
            More information is available in our{" "}
            <a
              href="https://renku.readthedocs.io/en/latest/introduction/index.html#features"
              target="_blank"
              rel="noreferrer noopener"
            >
              documentation
            </a>
            .
          </p>
        </Col>
      </Row>
    );
  }
}

class HelpSetup extends Component {
  render() {
    return (
      <div>
        <h2>Running the platform</h2>
        <p>
          It is easy to deploy the Renku platform on{" "}
          <a href="https://github.com/kubernetes/minikube" target="_blank" rel="noreferrer noopener">
            minikube
          </a>
          . You can find the instructions on our{" "}
          <a
            href="https://renku.readthedocs.io/en/latest/developer/setup.html"
            target="_blank"
            rel="noreferrer noopener"
          >
            documentation
          </a>
          .
        </p>
      </div>
    );
  }
}

class HelpContent extends Component {
  render() {
    return [
      <Route
        exact
        path={this.props.url.base}
        key="base"
        render={props => <HelpGetting key="getting" {...this.props} />}
      />,
      <Route
        path={this.props.url.getting}
        key="getting"
        render={props => <HelpGetting key="getting" {...this.props} />}
      />,
      <Route
        path={this.props.url.documentation}
        key="documentation"
        render={props => <HelpDocumentation key="documentation" {...this.props} />}
      />,
      <Route
        path={this.props.url.features}
        key="features"
        render={props => <HelpFeatures key="features" {...this.props} />}
      />,
      <Route path={this.props.url.setup} key="setup" render={props => <HelpSetup key="setup" {...this.props} />} />
    ];
  }
}

class Help extends Component {
  render() {
    return [
      <Row key="header">
        <Col md={8}>
          <h1>Using Renku</h1>
        </Col>
      </Row>,
      <Row key="spacePre">
        <Col>&nbsp;</Col>
      </Row>,
      <Row key="nav">
        <Col>
          <HelpNav {...this.props} />
        </Col>
      </Row>,
      <Row key="spacePost">
        <Col>&nbsp;</Col>
      </Row>,
      <Row key="content">
        <Col>
          <HelpContent {...this.props} />
        </Col>
      </Row>
    ];
  }
}

export { Help };
