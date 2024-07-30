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

import cx from "classnames";
import { Link, Route, Switch, useLocation } from "react-router-dom";

import { ExternalDocsLink } from "../components/ExternalLinks";
import { RenkuNavLink } from "../components/RenkuNavLink";
import AnonymousNavBar from "../components/navbar/AnonymousNavBar";
import LoggedInNavBar from "../components/navbar/LoggedInNavBar";
import { RENKU_LOGO } from "../components/navbar/navbar.constans";
import { parseChartVersion } from "../help/release.utils";
import { Links } from "../utils/constants/Docs";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";
import { Url } from "../utils/helpers/url";
import { ABSOLUTE_ROUTES } from "../routing/routes.constants";

import "./NavBar.css";

function RenkuNavBar(props) {
  const { user } = props;
  const location = useLocation();

  if (!user.logged && location.pathname === Url.get(Url.pages.landing)) {
    return null;
  }

  return <RenkuNavBarInner {...props} />;
}

function RenkuNavBarInner(props) {
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
      <Route path="/v2/" />
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
  const helpLocation = location.pathname.startsWith("/v2")
    ? ABSOLUTE_ROUTES.v2.help.root
    : Url.pages.help;
  return (
    <>
      <RenkuNavLink to={helpLocation} title="Help" />
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

function FooterNavbar(props) {
  const location = useLocation();

  return <FooterNavbarInner {...props} location={location} />;
}

function FooterNavbarInner({ location, params }) {
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

  const releaseLocation = location.pathname.startsWith("/v2")
    ? ABSOLUTE_ROUTES.v2.help.release
    : Url.pages.help.release;

  const footer = (
    <footer>
      <div
        className={cx(
          "flex-nowrap",
          "navbar",
          "px-2",
          "px-sm-3",
          "py-2",
          location.pathname.startsWith("/v2") ? "bg-navy" : "bg-primary"
        )}
        data-bs-theme="dark"
      >
        <div className="navbar-nav">
          <span className="text-white">
            &copy; SDSC {new Date().getFullYear()}
          </span>
        </div>
        <div className="navbar-nav" data-cy="version-info">
          <Link
            className={cx("d-flex", "ms-auto", "ms-lg-0", "nav-link", "p-0")}
            to={releaseLocation}
          >
            <img src={RENKU_LOGO} alt="Renku" height={44} />
            <span className={cx("my-auto", "ps-3")}>{displayVersion}</span>
          </Link>
        </div>
        <div className={cx("d-lg-flex", "d-none", "navbar-nav")}>
          <div className={cx("d-flex", "flex-row", "gap-3", "ms-auto")}>
            {!user.logged &&
            location.pathname === Url.get(Url.pages.landing) ? (
              <FooterNavbarAnonymousLinks />
            ) : (
              <FooterNavbarLoggedInLinks privacyLink={privacyLink} />
            )}
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <Switch key="footerNav">
      <Route path={sessionShowUrl} />
      <Route path="/v2/projects/:namespace/:slug/sessions/show/:server" />
      <Route>{footer}</Route>
    </Switch>
  );
}

export { FooterNavbar, RenkuNavBar };
