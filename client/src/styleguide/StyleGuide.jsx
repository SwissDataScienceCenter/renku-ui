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

import { Fragment } from "react";
import { Route, Routes } from "react-router-dom-v5-compat";
import { Col, Nav, NavItem, Row, Table } from "reactstrap";

import { ExternalLink } from "../components/ExternalLinks";
import RenkuNavLinkV2 from "../components/RenkuNavLinkV2";
import { TimeCaption } from "../components/TimeCaption";
import ButtonsGuide from "./ButtonsGuide";
import ColorsGuide from "./ColorsGuide";
import FormsGuide from "./FormsGuide";
import ListsGuide from "./ListsGuide";

function Overview() {
  return (
    <Fragment>
      <h2>Overview</h2>
      <p>
        The style guide explains the different elements of the RenkuLab UI, how
        they should look and when to use what element.
      </p>
    </Fragment>
  );
}

function FontsGuide() {
  return (
    <Fragment>
      <h2>Fonts / Typography</h2>
      <p>
        <b>Font</b>{" "}
        <ExternalLink url="https://github.com/rsms/inter" role="link">
          Inter
        </ExternalLink>
      </p>
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
            <td>weight: 500;</td>
            <td>
              <h2>Lorem ipsum</h2>
            </td>
          </tr>
          <tr>
            <th scope="row">Section titles</th>
            <td>h3</td>
            <td>weight: 500;</td>
            <td>
              <h3>Lorem ipsum</h3>
            </td>
          </tr>
          <tr>
            <th scope="row">Normal text</th>
            <td>p/div</td>
            <td>weight: 500;</td>
            <td>Lorem ipsum dolor sit amet</td>
          </tr>
          <tr>
            <th scope="row">Time display</th>
            <td>TimeCaption</td>
            <td>text-muted</td>
            <td>
              <TimeCaption datetime={new Date()} prefix="Updated" />
            </td>
          </tr>
        </tbody>
      </Table>
    </Fragment>
  );
}

function NavGuide() {
  return (
    <Fragment>
      <h2>Nav</h2>
      <h3>First-level Nav</h3>
      <p>The primary navigation on the page should be a first-level nav.</p>
      <div className="pb-3 rk-search-bar">
        <Nav pills className="nav-pills-underline">
          <NavItem>
            <RenkuNavLinkV2 end to=".">
              Tab 1
            </RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="tab2">Tab 2</RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="tab3">Tab 3</RenkuNavLinkV2>
          </NavItem>
        </Nav>
      </div>
      <br />
      <h4>Second-level Nav</h4>
      <p>If a secondary navigation is necessary, use a second-level nav.</p>
      <Nav className="flex-column nav-light nav-pills-underline">
        <NavItem>
          <RenkuNavLinkV2 end to=".">
            Tab 1
          </RenkuNavLinkV2>
        </NavItem>
        <NavItem>
          <RenkuNavLinkV2 to="tab2">Tab 2</RenkuNavLinkV2>
        </NavItem>
        <NavItem>
          <RenkuNavLinkV2 to="tab3">Tab 3</RenkuNavLinkV2>
        </NavItem>
      </Nav>
    </Fragment>
  );
}

function StyleGuideNav() {
  return (
    <div className="pb-3 rk-search-bar">
      <Col className="d-flex pb-2 mb-1" md={12} lg={12}>
        <Nav pills className="nav-pills-underline">
          <NavItem>
            <RenkuNavLinkV2 end to=".">
              Overview
            </RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="fonts">Fonts</RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="colors">Colors</RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="buttons">Buttons</RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="nav">Nav</RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="forms">Forms</RenkuNavLinkV2>
          </NavItem>
          <NavItem>
            <RenkuNavLinkV2 to="lists">Lists</RenkuNavLinkV2>
          </NavItem>
        </Nav>
      </Col>
    </div>
  );
}

function StyleGuideHeader() {
  return (
    <Fragment>
      <Row className="pt-2 pb-3">
        <Col>
          <div>
            <h2>Style Guide</h2>
            <div className="text-rk-text">
              An guide to the RenkuLab UI elements.
            </div>
          </div>
          <div className="mt-2">
            <StyleGuideNav />
          </div>
        </Col>
      </Row>
    </Fragment>
  );
}

export default function StyleGuide() {
  return (
    <Fragment>
      <StyleGuideHeader />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="fonts" element={<FontsGuide />} />
        <Route path="colors" element={<ColorsGuide />} />
        <Route path="buttons" element={<ButtonsGuide />} />
        <Route path="nav/*" element={<NavGuide />} />
        <Route path="forms" element={<FormsGuide />} />
        <Route path="lists" element={<ListsGuide />} />
      </Routes>
    </Fragment>
  );
}
