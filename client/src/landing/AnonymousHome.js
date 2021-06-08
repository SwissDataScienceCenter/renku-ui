/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
import { HashLink } from "react-router-hash-link";
import { Button, Row, Col } from "reactstrap";
import { Navbar, Nav, Collapse, NavItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars
} from "@fortawesome/free-solid-svg-icons";

import { RenkuNavLink, ExternalLink } from "../utils/UIComponents";
import { Url } from "../utils/url";
import { StatuspageBanner } from "../statuspage";
import QuickNav from "../utils/quicknav";
import { RenkuMarkdown } from "../utils/UIComponents";
import { RenkuToolbarHelpMenu, RenkuToolbarNotifications } from "./NavBar";

import logo from "./logo.svg";
import Arrow_left from "./Assets/Arrow_left.svg";
import Arrow_right from "./Assets/Arrow_right.svg";
import Icon_Data_Scientists from "./Assets/Icon_Data_Scientists.svg";
import Icon_Teams from "./Assets/Icon_Teams.svg";
import Icon_Specialists from "./Assets/Icon_Specialists.svg";
import Illustration_Theory_Practice from "./Assets/Illustration_Theory_Practice.svg";
import VisualHead from "./Assets/Visual_Head.svg";
import VisualDetail from "./Assets/Visual_Detail.svg";
import VisualFooter from "./Assets/Visual_Footer.svg";

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
      <div className="px-2 mt-3 align-self-center bg-primary">
        <Link className="btn btn-outline-secondary" role="button" id="login-button" to="/login">
          Login
        </Link>
      </div>
      <div className="px-2 mt-1 align-self-center bg-primary">
        <Button onClick={toggleOpen} id="nav-hamburger" className="border-0 mt-3">
          <FontAwesomeIcon icon={faBars} id="userIcon" />
        </Button>
      </div>
    </header>
    <div>
      <Collapse isOpen={isOpen} className="mt-2">
        <Navbar className="navbar rk-anon-home px-0">
          <Nav className="ms-auto flex-column text-end">
            <NavItem className="nav-item pe-1">
              <QuickNav client={props.client} model={props.model} user={props.user} />
            </NavItem>
            <NavItem className="nav-item">
              <RenkuNavLink to="/projects" title="Projects" id="link-projects" className="link-secondary" />
            </NavItem>
            <NavItem className="nav-item">
              <RenkuNavLink to="/datasets" title="Datasets" id="link-datasets" />
            </NavItem>
            <NavItem className="nav-item">
              <RenkuNavLink to="/environments" title="Environments" id="link-environments" />
            </NavItem>
            <NavItem className="nav-item">
              <RenkuToolbarHelpMenu />
            </NavItem>
            <NavItem className="nav-item">
              <RenkuToolbarNotifications {...props} />
            </NavItem>
          </Nav>
        </Navbar>
      </Collapse>
    </div>
  </Fragment>;
}

function Section1(props) {
  const backgroundUrl = VisualHead;
  return <div id="rk-anon-home-section1"
    style={{
      backgroundImage: `url(${backgroundUrl})`
    }}>
    <HomeHeader {...props} />
    <div className="rk-anon-home-section-content">
      <Row>
        <Col className="rk-pt-l rk-w-s" >
          <h1 className="text-white">Connecting people, data, and insights</h1>
        </Col>
      </Row>
      <Row>
        <Col className="rk-pt-s rk-w-s">
          <h3 className="text-secondary">Renku bridges the gaps to make data-driven workflows more collaborative.</h3>
        </Col>
      </Row>
      <Row>
        <Col className="rk-pt-s rk-w-s">
          <HashLink className="btn btn-outline-rk-pink" role="button"
            to="#rk-anon-home-section2">
            Learn more
          </HashLink>
        </Col>
      </Row>
    </div>
  </div>;
}

