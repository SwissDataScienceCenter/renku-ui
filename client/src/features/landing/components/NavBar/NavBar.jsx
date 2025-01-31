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
import { useContext } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import { ExternalDocsLink } from "../../../../components/ExternalLinks";
import AnonymousNavBar from "../../../../components/navbar/AnonymousNavBar";
import LoggedInNavBar from "../../../../components/navbar/LoggedInNavBar";
import { RENKU_LOGO } from "../../../../components/navbar/navbar.constans";
import RenkuNavLinkV2 from "../../../../components/RenkuNavLinkV2";
import { parseChartVersion } from "../../../../help/release.utils";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import AppContext from "../../../../utils/context/appContext";
import { Links } from "../../../../utils/constants/Docs";
import useLegacySelector from "../../../rootV2/NavbarV2";
import { isRenkuLegacy } from "../../../../utils/helpers/HelperFunctionsV2";
import { Url } from "../../../../utils/helpers/url";

import NavbarV2 from "../../../rootV2/NavbarV2";

import "./NavBar.css";

function RenkuNavBar({ user }) {
  const location = useLocation();

  if (!user.logged && location.pathname === Url.get(Url.pages.landing)) {
    return null;
  }

  return <RenkuNavBarInner user={user} />;
}

function RenkuNavBarInner({ user }) {
  const projectMetadata = useLegacySelector(
    (state) => state.stateModel.project?.metadata
  );
  const sessionShowUrl = Url.get(Url.pages.project.session.show, {
    namespace: projectMetadata["namespace"],
    path: projectMetadata["path"],
    server: ":server",
  });

  return (
    <Routes key="mainNav">
      <Route path={sessionShowUrl} element={null} />
      <Route path={`${ABSOLUTE_ROUTES.v2.root}/*`} element={null} />
      <Route path="/v1/" element={null} />
      <Route path="/projects/">
        {!user.logged ? <AnonymousNavBar /> : <LoggedInNavBar />}
      </Route>
      <Route path="/datasets/">
        {!user.logged ? <AnonymousNavBar /> : <LoggedInNavBar />}
      </Route>
      <Route path="*" element={<NavbarV2 />} />
    </Routes>
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
  const location = useLocation();
  const helpLocation =
    location && location.pathname.startsWith("/v2")
      ? ABSOLUTE_ROUTES.v2.help.root
      : Url.pages.help.base;
  return (
    <>
      <RenkuNavLinkV2 to={helpLocation}>Help</RenkuNavLinkV2>
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

function FooterNavbar() {
  return <FooterNavbarInner />;
}

function FooterNavbarInner() {
  const location = useLocation();
  const projectMetadata = useLegacySelector(
    (state) => state.stateModel.project?.metadata
  );
  const user = useLegacySelector((state) => state.stateModel.user);
  const sessionShowUrl = Url.get(Url.pages.project.session.show, {
    namespace: projectMetadata["namespace"],
    path: projectMetadata["path"],
    server: ":server",
  });
  const { params } = useContext(AppContext);

  const privacyLink =
    params && params["PRIVACY_STATEMENT"] ? (
      <RenkuNavLinkV2 to="/privacy">Privacy</RenkuNavLinkV2>
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

  const isRenkuV1 = isRenkuLegacy(location.pathname);
  const releaseLocation = isRenkuV1
    ? ABSOLUTE_ROUTES.v1.help.release
    : ABSOLUTE_ROUTES.v2.help.release;

  const footer = (
    <footer className={cx("text-body", "bg-body")} data-bs-theme="navy">
      <div
        className={cx(
          "flex-nowrap",
          "navbar",
          "px-2",
          "px-sm-3",
          "py-2",
          isRenkuV1 && "bg-primary"
        )}
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
              <FooterNavbarLoggedInLinks
                location={location}
                privacyLink={privacyLink}
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <Routes key="footerNav">
      <Route path={sessionShowUrl} element={null} />
      <Route
        path={ABSOLUTE_ROUTES.v2.projects.show.sessions.show}
        element={null}
      />
      <Route path="*" element={footer} />
    </Routes>
  );
}

export { FooterNavbar, RenkuNavBar };
