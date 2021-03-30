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

/**
 *  incubator-renku-ui
 *
 *  Landing.present.js
 *  Presentational components.
 */


import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Row, Col } from "reactstrap";
import { Navbar, Nav, Collapse, NavItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faClone, faCloudUploadAlt as faCloudUp, faCodeBranch, faHeart,
  faSearch, faShieldAlt as faShield, faUserFriends
} from "@fortawesome/free-solid-svg-icons";

import { RenkuNavLink } from "../utils/UIComponents";
import { Url } from "../utils/url";
import { StatuspageBanner } from "../statuspage";
import QuickNav from "../utils/quicknav";
import { RenkuMarkdown } from "../utils/UIComponents";
import { RenkuToolbarHelpMenu, RenkuToolbarNotifications } from "./NavBar";

import logo from "./logo.svg";
import VisualHead from "./Assets/Visual_Head.svg";

function HomeHeader(props) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const { urlMap } = props;

  return <Fragment>
    <Row key="statuspage">
      <Col>
        <StatuspageBanner siteStatusUrl={urlMap.siteStatusUrl} statuspageId={props.statuspageId}
          statuspageModel={props.statuspageModel} />
      </Col>
    </Row>
    <header className="px-0 pt-2 pb-4 d-flex rk-anon-home">
      <div className="align-self-center flex-grow-1">
        <img src={logo} alt="Renku" height="68" className="d-block my-1" />
      </div>
      <div className="px-2 mt-3 align-self-center">
        <RenkuNavLink to="/login" title="Login" id="link-login" className="btn" />
      </div>
      <div className="px-2 mt-1 align-self-center">
        <Button onClick={toggleOpen} id="nav-hamburger" className="border-0 mt-3">
          <FontAwesomeIcon icon={faBars} id="userIcon" />
        </Button>
      </div>
    </header>
    <div>
      <Collapse isOpen={isOpen} className="mt-2">
        <Navbar color="primary" className="container-fluid flex-wrap flex-lg-nowrap renku-container
          navbar rk-anon-home rk-navbar">
          <Nav className="ms-auto">
            <NavItem className="nav-item col-6 col-lg-auto pe-1">
              <QuickNav client={props.client} model={props.model} user={props.user} />
            </NavItem>
            <NavItem className="nav-item col-6 col-lg-auto">
              <RenkuNavLink to="/projects" title="Projects" id="link-projects" className="link-secondary" />
            </NavItem>
            <NavItem className="nav-item col-6 col-lg-auto">
              <RenkuNavLink to="/datasets" title="Datasets" id="link-datasets" />
            </NavItem>
            <NavItem className="nav-item col-6 col-lg-auto">
              <RenkuNavLink to="/environments" title="Environments" id="link-environments" />
            </NavItem>
            <NavItem className="nav-item col-1 col-lg-auto">
              <RenkuToolbarHelpMenu />
            </NavItem>
            <NavItem className="nav-item col-1 col-lg-auto">
              <RenkuToolbarNotifications {...props} />
            </NavItem>
          </Nav>
        </Navbar>
      </Collapse>
    </div>
  </Fragment>;
}


function RenkuProvidesHeader(props) {
  return <h3 className="text-primary">
    {props.title} <FontAwesomeIcon icon={props.icon} id={props.title.toLowerCase()} />
  </h3>;
}

