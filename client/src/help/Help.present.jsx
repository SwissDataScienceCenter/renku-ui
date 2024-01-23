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

import { Component } from "react";
import { Route } from "react-router-dom";

import { Row, Col } from "reactstrap";
import { Nav, NavItem } from "reactstrap";

import {
  faDiscourse,
  faGithub,
  faGitter,
} from "@fortawesome/free-brands-svg-icons";

import { StatuspageDisplay, isStatusConfigured } from "../statuspage";
import { RenkuNavLink } from "../components/RenkuNavLink";
import {
  ExternalDocsLink,
  ExternalIconLink,
} from "../components/ExternalLinks";
import { Docs, Links, RenkuPythonDocs } from "../utils/constants/Docs";
import { Url } from "../utils/helpers/url";

import HelpRelease from "./HelpRelease";

class HelpNav extends Component {
  render() {
    const statusLink = isStatusConfigured(this.props.statuspageId) ? (
      <NavItem>
        <RenkuNavLink to={Url.pages.help.status} title="Status" />
      </NavItem>
    ) : null;
    return (
      <Nav pills className={"nav-pills-underline"}>
        <NavItem>
          <RenkuNavLink
            to={Url.pages.help.base}
            alternate={Url.pages.help.getting}
            title="Getting Help"
          />
        </NavItem>
        <NavItem>
          <RenkuNavLink
            to={Url.pages.help.documentation}
            title="Documentation"
          />
        </NavItem>
        {statusLink}
        <NavItem>
          <RenkuNavLink
            to={Url.pages.help.release}
            title="Release Information"
          />
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
          There are several channels available for getting help with RenkuLab.
          Depending on your needs, one or another may be better for you.
        </div>
      </div>,
      <div key="main1" className="d-flex mb-3 flex-wrap">
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink
              url={Links.DISCOURSE}
              icon={faDiscourse}
              title="Forum"
            />
          </h3>
          <p>
            We maintain a{" "}
            <ExternalDocsLink url={Links.DISCOURSE} title="help forum" /> for
            discussion about Renku. This is a good place to ask questions and
            find answers.
          </p>
        </div>
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink
              url={Links.GITTER}
              icon={faGitter}
              title="Gitter"
            />
          </h3>
          <p>
            Want to reach out to the development team live? Contact us on{" "}
            <ExternalDocsLink url={Links.GITTER} title="Gitter" />, we would be
            happy to chat with you.
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
            <ExternalDocsLink url={Links.GITHUB} title="GitHub" />. This is the
            best place to report issues and ask for new features, but feel free
            to contact us with questions, comments, or any kind of feedback.
          </p>
        </div>
      </div>,
    ];
  }
}

class HelpDocumentation extends Component {
  render() {
    return (
      <Row>
        <Col md={8}>
          <h3>
            <ExternalDocsLink
              url={Docs.READ_THE_DOCS_TUTORIALS_STARTING}
              title="Tutorial"
            />
          </h3>
          <p>
            If you are here for the first time or you are not sure how to use
            Renku, we recommend you to go through our{" "}
            <ExternalDocsLink
              url={Docs.READ_THE_DOCS_TUTORIALS_STARTING}
              title="tutorial"
            />
            .
          </p>
          <h3>
            <ExternalDocsLink url={Docs.READ_THE_DOCS_ROOT} title="Renku" />
          </h3>
          <p>
            The{" "}
            <ExternalDocsLink
              url={Docs.READ_THE_DOCS_ROOT}
              title="Renku project documentation"
            />{" "}
            explains Renku as a whole. It describes the parts that make it up,
            how they fit together, and how to use Renku in your data-science
            projects to work more effectively.
          </p>
          <h3>
            <ExternalDocsLink
              url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
              title="Renku CLI"
            />
          </h3>
          <p>
            The{" "}
            <ExternalDocsLink
              url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
              title="command-line-interface (CLI) documentation"
            />{" "}
            details the commands of the CLI, their parameters and options, and
            their behavior.
          </p>
        </Col>
      </Row>
    );
  }
}

class HelpContent extends Component {
  render() {
    return [
      <Route
        exact
        path={Url.pages.help.base}
        key="base"
        render={() => <HelpGetting key="getting" {...this.props} />}
      />,
      <Route
        path={Url.pages.help.getting}
        key="getting"
        render={() => <HelpGetting key="getting" {...this.props} />}
      />,

      <Route
        path={Url.pages.help.documentation}
        key="documentation"
        render={() => <HelpDocumentation key="documentation" {...this.props} />}
      />,
      <Route
        path={Url.pages.help.status}
        key="status"
        render={() => (
          <StatuspageDisplay key="status" model={this.props.model} />
        )}
      />,
      <Route
        path={Url.pages.help.release}
        key="release"
        render={() => <HelpRelease key="release" params={this.props.params} />}
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
      </Row>,
    ];
  }
}

export { Help };
