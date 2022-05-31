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
 *  renku-ui
 *
 *  StyleGuide
 *  The StyleGuide explains the components of the RenkuLab UI.
 */

import React, { Fragment } from "react";

import { Col, Nav, NavItem, Row, Table } from "reactstrap";
import { Route, Switch } from "react-router-dom";

import ButtonsGuide from "./ButtonsGuide";
import ColorsGuide from "./ColorsGuide";
import FormsGuide from "./FormsGuide";
import ListsGuide from "./ListsGuide";
import { TimeCaption } from "../utils/components/TimeCaption";
import { RenkuNavLink } from "../utils/components/RenkuNavLink";


function Overview(props) {
  return <Fragment>
    <h2>Overview</h2>
    <p>The style guide explains the different elements of the RenkuLab UI, how they should
      look and when to use what element.
    </p>
  </Fragment>;
}

function FontsGuide(props) {
  return <Fragment>
    <h2>Fonts / Typography</h2>
    <p><b>Font</b> <a href="https://www.ffonts.net">Calcutta</a></p>
    <h2>Styles</h2>
    <Table>
      <thead>
        <tr>
          <th scope="col">Use</th>
          <th scope="col">Tag</th>
          <th scope="col">Details</th>
          <th scope="col">Appearance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Page titles</th>
          <td>h2</td>
          <td>weight: 500; size: 32px;</td>
          <td><h2>Lorem ipsum</h2></td>
        </tr>
        <tr>
          <th scope="row">Section titles</th>
          <td>h3</td>
          <td>weight: 500; size: 28px;</td>
          <td><h3>Lorem ipsum</h3></td>
        </tr>
        <tr>
          <th scope="row">Normal text</th>
          <td>p/div</td>
          <td>weight: 500; size: 16px;</td>
          <td>Lorem ipsum dolor sit amet</td>
        </tr>
        <tr>
          <th scope="row">Time display</th>
          <td>TimeCaption</td>
          <td>text-muted</td>
          <td><TimeCaption time={new Date()}/></td>
        </tr>
      </tbody>
    </Table>
  </Fragment>;
}

function NavGuide(props) {
  const { navUrl } = props.urlMap;
  return <Fragment>
    <h2>Nav</h2>
    <h3>First-level Nav</h3>
    <p>The primary navigation on the page should be a first-level nav.</p>
    <div className="pb-3 rk-search-bar">
      <Nav pills className="nav-pills-underline">
        <NavItem>
          <RenkuNavLink to={navUrl} title="Tab 1" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${navUrl}/tab2`} title="Tab 2" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${navUrl}/tab3`} title="Tab 3" />
        </NavItem>
      </Nav>
    </div>
    <br />
    <h4>Second-level Nav</h4>
    <p>If a secondary navigation is necessary, use a second-level nav.</p>
    <Nav className="flex-column nav-light nav-pills-underline">
      <NavItem>
        <RenkuNavLink to={navUrl} title="Tab 1" />
      </NavItem>
      <NavItem>
        <RenkuNavLink to={`${navUrl}/tab2`} title="Tab 2" />
      </NavItem>
      <NavItem>
        <RenkuNavLink to={`${navUrl}/tab3`} title="Tab 3" />
      </NavItem>
    </Nav>
  </Fragment>;
}

function StyleGuideNav(props) {
  const { baseUrl, buttonsUrl, colorsUrl, fontsUrl, formsUrl,
    listsUrl, navUrl } = props.urlMap;
  return <div className="pb-3 rk-search-bar">
    <Col className="d-flex pb-2 mb-1" md={12} lg={12}>
      <Nav pills className="nav-pills-underline">
        <NavItem>
          <RenkuNavLink to={baseUrl} title="Overview" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={fontsUrl} title="Fonts" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={colorsUrl} title="Colors" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={buttonsUrl} title="Buttons" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={navUrl} title="Nav" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={formsUrl} title="Forms" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={listsUrl} title="Lists" />
        </NavItem>
      </Nav>
    </Col>
  </div>;
}

function StyleGuideHeader(props) {
  return <Fragment>
    <Row className="pt-2 pb-3">
      <Col className="d-flex mb-2 justify-content-between">
        <div>
          <h2>
            Style Guide
          </h2>
          <div className="text-rk-text">
            An guide to the RenkuLab UI elements.
          </div>
        </div>
        <div className="d-flex flex-column justify-content-between">
          <div>
            Lorem ipsum dolor sit amet
          </div>
          <div className="mt-2">
            <StyleGuideNav urlMap={props.urlMap} />
          </div>
        </div>
      </Col>
    </Row>
  </Fragment>;
}

function constructUrlMap(baseUrl) {
  return {
    baseUrl,
    buttonsUrl: `${baseUrl}/buttons`,
    colorsUrl: `${baseUrl}/colors`,
    fontsUrl: `${baseUrl}/fonts`,
    formsUrl: `${baseUrl}/forms`,
    listsUrl: `${baseUrl}/lists`,
    navUrl: `${baseUrl}/nav`,
    searchUrl: `${baseUrl}/search`
  };
}

/**
  *
  */
function StyleGuide(props) {
  const urlMap = constructUrlMap(props.baseUrl);
  return <Fragment>
    <StyleGuideHeader urlMap={urlMap} />
    <Switch>
      <Route exact path={urlMap.baseUrl} render={
        p => <Overview key="overview" {...p} urlMap={urlMap} />} />
    </Switch>
    <Switch>
      <Route exact path={urlMap.fontsUrl} render={
        p => <FontsGuide key="fonts" {...p} urlMap={urlMap} />} />
    </Switch>
    <Switch>
      <Route exact path={urlMap.colorsUrl} render={
        p => <ColorsGuide key="colors" {...p} urlMap={urlMap} />} />
    </Switch>
    <Switch>
      <Route exact path={urlMap.buttonsUrl} render={
        p => <ButtonsGuide key="buttons" {...p} urlMap={urlMap} />} />
    </Switch>
    <Switch>
      <Route path={urlMap.navUrl} render={
        p => <NavGuide key="nav" {...p} urlMap={urlMap} />} />
    </Switch>
    <Switch>
      <Route exact path={urlMap.formsUrl} render={
        p => <FormsGuide key="forms" {...p} urlMap={urlMap} />} />
    </Switch>
    <Switch>
      <Route exact path={urlMap.listsUrl} render={
        p => <ListsGuide key="lists" {...p} urlMap={urlMap} />} />
    </Switch>
  </Fragment>;
}


export { StyleGuide };
