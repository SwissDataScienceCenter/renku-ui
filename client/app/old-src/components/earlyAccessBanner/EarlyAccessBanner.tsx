/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { Link } from "react-router";
import { useLocation } from "react-router";
import { Alert, Container } from "reactstrap";
import { Links } from "../../utils/constants/Docs.js";
import { Url } from "../../utils/helpers/url";
import style from "./EarlyAccessBanner.module.scss";

const BANNER_DARK_IMG = "/static/public/img/earlyAccessDark.png";
const BANNER_LIGHT_IMG = "/static/public/img/earlyAccessLight.svg";
const LOGO_V2 = "/static/public/img/renku2.0Logo.svg";
const LOGO_V2_DARK = "/static/public/img/renku2.0LogoDark.svg";

interface EarlyAccessBannerProps {
  theme: "dark" | "light";
}

export function DashboardBanner({ user }: { user: { logged: boolean } }) {
  const location = useLocation();

  if (location.pathname !== Url.get(Url.pages.landing)) return null;

  if (user.logged) return <EarlyAccessBanner theme="light" />;

  return <EarlyAccessBanner theme="dark" />;
}

export function EarlyAccessBanner({ theme }: EarlyAccessBannerProps) {
  const themeAssets = {
    light: {
      btnStyles: ["bg-rk-blue", "text-rk-white"],
      bannerStyles: ["bg-white", "text-rk-blue"],
      dotsImgUrl: BANNER_LIGHT_IMG,
      logoImgUrl: LOGO_V2_DARK,
      linkStyle: "text-rk-blue",
    },
    dark: {
      btnStyles: ["bg-white", "text-rk-blue"],
      bannerStyles: ["bg-rk-blue", "text-rk-white"],
      dotsImgUrl: BANNER_DARK_IMG,
      logoImgUrl: LOGO_V2,
      linkStyle: "text-white",
    },
  };

  const callToActionBtn = (
    <Link
      to="/v2"
      className={cx(
        themeAssets[theme].btnStyles,
        style.EarlyAccessBannerBtn,
        "btn"
      )}
      rel="noreferrer noopener"
    >
      Try it out
    </Link>
  );

  return (
    <Alert
      className={cx(
        "border-start-0",
        "border-end-0",
        "border-top-0",
        "border-button-1",
        "border-white",
        "rounded-0",
        "mb-0",
        "py-3",
        themeAssets[theme].bannerStyles
      )}
      fade={false}
    >
      <Container
        className={cx(
          "w-100",
          "d-flex",
          "justify-content-between",
          "align-items-center"
        )}
      >
        <div className={cx("d-none", "d-sm-block", "d-lg-none")}>
          <img
            src={themeAssets[theme].dotsImgUrl}
            className={cx("img-fluid", "object-fit-cover")}
            style={{ width: "83px", height: "50px" }}
            alt="Small image"
          />
        </div>
        <div className={cx("d-none", "d-lg-block")}>
          <img
            src={themeAssets[theme].dotsImgUrl}
            className="img-fluid"
            alt="Full image"
            style={{ height: "50px" }}
          />
        </div>
        <div
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "flex-column",
            "flex-md-row"
          )}
        >
          <img
            src={themeAssets[theme].logoImgUrl}
            alt="Renku 2.0"
            height="25"
          />
          <h5 className={cx("mt-1", "mb-0")}>EARLY ACCESS!</h5>
        </div>
        <div
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "flex-column",
            "flex-md-row"
          )}
        >
          {callToActionBtn}
          <Link
            to={Links.RENKU_2_LEARN_MORE}
            className={themeAssets[theme].linkStyle}
            rel="noreferrer noopener"
            target="_blank"
          >
            Learn more
          </Link>
        </div>
      </Container>
    </Alert>
  );
}
