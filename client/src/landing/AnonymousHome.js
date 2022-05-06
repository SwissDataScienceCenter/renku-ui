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
  faBars, faBook
} from "@fortawesome/free-solid-svg-icons";

import {
  faYoutube, faTwitter, faMedium, faGithub
} from "@fortawesome/free-brands-svg-icons";

import { Url } from "../utils/helpers/url";
import { StatuspageBanner } from "../statuspage";
import QuickNav from "../utils/components/quicknav";
import { RenkuToolbarHelpMenu, RenkuToolbarNotifications } from "./NavBar";
import { NavBarWarnings } from "./NavBarWarnings";

import VisualHead from "./Assets/Visual_Head.svg";
import VisualDetail from "./Assets/Visual_Detail.svg";
import VisualFooter from "./Assets/Visual_Footer.svg";

import graphic_containers from "./Graphics/Features/Containers.svg";
import graphic_data from "./Graphics/Features/Data.svg";
import graphic_gitGitlab from "./Graphics/Features/GitGitlab.svg";
import graphic_provenance from "./Graphics/Features/Provenance.svg";
import graphic_sessions from "./Graphics/Features/Sessions.svg";
import graphic_workflows from "./Graphics/Features/Workflows.svg";

import graphic_build from "./Graphics/Features/Build.svg";
import graphic_collaborate from "./Graphics/Features/Collaborate.svg";
import graphic_teach from "./Graphics/Features/Teach.svg";

import logo_EPFL from "./Logos/EPFL.svg";
import logo_ETH from "./Logos/ETH.svg";
import logo_SDSC from "./Logos/SDSC.svg";


import { RenkuNavLink } from "../utils/components/RenkuNavLink";
import { ExternalIconLink, ExternalLink } from "../utils/components/ExternalLinks";
import { RenkuMarkdown } from "../utils/components/markdown/RenkuMarkdown";
import { Docs } from "../utils/constants/Docs";

const logo = "/static/public/img/logo.svg";

function HomeHeader(props) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const { urlMap } = props;
  const externalLinks = {
    medium: "https://medium.com/the-renku-blog",
    twitter: "https://twitter.com/RenkuIO",
    youtube: "https://www.youtube.com/channel/UCMF2tBtWU1sKWvtPl_HpI4A",
    github: "https://github.com/SwissDataScienceCenter/renku",
    docs: Docs.READ_THE_DOCS_ROOT
  };
  return <Fragment>
    <Row key="statuspage">
      <Col>
        <StatuspageBanner siteStatusUrl={urlMap.siteStatusUrl} model={props.model}
          location={{ pathname: Url.get(Url.pages.landing) }} />
        <NavBarWarnings model={props.model} uiShortSha={props.params["UI_SHORT_SHA"]} />
      </Col>
    </Row>
    <header className="px-0 pt-2 pb-4 d-flex rk-anon-home">
      <div className="align-self-center flex-grow-1">
        <img src={logo} alt="Renku" height="68" className="d-block my-1" />
      </div>
      <div
        className="px-2 mt-3 d-flex justify-content-center icons-menu
        align-items-center bg-primary gap-3">
        <div className="d-none d-md-inline-block">
          <ExternalIconLink
            className="text-white text-decoration-none"
            tooltip="Documentation"
            role="link"
            url={externalLinks.docs}
            icon={faBook} />
        </div>
        <div className="d-none d-md-inline-block">
          <ExternalIconLink
            className="text-white"
            tooltip="Twitter" role="link"
            url={externalLinks.twitter}
            icon={faTwitter} />
        </div>
        <div className="d-none d-md-inline-block">
          <ExternalIconLink
            className="text-white"
            tooltip="Medium" role="link"
            url={externalLinks.medium}
            icon={faMedium} />
        </div>
        <div className="d-none d-md-inline-block">
          <ExternalIconLink
            className="text-white"
            tooltip="Youtube"
            role="link"
            url={externalLinks.youtube}
            icon={faYoutube} />
        </div>
        <div className="d-none d-md-inline-block">
          <ExternalIconLink
            className="text-white"
            tooltip="Github" role="link"
            url={externalLinks.github}
            icon={faGithub} />
        </div>
        <Link className="btn btn-outline-secondary" role="button" id="login-button" to="/login">
          Login
        </Link>
        <Button onClick={toggleOpen} id="nav-hamburger" className="border-0">
          <FontAwesomeIcon className="m-0" icon={faBars} id="userIcon" />
        </Button>
      </div>
    </header>
    <div className="rk-navbar-home">
      <Collapse isOpen={isOpen}>
        <Navbar className="navbar rk-anon-home px-0">
          <Nav className="ms-auto flex-column rk-bg-shaded-dark text-end"
            style={{ "--rk-bg-opacity": 0.8 }}>
            <NavItem className="nav-item pe-1">
              <QuickNav client={props.client} model={props.model} user={props.user} />
            </NavItem>
            <NavItem>
              <RenkuNavLink to="/projects" title="Projects" id="link-projects" className="link-secondary" />
            </NavItem>
            <NavItem>
              <RenkuNavLink to="/datasets" title="Datasets" id="link-datasets" />
            </NavItem>
            <NavItem className="nav-item">
              <RenkuNavLink to="/sessions" title="Sessions" id="link-sessions" />
            </NavItem>
            <NavItem className="d-inline d-md-none">
              <ExternalLink
                className="nav-link"
                title="Docs"
                role="text"
                showLinkIcon={true}
                customIcon={faBook}
                url={externalLinks.docs} />
            </NavItem>
            <NavItem className="d-inline d-md-none">
              <ExternalLink
                className="nav-link"
                title="GitHub"
                role="text"
                showLinkIcon={true}
                customIcon={faGithub}
                url={externalLinks.github} />
            </NavItem>
            <NavItem className="d-inline d-md-none">
              <ExternalLink
                className="nav-link"
                title="Youtube"
                role="text"
                showLinkIcon={true}
                customIcon={faYoutube}
                url={externalLinks.youtube} />
            </NavItem>
            <NavItem className="d-inline d-md-none">
              <ExternalLink
                className="nav-link"
                title="Medium"
                role="text"
                showLinkIcon={true}
                customIcon={faMedium}
                url={externalLinks.medium} />
            </NavItem>
            <NavItem className="d-inline d-md-none">
              <ExternalLink
                className="nav-link"
                title="Twitter"
                role="text"
                showLinkIcon={true}
                customIcon={faTwitter}
                url={externalLinks.twitter} />
            </NavItem>
            <NavItem>
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
      <div className="rk-bg-shaded-dark">
        <Row>
          <Col className="rk-pt-l" >
            <h1 className="text-white">An open-source knowledge infrastructure for
          collaborative and reproducible data science</h1>
          </Col>
        </Row>
        <Row>
          <Col className="rk-pt-s">
            <h3 className="text-secondary">Connecting people, data, and insights</h3>
          </Col>
        </Row>
        <Row>
          <Col className="rk-pt-s rk-w-s">
            <HashLink className="btn btn-secondary-home" role="button"
              to="#rk-anon-home-section-features">
            Learn more
            </HashLink>
          </Col>
        </Row>
      </div>
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
      className="btn btn-secondary-home" role="button" id="link-learn"
      showLinkIcon={true}
      url={url} />;
  }
  return <Link className="btn btn-secondary-home" role="link" id="link-tutorial" to={url}>
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
            className="btn btn-secondary-home" role="button" id="link-learn"
            showLinkIcon={true}
            url={Docs.READ_THE_DOCS_ROOT} />
        </div>
      </div>
    </div>
  </div>;
}

