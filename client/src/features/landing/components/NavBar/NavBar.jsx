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

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ExternalDocsLink } from "../../../../components/LegacyExternalLinks";
import { RENKU_LOGO } from "../../../../components/navbar/navbar.constants";
import RenkuNavLinkV2 from "../../../../components/RenkuNavLinkV2";
import { parseChartVersion } from "../../../../help/release.utils";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { Links } from "../../../../utils/constants/Docs";
import AppContext from "../../../../utils/context/appContext";
import { isRenkuLegacy } from "../../../../utils/helpers/HelperFunctionsV2";
import NavbarV2 from "../../../rootV2/NavbarV2";

import "./NavBar.css";

function RenkuNavBar() {
  const { pathname } = useLocation();
  const { data: user } = useGetUserQueryState();

  if (!user?.isLoggedIn && pathname === ABSOLUTE_ROUTES.root) {
    return null;
  }

  return <RenkuNavBarInner />;
}

function RenkuNavBarInner() {
  return (
    <Routes>
      <Route path="*" element={<NavbarV2 />} />
    </Routes>
  );
}

function FooterNavbarLoggedInLinks({ privacyLink }) {
  const location = useLocation();
  const forceV2 = true;
  const helpLocation = isRenkuLegacy(location.pathname, forceV2)
    ? ABSOLUTE_ROUTES.v1.help.root
    : ABSOLUTE_ROUTES.v2.help.root;
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
  const releaseLocation = ABSOLUTE_ROUTES.v2.help.release;

  const footer = (
    <footer className={cx("text-body", "bg-body")} data-bs-theme="navy">
      <div className={cx("flex-nowrap", "navbar", "px-2", "px-sm-3", "py-2")}>
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
            <FooterNavbarLoggedInLinks
              location={location}
              privacyLink={privacyLink}
            />
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <Routes>
      <Route
        path={ABSOLUTE_ROUTES.v2.projects.show.sessions.show}
        element={null}
      />
      <Route path="*" element={footer} />
    </Routes>
  );
}

export { FooterNavbar, RenkuNavBar };
