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

import React, { Component, Fragment } from "react";
import { Route } from "react-router-dom";

import { Row, Col } from "reactstrap";
import { Nav, NavItem } from "reactstrap";

import { faDiscourse, faGithub, faGitter } from "@fortawesome/free-brands-svg-icons";

import { WhatsNew1_0_0 as WhatsNew } from "./WhatsNew";
import { StatuspageDisplay, isStatusConfigured } from "../statuspage";
import { RenkuNavLink } from "../utils/components/RenkuNavLink";
import { ExternalDocsLink, ExternalIconLink, ExternalLink } from "../utils/components/ExternalLinks";
import { Docs, Links, RenkuPythonDocs } from "../utils/constants/Docs";

const discourseUrl = Links.DISCOURSE;

class HelpNav extends Component {
  render() {
    const statusLink = isStatusConfigured(this.props.statuspageId) ?
      <NavItem>
        <RenkuNavLink to={this.props.url.status} title="Status" />
      </NavItem> :
      null;
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
        { statusLink }
        <NavItem>
          <RenkuNavLink to={this.props.url.changes} title="What's New" />
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
          There are several channels available for getting help with RenkuLab. Depending on your needs, one or another
          may be better for you.
        </div>
      </div>,
      <div key="main1" className="d-flex mb-3 flex-wrap">
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink url={Links.DISCOURSE} icon={faDiscourse} title="Forum" />
          </h3>
          <p>
            We maintain a <ExternalDocsLink url={discourseUrl} title="help forum" /> for
            discussion about Renku. This is a good place to ask questions and find answers.
          </p>
        </div>
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink url={Links.GITTER} icon={faGitter} title="Gitter" />
          </h3>
          <p>
            Want to reach out to the development team live? Contact us on{" "}
            <ExternalDocsLink url={Links.GITTER} title="Gitter" />, we would be happy
            to chat with you.
          </p>
        </div>
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink
              url={Links.GITHUB}
              icon={faGithub}
              title="GitHub"
            />
          </h3>
          <p>
            Renku is open source and being developed on{" "}
            <ExternalDocsLink url={Links.GITHUB} title="GitHub" />. This is the best
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
      <Row>
        <Col md={8}>
          <h3>
            <ExternalDocsLink url={`${Docs.READ_THE_DOCS_TUTORIALS}/01_firststeps.html`} 
              title="Tutorial" />
          </h3>
          <p>
            If you are here for the first time or you are not sure how to use Renku, we recommend you
            to go through our {" "}
            <ExternalDocsLink url={`${Docs.READ_THE_DOCS_TUTORIALS}/01_firststeps.html`}
              title="tutorial" />.
          </p>
          <h3>
            <ExternalDocsLink url={Docs.READ_THE_DOCS_ROOT}
              title="Renku" />
          </h3>
          <p>
            The <ExternalDocsLink url={Docs.READ_THE_DOCS_ROOT}
              title="Renku project documentation" /> explains Renku as a whole. It describes
            the parts that make it up, how they fit together, and how to use Renku in your
            data-science projects to work more effectively.
          </p>
          <h3>
            <ExternalDocsLink url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
              title="Renku CLI" />
          </h3>
          <p>
            The <ExternalDocsLink url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
              title="command-line-interface (CLI) documentation" /> details the commands of the
            CLI, their parameters and options, and their behavior.
          </p>
        </Col>
      </Row>
    );
  }
}

class HelpFeatures extends Component {
  render() {
    return (
      <Row>
        <Col md={8}>
          <h3>Features</h3>
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
              href={`${Docs.READ_THE_DOCS_INTRODUCTION}/index.html#features`}
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

function HelpChanges() {
  // eslint-disable-next-line
  const discourseNewTopicUrl = `${discourseUrl}/new-topic?category=Renkulab`;

  return <Fragment>
    <Row>
      <Col md={8}>
        <h3>Changes to the UI [version 1.0.0]</h3>
        <p>
          For this new version, we have been working hard to improve the experience of using RenkuLab.
          Here are some of the changes you can expect to find.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <WhatsNew />
      </Col>
    </Row>
    <Row className="mt-4 pt-4">
      <Col md={8}>
        <h4>Feedback</h4>
        <p>
          We are interested in hearing from you about the new UI! {" "}
          <ExternalLink
            url={discourseNewTopicUrl} role="text"
            title="Feel free to share your suggestions or general thoughts" />.
        </p>
      </Col>
    </Row>
    <Row className="mt-4 pt-4">
      <Col md={8}>
        <h3>Ongoing Improvements</h3>
        <p>
          And we are not done yet! We have some are deeper improvements planned
          to streamline the user experience and make RenkuLab easier and more enjoyable to use. If you
          have any ideas for features you would like, feel free to {" "}
          <ExternalLink url={discourseNewTopicUrl} role="text" title="let us know" />!
        </p>
      </Col>
    </Row>
  </Fragment>;
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
      <Route
        path={this.props.url.status} key="status"
        render={props => <StatuspageDisplay key="status" model={this.props.model} />} />,
      <Route
        path={this.props.url.changes}
        key="changes"
        render={props => <HelpChanges key="changes" {...this.props} />}
      />,
    ];
  }
}

class Help extends Component {
  render() {
    return [
      <Row key="header" className="pt-2 pb-3">
        <Col className="d-flex mb-2 justify-content-between">
          <h2>Using Renku</h2>
        </Col>
      </Row>,
      <Row key="nav" className="pb-2">
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