function Section5(props) {
  return (props.projects == null) || (props.projects.length < 1) ?
    null :
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
        <div><img src={logo} alt="Renku" height="92" className="d-block my-1" /></div>
        <Row className="rk-pt-l bg-white" style={{ "--bs-bg-opacity": .9 }} >
          <Col xs={12} lg={4}>
            <h3>Developed at</h3>
            <a target="_blank" rel="noreferrer noopener" href="https://datascience.ch/">
              <img src={logo_SDSC} alt="SDSC" height="68" />
            </a>
          </Col>
          <Col xs={12} lg={4} className="rk-pt-up_to-lg-s">
            <div>
              <h4 className="text-rk-pink">With offices at</h4>
              <a target="_blank" rel="noreferrer noopener" href="https://www.epfl.ch/en/">
                <img className="mb-2" src={logo_EPFL} alt="EPFL" height="52" />
              </a>
              <div>
              INN Building, Station 14, 1015 Lausanne<br />
              +41 21 693 43 88
              </div>
            </div>
          </Col>
          <Col xs={12} lg={4} className="rk-pt-up_to-lg-s">
            <div>
              <h4 className="text-rk-pink">and</h4>
              <a target="_blank" rel="noreferrer noopener" href="https://ethz.ch/en.html">
                <img className="mb-2" src={logo_ETH} alt="ETH" height="52" />
              </a>
              <div>
              Turnerstrasse 1, 8092 Zürich<br />
              +41 44 632 80 74
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  </div>;
}