function DefaultAnonymousHome(props) {
  const urlMap = props.urlMap;
  return <div>
    <Row key="statuspage">
      <Col>
        <StatuspageBanner siteStatusUrl={urlMap.siteStatusUrl} statuspageId={props.statuspageId}
          statuspageModel={props.statuspageModel} />
      </Col>
    </Row>
    <Row key="marquee">
      <Col>
        <section className="jumbotron-header rounded px-3 px-sm-4 py-3 py-sm-5 text-center mb-3">
          <Row>
            <Col md={6}>
              <h1>RENKU</h1>
              <h2>Collaborative Data Science</h2>
            </Col>
            <Col md={6} className="d-md-flex justify-content-center align-items-center">
              <div>
                <Link to="/login" id="login-button" className="btn btn-primary btn-lg">Login or Sign Up</Link>
              </div>
            </Col>
          </Row>
        </section>
      </Col>
    </Row>
    <Row key="content-header">
      <Col>
        <h1 className="text-center">Renku Enables</h1>
      </Col>
    </Row>
    <Row key="content-body">
      <Col md={6}>
        <RenkuProvidesHeader title="Reproducibility" icon={faClone} />
        <p className="mb-5">Renku <b>captures the lineage</b> of your work so recreating a
          critical piece of analysis is always possible. In addition, it tracks the details of
          your <b>computational environment</b> so that others can reliably work with your data and code.</p>

        <RenkuProvidesHeader title="Shareability" icon={faCloudUp} />
        <p className="mb-5">Need to <b>share your results</b> with a colleague? <b>Make your data available</b> to
          a project partner? <b>Work together</b> on a project with a teammate?
          Renku makes all of these easy. And Renku lets you <b>track everyone&#8217;s contribution</b> to
          the final result.
        </p>

        <RenkuProvidesHeader title="Federation" icon={faUserFriends} />
        <p className="mb-5">
          Collaborate across institutional boundaries,
          while maintaining complete control of your resources.
          Federation lets you <b>share</b> information, data, or code <b>without having to make any compromises</b>.
        </p>
      </Col>
      <Col md={6} className="mt-md-5">
        <RenkuProvidesHeader title="Reusability" icon={faCodeBranch} />
        <p className="mb-5">
          Stand on the shoulders of giants: <i>your colleagues</i>. Renku makes it simple
          to <b>reuse code and data</b> in other projects. No need for you to reinvent the
          wheel, and everyone profits from your improvements.
        </p>

        <RenkuProvidesHeader title="Security" icon={faShield} />
        <p className="mb-5">You have the freedom to share code or data with others, with the
          security of having <b>fine-grained control</b> over what is visible and what is kept private.
          You decide what information about your project is available to whom.
        </p>

        <RenkuProvidesHeader title="Discoverability" icon={faSearch} />
        <p className="mb-5">
          The extensible Renku knowledge graph captures information about your
          project&#8217;s data, code, processes, and lineage. With its <b>powerful search capabilities</b>,
          if it is in the system, you can always find the information you are looking for.
        </p>
      </Col>
    </Row>
    <Row key="tutorial" className="mb-3">
      <Col>
        Want to learn more? Create an account
        and <a href="https://renku.readthedocs.io/en/latest/tutorials/01_firststeps.html">follow the tutorial</a>.
      </Col>
    </Row>
    <Row key="closing">
      <Col>
        <h3 className="text-primary">
          <FontAwesomeIcon icon={faHeart} id="love" /> Give Renku a try.
          We think you&#8217;ll love it!
        </h3>
      </Col>
    </Row>
  </div>;
}

function CustomizedAnonymousHome(props) {
  let content = props.homeCustomized.mainContent;
  if (content.length < 1) content = "[No content provided: please configure text to display here.]";
  let backgroundUrl = props.homeCustomized.backgroundUrl;
  let backgroundSize = "cover";
  if (backgroundUrl.length < 1) {
    backgroundUrl = VisualHead;
    backgroundSize = "cover";
  }
  return <div style={{
    backgroundImage: `url(${backgroundUrl})`,
    backgroundSize, backgroundRepeat: "no-repeat",
    minWidth: "400px", minHeight: "700px"
  }}>
    <HomeHeader {...props} />
    <RenkuMarkdown key="home" markdownText={content} />
  </div>;
}

function AnonymousHome(props) {

  const urlMap = {
    siteStatusUrl: Url.get(Url.pages.help.status)
  };
  const p = { ...props, urlMap };

  return <div id="rk-anon-home-frame">
    {
      (props.homeCustomized.enabled) ?
        CustomizedAnonymousHome(p) :
        DefaultAnonymousHome(p)
    }
  </div>;
}

export default AnonymousHome;
