/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import type { CSSProperties } from "react";
import React from "react";
import { List } from "react-bootstrap-icons";
import { Link } from "react-router";
import { Button, Col, Collapse, Nav, Navbar, NavItem, Row } from "reactstrap";

import { useLoginUrl } from "../../../authentication/useLoginUrl.hook";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Links } from "../../../utils/constants/Docs.js";
import { Url } from "../../../utils/helpers/url";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants.js";

const logo = "/static/public/img/logo.svg";

type BottomNavExternalLinkProps = {
  title: string;
  url: string;
};
function BottomNavExternalLink({ title, url }: BottomNavExternalLinkProps) {
  return (
    <ExternalLink
      className="text-white text-decoration-none nav-link mb-2"
      role="link"
      title={title}
      url={url}
    />
  );
}

type BottomNavLinkProps = {
  title: string;
  to: string;
};
function BottomNavLink({ title, to }: BottomNavLinkProps) {
  return (
    <Link className="nav-link mb-2" to={to}>
      {title}
    </Link>
  );
}

function BottomNavSectionHeader({ title }: { title: string }) {
  return (
    <h4 className="mb-4">
      <b>{title}</b>
    </h4>
  );
}

type BottomNavSectionProps = {
  sectionTitle: string;
  children: React.ReactNode[];
};
function BottomNavSection(props: BottomNavSectionProps) {
  return (
    <>
      <BottomNavSectionHeader title={props.sectionTitle} />
      <ul className="rk-anon-home-bottom-nav-section list-unstyled pl-0">
        {props.children.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </>
  );
}

function BottomNav() {
  return (
    <div id="rk-anon-home-bottom-nav" className={cx("bg-navy")}>
      <div className={cx("container", "py-5", "text-white")}>
        <Row>
          <Col md={3}>
            <BottomNavSection sectionTitle="Learn">
              <BottomNavExternalLink
                title="Documentation"
                url={Links.RENKU_2_DOCUMENTATION}
              />
              <BottomNavExternalLink
                title="Get Started"
                url={Links.RENKU_2_QUICK_START_TUTORIAL}
              />
              <BottomNavLink title="Help" to={Url.get(Url.pages.help)} />
            </BottomNavSection>
          </Col>
          <Col md={3}>
            <BottomNavSection sectionTitle="Community">
              <BottomNavExternalLink title="Forum" url={Links.DISCOURSE} />
              <BottomNavExternalLink title="Chat (Gitter)" url={Links.GITTER} />
              <BottomNavExternalLink title="GitHub" url={Links.GITHUB} />
            </BottomNavSection>
          </Col>
          <Col md={3}>
            <BottomNavSection sectionTitle="Follow us">
              <BottomNavExternalLink
                title="Renku blog"
                url={Links.RENKU_BLOG}
              />
              <BottomNavExternalLink title="YouTube" url={Links.YOUTUBE} />
              <BottomNavExternalLink title="Mastodon" url={Links.MASTODON} />
            </BottomNavSection>
          </Col>
          <Col md={3}>
            <BottomNavSection sectionTitle="About">
              <BottomNavLink
                title="Renku version"
                to={Url.get(Url.pages.help.release)}
              />
              <BottomNavExternalLink
                title="Why Renku?"
                url={Links.RENKU_2_WHY_RENKU}
              />
              <BottomNavExternalLink
                title="Who we are?"
                url={`${Links.HOMEPAGE}/who-we-are/`}
              />
            </BottomNavSection>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function TopNavExternalLink({ title, url }: BottomNavExternalLinkProps) {
  return (
    <ExternalLink
      className="d-inline text-white nav-link"
      role="link"
      title={title}
      url={url}
    />
  );
}

function TopNavLink({ title, to }: BottomNavLinkProps) {
  return (
    <Link
      className={cx("text-decoration-none", "text-white", "nav-link")}
      to={to}
    >
      {title}
    </Link>
  );
}

function TopNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  const loginUrl = useLoginUrl();

  return (
    <>
      <header className={cx("pt-2", "pb-4", "d-flex", "container")}>
        <div className={cx("align-self-center", "flex-grow-1")}>
          <img src={logo} alt="Renku" height="68" className="d-block my-1" />
        </div>
        <div
          className={cx(
            "px-2",
            "mt-3",
            "d-flex",
            "justify-content-center",
            "icons-menu",
            "align-items-center",
            "gap-3"
          )}
        >
          <div className="d-none d-md-inline-block">
            <TopNavLink title="Help" to={ABSOLUTE_ROUTES.v2.help.root} />
          </div>
          <a
            className={cx("btn", "btn-outline-light", "text-decoration-none")}
            id="login-button"
            href={loginUrl.href}
          >
            Login
          </a>
          <Button
            onClick={toggleOpen}
            id="nav-hamburger"
            className={cx("border-0", "bg-transparent", "shadow-none")}
            title="Navigation Toggle"
          >
            <List className="m-0 bi" />
          </Button>
        </div>
      </header>
      <div className="rk-navbar-home">
        <Collapse isOpen={isOpen}>
          <Navbar className={cx("navbar", "container", "px-0")}>
            <Nav
              className="ms-auto flex-column rk-bg-shaded-dark text-end"
              style={{ "--rk-bg-opacity": 0.9, zIndex: 100 } as CSSProperties}
            >
              <NavItem className="nav-item mb-2">
                <TopNavExternalLink
                  title="Documentation"
                  url={Links.RENKU_2_DOCUMENTATION}
                />
              </NavItem>
              <NavItem className="nav-item mb-2">
                <TopNavExternalLink
                  title="Community Portal"
                  url={Links.RENKU_2_COMMUNITY_PORTAL}
                />
              </NavItem>
              <NavItem>
                <hr className="dropdown-divider my-2 mx-3" />
              </NavItem>
              <NavItem className="nav-item mb-2">
                <TopNavExternalLink title="Forum" url={Links.DISCOURSE} />
              </NavItem>
              <NavItem className="nav-item mb-2">
                <TopNavExternalLink title="Gitter" url={Links.GITTER} />
              </NavItem>
              <NavItem className="nav-item mb-2">
                <TopNavExternalLink title="GitHub" url={Links.GITHUB} />
              </NavItem>
              <NavItem
                className={cx("d-block", "d-md-none", "nav-item", "mb-2")}
              >
                <TopNavLink title="Help" to={Url.get(Url.pages.help)} />
              </NavItem>
            </Nav>
          </Navbar>
        </Collapse>
      </div>
    </>
  );
}

export { BottomNav, TopNav };