function Section2(props) {
  return <div id="rk-anon-home-section2">
    <div className="rk-anon-home-section-content">
      <Row className="rk-pt-m">
        <Col md={4}>
          <h3 className="text-rk-pink">Bringing everyone together!</h3>
        </Col>
        <Col md={{ size: 7, offset: 1 }}>
          <h3 className="text-secondary">Successful data science requires collaboration; <br />
            with Renku, everyone can make a contribution.
          </h3>
        </Col>
      </Row>
      <Row className="rk-pt-l">
        <Col className="d-md-flex">
          <div>
            <div className="text-center"><img alt="data scientists" src={Icon_Data_Scientists} /></div>
            <h3 className="rk-pt-s">Data Scientists</h3>
            <p>
              Work with the tools you love, like JupyterLab or RStudio. Show your findings
              visually and discuss results with others. Reproduce past work and reuse
              successful pipelines.
            </p>
          </div>
          <div className="rk-pt-s">
            <div className="rk-pt-m d-none d-md-inline"><img alt="arrow right" src={Arrow_right} /></div>
          </div>
          <div>
            <div className="text-center"><img alt="teams" src={Icon_Teams} /></div>
            <h3 className="rk-pt-s">Teams</h3>
            <p>
              Share data, code, and workflows. Make interactive
              tools available. Each team member can bring their unique abilities to
              the table.
            </p>
          </div>
          <div className="rk-pt-s">
            <div className="d-none d-md-inline"><img alt="arrow left" src={Arrow_left} /></div>
          </div>
          <div>
            <div className="text-center"><img alt="specialists" src={Icon_Specialists} /></div>
            <h3 className="rk-pt-s">Specialists</h3>
            <p>
              Share your data and your expertise, and make use of the skills of others.
              Renku tracks contributions, so your work is seen and credited.
              Understand how results are created and provide feedback.
            </p>
          </div>
        </Col>
      </Row>
    </div>
  </div>;
}

function Section3(props) {
  return <div id="rk-anon-home-section3">
    <div className="rk-anon-home-section-content">
      <Row className="rk-pt-m">
        <Col md={4} lg={6} className="p-s-4 rk-bg-white"
          style={{ minWidth: "400px", maxWidth: "600px",
            borderWidth: "20px", borderStyle: "solid", borderColor: "white" }}>
          <img width="100%" alt="data science theory/practice" src={Illustration_Theory_Practice} />
        </Col>
        <Col md={8} lg={6} className="rk-pt-m rk-pl-lg-s" style={{ minWidth: "350px", maxWidth: "460px" }}>
          <h3>Data-driven projects are messy</h3>
          <p>
            To get results, data and code may be gathered anew, or re-purposed and recombined from other projects.
            Paths are followed, discarded and tried anew before finally getting to
            the destination Renku accompanies the journey and helps you make sense of it.
            All activity within Renku is captured in the Knowledge Graph.
            This makes it possible to connect the dots, no matter where they lead.
          </p>
        </Col>
      </Row>
    </div>
  </div>;
}

function TutorialLink(props) {
  const url = props.url;
  if ((url == null) || (url.length < 1))
    return null;

  if (url.startsWith("http")) {
    return <ExternalLink
      title="Follow the tutorial"
      className="btn btn-outline-rk-pink" role="button" id="link-learn"
      showLinkIcon={true}
      url={url} />;
  }
  return <Link className="btn btn-outline-rk-pink" role="link" id="link-tutorial" to={url}>
    Follow the tutorial
  </Link>;
}

function Section4(props) {
  const backgroundUrl = VisualDetail;
  return <div id="rk-anon-home-section4"
    style={{
      backgroundImage: `url(${backgroundUrl})`
    }}>
    <div className="rk-anon-home-section-content">
      <div className="rk-w-s">
        <div className="rk-pt-l">
          <h3 className="text-rk-pink">Connecting dots</h3>
        </div>
        <div className="rk-pt-s">
          <h3 className="text-white">The knowledge graph powers Renku and helps you
            make sense of what has been done.</h3>
        </div>
        <div className="rk-pt-m">
          <h3 className="text-secondary">Ready to try it out?</h3>
          <h3 className="text-rk-pink">Get started with Renku</h3>
        </div>
      </div>
      <div className="d-flex flex-wrap rk-pt-s">
        <div className="pt-2" style={{ minWidth: "160px" }}>
          <span>
            <Link className="btn btn-outline-secondary me-1" role="button" id="link-sign_up" to="/login">
        &nbsp;Sign Up
            </Link>
            (It&apos;s free)
          </span>
        </div>
        <div className="pt-2" style={{ minWidth: "185px" }}>
          <TutorialLink url={props.tutorialLink} />
        </div>
        <div className="pt-2" style={{ minWidth: "180px" }}>
          <ExternalLink
            title="Learn more"
            className="btn btn-outline-rk-pink" role="button" id="link-learn"
            showLinkIcon={true}
            url="https://renku.readthedocs.io/en/latest/" />
        </div>
      </div>
    </div>
  </div>;
}

