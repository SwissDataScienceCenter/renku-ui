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
 *  renku-ui
 *
 *  landing/NavBar.js
 *  NavBar for logged-in and logged-out users.
 */

import { Link, Route, Switch } from "react-router-dom";
import { Nav, Navbar } from "reactstrap";

import { ExternalDocsLink } from "../components/ExternalLinks";
import { RenkuNavLink } from "../components/RenkuNavLink";
import AnonymousNavBar from "../components/navbar/AnonymousNavBar";
import LoggedInNavBar from "../components/navbar/LoggedInNavBar";
import { RENKU_LOGO } from "../components/navbar/navbar.constans";
import { parseChartVersion } from "../help/HelpRelease";
import { Links } from "../utils/constants/Docs";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";
import { Url } from "../utils/helpers/url";

import "./NavBar.css";

function RenkuNavBar(props) {
  const { user } = props;
  const projectMetadata = useLegacySelector(
    (state) => state.stateModel.project?.metadata
  );
  const sessionShowUrl = Url.get(Url.pages.project.session.show, {
    namespace: projectMetadata["namespace"],
    path: projectMetadata["path"],
    server: ":server",
  });

  return (
    <Switch key="mainNav">
      <Route path={sessionShowUrl} />
      <Route>
        {user.logged ? (
          <LoggedInNavBar
            model={props.model}
            notifications={props.notifications}
            params={props.params}
          />
        ) : (
          <AnonymousNavBar
            model={props.model}
            notifications={props.notifications}
            params={props.params}
          />
        )}
      </Route>
    </Switch>
  );
}

function FooterNavbarAnonymousLinks() {
  return (
    <>
      <ExternalDocsLink
        url={`${Links.GITHUB}/blob/master/LICENSE`}
        title="Renku License"
        className="nav-link"
      />
    </>
  );
}

function FooterNavbarLoggedInLinks({ privacyLink }) {
  return (
    <>
      <RenkuNavLink to="/help" title="Help" />
      {privacyLink}
      <ExternalDocsLink
        url={Links.DISCOURSE}
        title="Forum"
        className="nav-link"
      />
      <ExternalDocsLink
        url={Links.GITTER}
        title="Gitter"
        className="nav-link"
      />
      <ExternalDocsLink
        url={`${Links.HOMEPAGE}/who-we-are`}
        title="About"
        className="nav-link"
      />
    </>
  );
}

function FooterNavbar({ location, params }) {
  const projectMetadata = useLegacySelector(
    (state) => state.stateModel.project?.metadata
  );
  const user = useLegacySelector((state) => state.stateModel.user);
  const sessionShowUrl = Url.get(Url.pages.project.session.show, {
    namespace: projectMetadata["namespace"],
    path: projectMetadata["path"],
    server: ":server",
  });

  const privacyLink =
    params && params["PRIVACY_STATEMENT"] ? (
      <RenkuNavLink to="/privacy" title="Privacy" />
    ) : null;
  const chartVersion = params && params["RENKU_CHART_VERSION"];
  const parsedChartVersion = chartVersion && parseChartVersion(chartVersion);
  const taggedVersion = parsedChartVersion?.taggedVersion;
  const isDevVersion = parsedChartVersion?.devHash != null;
  const displayVersion =
    taggedVersion == null
      ? "unknown"
      : isDevVersion
      ? `${taggedVersion} (dev)`
      : taggedVersion;

  const footer = (
    <footer className="footer">
      <Navbar
        className="container-fluid flex-nowrap justify-content-between
        renku-container navbar bg-primary navbar-dark"
      >
        <div className="w-100">
          <span className="text-white-50">
            &copy; SDSC {new Date().getFullYear()}
          </span>
        </div>
        <div className="w-100">
          <Nav
            className="justify-content-end justify-content-lg-center"
            data-cy="version-info"
          >
            <Link className="nav-link" to={Url.pages.help.release}>
              <img src={RENKU_LOGO} alt="Renku" className="pb-2" height="44" />
              <span className="ps-2">{displayVersion}</span>
            </Link>
          </Nav>
        </div>
        <div className="d-none d-lg-inline w-100">
          <Nav className="justify-content-end">
            {!user.logged &&
            location.pathname === Url.get(Url.pages.landing) ? (
              <FooterNavbarAnonymousLinks />
            ) : (
              <FooterNavbarLoggedInLinks privacyLink={privacyLink} />
            )}
          </Nav>
        </div>
      </Navbar>
    </footer>
  );

  return (
    <Switch key="footerNav">
      <Route path={sessionShowUrl} render={() => null} />
      <Route component={() => footer} />
    </Switch>
  );
}

export { FooterNavbar, RenkuNavBar };