function SectionFeatures(props) {
  return <div className="rk-anon-home-section-bg-white" id="rk-anon-home-section-features">
    <div className="rk-anon-home-section-content mb-5">
      <Row className="rk-pt-m">
        <Col>
          <h3 className="text-rk-pink">Renku features: Empowering all stages of your work</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <div>Renku gives you tools and functionality for each stage of the data science lifecycle:
            from datasets to workflow execution.</div>
        </Col>
      </Row>
      <Row className="rk-pt-m g-4">
        <Col xs={12} lg={6}>
          <div className="d-flex h-100 justify-content-between rk-bg-features">
            <div className="p-4">
              <h4>Versioned Data</h4>
              <div>
              Renku Datasets equip your files with versioning and metadata.
              </div>
            </div>
            <div className="align-self-center p-3 m-4">
              <img src={graphic_data} alt="Versioned Data" height="68" />
            </div>
          </div>
        </Col>
        <Col xs={12} lg={6}>
          <div className="d-flex h-100 justify-content-between rk-bg-features">
            <div className="p-4">
              <h4>Interactive Computing</h4>
              <div>
              Access free computing resources directly in the browser with familiar front-ends like
              Jupyter, RStudio, and VSCode.
              </div>
            </div>
            <div className="align-self-center p-3 m-4" style={{ "--bs-bg-opacity": .4 }}>
              <img src={graphic_sessions} alt="Interactive Computing" height="68" />
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-1 g-4">
        <Col xs={12} lg={6}>
          <div className="d-flex h-100 justify-content-between rk-bg-features">
            <div className="p-4">
              <h4>Automatic Provenance</h4>
              <div>
              Track inputs and outputs easily without having to learn a new workflow language.
              </div>
            </div>
            <div className="align-self-center p-3 m-4">
              <img src={graphic_provenance} alt="Automatic Provenance" height="68" />
            </div>
          </div>
        </Col>
        <Col xs={12} lg={6}>
          <div className="d-flex h-100 justify-content-between rk-bg-features">
            <div className="p-4">
              <h4>Version Control by Default</h4>
              <div>
              Leverage Renku&apos;s GitLab instance to automatically version your project&apos;s files.
              </div>
            </div>
            <div className="align-self-center px-3 m-2">
              <img src={graphic_gitGitlab} alt="Git & Gitlab" height="60" />
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-1 g-4">
        <Col xs={12} lg={6}>
          <div className="d-flex h-100 justify-content-between rk-bg-features">
            <div className="p-4">
              <h4>Containers as Standard</h4>
              <div>
              Access a maintained stack of Docker images and project templates which ensure
              computational reproducibility.
              </div>
            </div>
            <div className="align-self-center p-3 m-4">
              <img src={graphic_containers} alt="Containers" height="68" />
            </div>
          </div>
        </Col>
        <Col xs={12} lg={6}>
          <div className="d-flex h-100 justify-content-between rk-bg-features">
            <div className="p-4">
              <h4>Reusable Workflows</h4>
              <div>
              Flexibly track your commands and reuse them as templates with different inputs or parameters.
              </div>
            </div>
            <div className="align-self-center p-3 m-4">
              <img src={graphic_workflows} alt="Containers" height="68" />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>;
}

function SectionUseCases(props) {
  return <div className="rk-anon-home-section-bg-gray" id="rk-anon-home-section-use-cases">
    <div className="rk-anon-home-section-content">
      <Row className="rk-pt-m">
        <Col>
          <h3 className="text-secondary">Renku Use Cases: Built to be versatile</h3>
        </Col>
      </Row>
      <Row className="rk-pt-m g-4">
        <Col lg={6}>
          <div className="d-flex flex-column h-100 justify-content-between rk-bg-use-case p-4">
            <div className="pb-2">
              <h4>Collaborative Scientific Research</h4>
            </div>
            <div className="flex-grow-1 d-md-flex align-items-center justify-content-between">
              <div>
              Ensure computational reproducibility between you and
              your colleagues throughout the entire scientific process.
              </div>
              <div className="p-2" style={{ "--bs-bg-opacity": .4 }}>
                <img src={graphic_collaborate} alt="Versioned Data" height="68" />
              </div>
            </div>
          </div>
        </Col>
        <Col lg={6}>
          <div className="d-flex flex-column h-100 justify-content-between rk-bg-use-case p-4">
            <div className="pb-2">
              <h4>Teach a Class or Workshop</h4>
            </div>
            <div className="flex-grow-1 d-md-flex align-items-center justify-content-between">
              <div>
                <div>Access project templates in Python, R, Julia (and more!)
                  out of the box, or create your own template to share with students.
                </div>
                <div className="mt-1">They can work together in the browser in or out of class.</div>
              </div>
              <div className="p-2" style={{ "--bs-bg-opacity": .4 }}>
                <img src={graphic_teach} alt="Interactive Computing" height="68" />
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-4 mb-5">
        <Col lg={{ size: 6, offset: 3 }}>
          <div className="d-flex flex-column h-100 justify-content-between rk-bg-use-case p-4">
            <div className="pb-2">
              <h4>Build, execute, and track workflows</h4>
            </div>
            <div className="d-md-flex align-items-center justify-content-between">
              <div>
              Automate processes and follow them in real time. Rest easy, as
              re-executions are reproducible given the same computational
              environment.
              </div>
              <div className="p-2" style={{ "--bs-bg-opacity": .4 }}>
                <img src={graphic_build} alt="Automatic Provenance" height="68" />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>;
}


function StandardHome(props) {
  return <Fragment>
    <Section1 {...props} />
    <SectionFeatures />
    <SectionUseCases />
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