function Section5(props) {
  return (props.projects == null) || (props.projects.length < 1) ?
    <div id="rk-anon-home-section5-empty">
      <div className="rk-anon-home-section-content">
        <div className="rk-pt-l">
          <h3 className="text-rk-pink">&nbsp;</h3>
        </div>
      </div>
    </div> :
    <div id="rk-anon-home-section5">
      <div className="rk-anon-home-section-content">
        <div className="rk-pt-l">
          <h3 className="text-rk-pink">Look at some example projects</h3>
        </div>
      </div>
    </div>;
}

function Section6(props) {
  const backgroundUrl = VisualFooter;
  return <div id="rk-anon-home-section6"
    style={{
      backgroundImage: `url(${backgroundUrl})`
    }}>
    <div className="rk-anon-home-section-content">
      <div>
        <div><img src={logo} alt="Renku" height="68" className="d-block my-1" /></div>
        <Row className="rk-pt-s" >
          <Col xs={12} xl={4} >
            <p>We have offices in both Lausanne on the EPFL campus and in Zürich at ETH Zürich.</p>
          </Col>
          <Col xs={12} lg={5} xl={4} className="rk-pt-up_to-lg-s bg-primary">
            <h4 className="text-rk-pink">Lausanne</h4>
            <p className="rk-pt-lg-s">
              INN Building, Station 14, 1015 Lausanne<br />
              Contact: Cindy Ravey, Executive Assistant<br />
              +41 21 693 43 88
            </p>
          </Col>
          <Col xs={12} lg={5} xl={4} className="rk-pt-up_to-lg-s bg-primary">
            <h4 className="text-rk-pink">Zürich</h4>
            {/* eslint-disable-next-line */}
            <p className="rk-pt-lg-s">
              Universitätsstrasse 25, 8006 Zürich<br />
              Contact: Nina Pupikofer, Administration<br />
              +41 44 632 80 74
            </p>
          </Col>
        </Row>
      </div>
    </div>
  </div>;
}


function StandardHome(props) {
  return <Fragment>
    <Section1 {...props} />
    <Section2 />
    <Section3 />
    <Section4 tutorialLink={props.homeCustomized.tutorialLink} />
    <Section5 projects={props.homeCustomized.projects} />
    <Section6 />
  </Fragment>;
}

function CustomizedAnonymousHome(props) {
  let content = props.homeCustomized.custom.main.contentMd;
  if (content.length < 1) content = "[No content provided: please configure text to display here.]";
  let backgroundUrl = props.homeCustomized.custom.main.backgroundImage.url;
  let backgroundSize = "cover";
  if (backgroundUrl.length < 1) {
    backgroundUrl = VisualHead;
    backgroundSize = "cover";
  }
  return <div id="rk-anon-home-section1" style={{
    backgroundImage: `url(${backgroundUrl})`,
    backgroundSize, backgroundRepeat: "no-repeat"
  }}>
    <HomeHeader {...props} />
    <div className="rk-anon-home-section-content">
      <Row>
        <Col className="rk-pt-l rk-w-s" >
          <RenkuMarkdown key="home" markdownText={content} />
        </Col>
      </Row>
    </div>
  </div>;
}

function AnonymousHome(props) {

  const urlMap = {
    siteStatusUrl: Url.get(Url.pages.help.status)
  };
  const p = { ...props, urlMap };

  return <div id="rk-anon-home-frame">
    {
      (props.homeCustomized.custom.enabled) ?
        CustomizedAnonymousHome(p) :
        StandardHome(p)
    }
  </div>;
}

export default AnonymousHome;
