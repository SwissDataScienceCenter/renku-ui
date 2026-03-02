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
import { Col, Row } from "reactstrap";

import SearchBar from "./components/SearchBar";
import SearchFilters from "./components/SearchFilters";
import SearchResultRecap from "./components/SearchResultRecap";
import SearchResults from "./components/SearchResults";
import useSearchSync from "./hooks/useSearchSync.hook";

export default function Search() {
  useSearchSync();

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Row>
        <Col xs={12}>
          <SearchBar />
        </Col>
        <Col xs={12}>
          <SearchResultRecap />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={3} lg={2}>
          <SearchFilters />
        </Col>
        <Col xs={12} sm={9} lg={10}>
          <SearchResults />
        </Col>
      </Row>
    </div>
  );
}
