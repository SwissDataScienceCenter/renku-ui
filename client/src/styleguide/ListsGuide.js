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

import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "reactstrap";

import { TimeCaption, Pagination } from "../utils/UIComponents";

function createDateGradient() {
  const now = new Date();
  const twoH = new Date(now.getTime() - 2 * 3600000);
  const oneD = new Date(now.getTime() - 24 * 3600000);
  const twoD = new Date(now.getTime() - 2 * 24 * 3600000);
  return { twoH, oneD, twoD };
}

function TileListGuide(props) {
  const dateGradient = createDateGradient();
  return <Fragment>
    <h3>Tile lists</h3>
    <p>Use tile lists show information compactly.
    </p>
    <div className="list-group list-group-horizontal">
      <Link to="#" className="list-group-item list-group-item-action active" aria-current="true">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">Heading</h5>
          <TimeCaption time={dateGradient.twoH} />
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small>And some small print.</small>
      </Link>
      <Link to="#" className="list-group-item list-group-item-action">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">Heading</h5>
          <TimeCaption time={dateGradient.oneD} />
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small className="text-muted">And some muted small print.</small>
      </Link>
      <Link to="#" className="list-group-item list-group-item-action">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">Heading</h5>
          <TimeCaption time={dateGradient.twoD} />
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small className="text-muted">And some muted small print.</small>
      </Link>
    </div>
  </Fragment>;
}

function RowListGuide(props) {
  const dateGradient = createDateGradient();
  return <Fragment>
    <h3>Row lists</h3>
    <p>Use row lists if there is information to show that cannot be easily
      summarized or shortened.
    </p>
    <div className="list-group">
      <Link to="#" className="list-group-item list-group-item-action active" aria-current="true">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">List group item heading</h5>
          <TimeCaption time={dateGradient.twoH} />
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small>And some small print.</small>
      </Link>
      <Link to="#" className="list-group-item list-group-item-action">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">List group item heading</h5>
          <TimeCaption time={dateGradient.oneD} />
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small className="text-muted">And some muted small print.</small>
      </Link>
      <Link to="#" className="list-group-item list-group-item-action">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">List group item heading</h5>
          <TimeCaption time={dateGradient.twoD} />
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small className="text-muted">And some muted small print.</small>
      </Link>
    </div>
  </Fragment>;
}

function PaginationGuide(props) {
  const onPageChange = () => {};
  return <Fragment>
    <h3>Pagination</h3>
    <Pagination currentPage={2} perPage={10} totalItems={100} onPageChange={onPageChange}
      className="d-flex justify-content-center rk-search-pagination"/>
  </Fragment>;
}

function TablesGuide(props) {
  return <Fragment>
    <h3>Tables</h3>
    <p>Use tables to show tables of information like metadata fields and
      values. In this case, no need to use &ldquo;:&rdquo; to end the row header.</p>
    <table>
      <tbody>
        <tr>
          <th scope="row">Field 1</th>
          <td>value 1</td>
        </tr>
        <tr>
          <th scope="row">Field 2</th>
          <td>value 2</td>
        </tr>
      </tbody>
    </table>
    <br />
    <p>It may make sense to set off the table with a title using a card.</p>
    <Card className="border-rk-light">
      <CardHeader className="bg-white p-3 ps-4"><b>A table in a card</b></CardHeader>
      <CardBody style={{ overflow: "auto" }} className="p-4">
        <table>
          <tbody>
            <tr>
              <th scope="row">Field 1</th>
              <td>value 1</td>
            </tr>
            <tr>
              <th scope="row">Field 2</th>
              <td>value 2</td>
            </tr>
          </tbody>
        </table>
      </CardBody>
    </Card>
  </Fragment>;
}


function ListsGuide(props) {
  return <Fragment>
    <h2>Lists and Tables</h2>
    <TileListGuide />
    <br />
    <RowListGuide />
    <br />
    <PaginationGuide />
    <br />
    <TablesGuide />
  </Fragment>;
}

export default ListsGuide;
