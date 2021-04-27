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

import React, { Fragment } from "react";
import { Table } from "reactstrap";


function ColorsGuide(props) {
  return <Fragment>
    <h2>Colors</h2>
    <h3>Base Colors</h3>
    <Table className="color-table">
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Base</th>
          <th scope="col">Lighter</th>
          <th scope="col">Darker</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">rk-blue | primary</th>
          <td className="bg-primary text-white">#01192D hsl(207, 96%, 9%)</td>
          <td className="bg-primary text-white"></td>
          <td className="bg-primary text-white"></td>
        </tr>
        <tr>
          <th scope="row">rk-green | secondary</th>
          <td className="bg-secondary text-white">#009568 hsl(162, 100%, 29%)</td>
          <td style={{ backgroundColor: "hsl(162, 100%, 37%)" }}>hsl(162, 100%, 37%)</td>
          <td style={{ backgroundColor: "hsl(162, 100%, 20%)" }} className="text-white">hsl(162, 100%, 20%)</td>
        </tr>
        <tr>
          <th scope="row">rk-pink</th>
          <td className="bg-rk-pink text-dark">#D26A98 hsl(333, 54%, 62%)</td>
          <td style={{ backgroundColor: "hsl(333, 54%, 70%)" }}>hsl(333, 54%, 70%)</td>
          <td style={{ backgroundColor: "hsl(333, 54%, 55%)" }} className="text-white">hsl(333, 54%, 55%)</td>
        </tr>
        <tr>
          <th scope="row">rk-yellow</th>
          <td className="bg-rk-yellow text-dark">#D1BB4C hsl(50, 59%, 56%)</td>
          <td style={{ backgroundColor: "hsl(50, 59%, 60%)" }}>hsl(50, 59%, 60%)</td>
          <td style={{ backgroundColor: "hsl(50, 59%, 45%)" }} className="text-white">hsl(50, 59%, 45%)</td>
        </tr>
        <tr>
          <th scope="row">rk-background</th>
          <td>#F5F5F5 rgb(90%, 90%, 90%)</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </Table>

    <h3>Semantic Colors (placeholders)</h3>
    <Table className="color-table">
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Base</th>
        </tr>
      </thead>
      <tbody>
      <tr>
          <th scope="row">info?</th>
          <td className="bg-info text-white">#0054C2 hsl(214, 100%, 38%)</td>
        </tr>
        <tr>
          <th scope="row">success?</th>
          <td className="bg-success text-dark">#1EB833 hsl(128, 72%, 42%)</td>
        </tr>
        <tr>
          <th scope="row">danger?</th>
          <td className="bg-danger text-white">#DB2D24 hsl(3, 72%, 50%)</td>
        </tr>
        <tr>
          <th scope="row">warning?</th>
          <td className="bg-warning">#F0C800 hsl(50, 100%, 47%)</td>
        </tr>
      </tbody>
    </Table>
  </Fragment>;
}

export default ColorsGuide;
