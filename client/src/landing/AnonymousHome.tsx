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

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useContext, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Col, Row } from "reactstrap";

import LazyRenkuMarkdown from "../components/markdown/LazyRenkuMarkdown";
import { stateToSearchString } from "../features/kgSearch";
import { StatuspageBanner } from "../statuspage";
import { Url } from "../utils/helpers/url";

import { NavBarWarnings } from "./NavBarWarnings";

import VisualHead from "./Graphics/Visual_Head.svg";

import DividerLandingPage from "./Dividier/Divider";
import GetStarted from "./GetSarted/GetStarted";
import HeroLanding from "./HeroLanding/HeroLanding";
import SectionShowcase, { validatedShowcaseConfig } from "./SectionShowcase";
import Teaching from "./Teaching/Teaching";
import WhatIsRenku from "./WhatIsRenku/WhatIsRenku";
import WhoWeAre from "./WhoWeAre/WhoWeAre";
import type { AnonymousHomeConfig } from "./anonymousHome.types";
import { BottomNav, TopNav } from "./anonymousHomeNav";
import AppContext from "../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../utils/context/appParams.constants";

export default function AnonymousHome() {
  const { client, model, params } = useContext(AppContext);

  return (
    <AnonymousHomeInner
      client={client}
      homeCustomized={params?.["HOMEPAGE"] ?? DEFAULT_APP_PARAMS.HOMEPAGE}
      model={model}
      params={{
        ...params,
        UI_SHORT_SHA: params?.UI_SHORT_SHA ?? DEFAULT_APP_PARAMS.UI_SHORT_SHA,
      }}
    />
  );
}

export function HomeHeader(props: AnonymousHomeConfig) {
  const { urlMap } = props;
  return (
    <Fragment>
      <Row key="statuspage">
        <Col>
          <StatuspageBanner
            siteStatusUrl={urlMap.siteStatusUrl}
            model={props.model}
            location={{ pathname: Url.get(Url.pages.landing) }}
          />
          <NavBarWarnings
            model={props.model}
            uiShortSha={props.params["UI_SHORT_SHA"]}
          />
        </Col>
      </Row>
      <TopNav />
    </Fragment>
  );
}

type SearchInputFormFields = {
  phrase: string;
};

export function SearchInput() {
  const { handleSubmit, register } = useForm<SearchInputFormFields>({
    defaultValues: { phrase: "" },
  });
  const history = useHistory();
  const onSubmit = (inputs: SearchInputFormFields) => {
    const searchState = { phrase: inputs.phrase };
    const searchString = stateToSearchString(searchState);
    const searchUrl = `${Url.get(Url.pages.search)}/?${searchString}`;
    history.push(searchUrl);
  };
  return (
    <div className="d-flex flex-nowrap w-100 mx-0">
      <div className="search-box flex-nowrap justify-content-center m-auto">
        <form
          className="quick-nav input-group flex-nowrap input-group-sm justify-content-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            autoComplete="off"
            className="form-control form-control-sm rk-landing-search"
            placeholder="Explore public projects and datasets"
            aria-label="Search input"
            {...register("phrase")}
          />
          <span
            className="quick-nav-icon d-flex justify-content-center align-items-center mx-4 cursor-pointer"
            onClick={handleSubmit(onSubmit)}
          >
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </form>
      </div>
    </div>
  );
}
function StandardHome(props: AnonymousHomeConfig) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToGetStarted = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <HeroLanding {...props} scrollToGetStarted={scrollToGetStarted} />
      <GetStarted {...props} sectionRef={sectionRef} />
      <DividerLandingPage />
      <WhatIsRenku
        projectPath={props.homeCustomized.projectPath}
        datasetSlug={props.homeCustomized.datasetSlug}
      />
      <DividerLandingPage />
      <SectionShowcase
        {...validatedShowcaseConfig(props.homeCustomized.showcase)}
      />
      {props.homeCustomized.showcase.enabled ? (
        <DividerLandingPage />
      ) : undefined}
      <Teaching />
      <DividerLandingPage />
      <WhoWeAre />
      <BottomNav {...props} />
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
      <HomeHeader {...props} />
      <div className="rk-anon-home-section-content">
        <Row>
          <Col className="rk-pt-l rk-w-s">
            <LazyRenkuMarkdown key="home" markdownText={content} />
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
      {props.homeCustomized.custom.enabled
        ? CustomizedAnonymousHome(p)
        : StandardHome(p)}
    </div>
  );
}
