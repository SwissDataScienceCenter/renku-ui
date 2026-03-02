/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useContext } from "react";
import { Link, useLocation, useMatch } from "react-router";

import { ExternalLink } from "~/components/LegacyExternalLinks";
import { RENKU_LOGO } from "~/components/navbar/navbar.constants";
import RenkuNavLinkV2 from "~/components/RenkuNavLinkV2";
import { parseChartVersion } from "~/features/help/release.utils";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { Links } from "~/utils/constants/Docs";
import AppContext from "~/utils/context/appContext";
import { isRenkuLegacy } from "~/utils/helpers/HelperFunctionsV2";

export default function RenkuFooterNavBar() {
  const matchesShowSessionPage = useMatch(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.show
  );

  if (matchesShowSessionPage) {
    return null;
  }

  return <RenkuFooterNavBarInner />;
}

function RenkuFooterNavBarInner() {
  const { params } = useContext(AppContext);

  const chartVersion = params && params["RENKU_CHART_VERSION"];
  const parsedChartVersion = chartVersion
    ? parseChartVersion(chartVersion)
    : undefined;
  const taggedVersion = parsedChartVersion?.taggedVersion;
  const isDevVersion = parsedChartVersion?.devHash != null;
  const displayVersion =
    taggedVersion == null
      ? "unknown"
      : isDevVersion
      ? `${taggedVersion} (dev)`
      : taggedVersion;
  const releaseLocation = ABSOLUTE_ROUTES.v2.help.release;

  return (
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
            <FooterNavbarLoggedInLinks />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNavbarLoggedInLinks() {
  const location = useLocation();
  const forceV2 = true;
  const helpLocation = isRenkuLegacy(location.pathname, forceV2)
    ? ABSOLUTE_ROUTES.v1.help.root
    : ABSOLUTE_ROUTES.v2.help.root;
  return (
    <>
      <RenkuNavLinkV2 to={helpLocation}>Help</RenkuNavLinkV2>
      <ExternalLink
        className="nav-link"
        role="link"
        title="Forum"
        url={Links.DISCOURSE}
      />
      <ExternalLink
        className="nav-link"
        role="link"
        title="Gitter"
        url={Links.GITTER}
      />
      <ExternalLink
        className="nav-link"
        role="link"
        title="About"
        url={`${Links.HOMEPAGE}/who-we-are`}
      />
    </>
  );
}
