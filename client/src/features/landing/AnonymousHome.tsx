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

import { useContext } from "react";
import { Col, Row } from "reactstrap";

import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import { Url } from "../../utils/helpers/url";
import type { AnonymousHomeConfig } from "./anonymousHome.types";
import VisualHead from "./assets/Visual_Head.svg";
import { BottomNav, TopNav } from "./components/anonymousHomeNav";
import { RenkuBenefits } from "./components/Benefits/Benefits";
import DividerLandingPage from "./components/Dividier/Divider";
import { GetStarted } from "./components/GetStarted/GetStarted";
import HeroLanding from "./components/HeroLanding/HeroLanding";
import { Introduction } from "./components/Introduction/Introduction";
import { RenkuUsers } from "./components/RenkuUsers/RenkuUsers";
import { ResourcesAndSupport } from "./components/ResourcesSupport/ResourcesAndSupport";
import WhatIsRenku from "./components/WhatIsRenku/WhatIsRenku";
import WhoWeAre from "./components/WhoWeAre/WhoWeAre";

export default function AnonymousHome() {
  const { params } = useContext(AppContext);

  return (
    <AnonymousHomeInner
      homeCustomized={params?.["HOMEPAGE"] ?? DEFAULT_APP_PARAMS.HOMEPAGE}
      params={{
        ...params,
        UI_SHORT_SHA: params?.UI_SHORT_SHA ?? DEFAULT_APP_PARAMS.UI_SHORT_SHA,
      }}
    />
  );
}

export function HomeHeader() {
  return <TopNav />;
}

function StandardHome() {
  return (
    <>
      <HeroLanding />
      <Introduction />
      <WhatIsRenku />
      <GetStarted />
      <RenkuUsers />
      <DividerLandingPage />
      <RenkuBenefits />
      <ResourcesAndSupport />
      <WhoWeAre />
      <BottomNav />
    </>
  );
}

function CustomizedAnonymousHome(props: AnonymousHomeConfig) {
  let content = props.homeCustomized.custom.main.contentMd;
  if (content.length < 1)
    content = "[No content provided: please configure text to display here.]";
  let backgroundUrl = props.homeCustomized.custom.main.backgroundImage.url;
  let backgroundSize = "cover";
  if (backgroundUrl.length < 1) {
    backgroundUrl = VisualHead;
    backgroundSize = "cover";
  }
  return (
    <div
      id="rk-anon-home-section1"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize,
        backgroundRepeat: "no-repeat",
      }}
    >
      <HomeHeader />
      <div className="rk-anon-home-section-content">
        <Row>
          <Col className="rk-pt-l rk-w-s">
            <LazyMarkdown>{content}</LazyMarkdown>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function AnonymousHomeInner(props: Omit<AnonymousHomeConfig, "urlMap">) {
  const urlMap = {
    siteStatusUrl: Url.get(Url.pages.help.status),
  };
  const p = { ...props, urlMap };

  return (
    <div id="rk-anon-home-frame">
      {props.homeCustomized.custom.enabled ? (
        <CustomizedAnonymousHome {...p} />
      ) : (
        <StandardHome />
      )}
    </div>
  );
}
