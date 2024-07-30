/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */
import { Col, Row } from "reactstrap";

import SearchV2Bar from "./components/SearchV2Bar";
import SearchV2Filters from "./components/SearchV2Filters";
import SearchV2Header from "./components/SearchV2Header";
import SearchV2Results from "./components/SearchV2Results";

export default function SearchV2() {
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>Search v2</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <SearchV2Bar />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <SearchV2Header />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col xs={12} sm={4} lg={3} xxl={2}>
          <SearchV2Filters />
        </Col>
        <Col xs={12} sm={8} lg={9} xxl={10}>
          <SearchV2Results />
        </Col>
      </Row>
    </>
  );
}
