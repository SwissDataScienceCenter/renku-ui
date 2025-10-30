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
import { Navigate, useSearchParams } from "react-router";
import { Col, Row } from "reactstrap";

import { getSearchQueryMissingFilters } from "./groupSearch.utils";
import GroupSearchBar from "./GroupSearchBar";
import GroupSearchFilters from "./GroupSearchFilters";
import GroupSearchResultRecap from "./GroupSearchResultRecap";
import GroupSearchResults from "./GroupSearchResults";

// ? The GroupV2Search components should be re-used in the User namespace and later
// ? replace the global search components. Mind to rename them at that point.
export default function GroupV2Search() {
  const [searchParams] = useSearchParams();

  // Replace the location whenever parameters are missing
  const missingParams = getSearchQueryMissingFilters(searchParams);
  if (Object.keys(missingParams).length > 0) {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(missingParams).forEach(([key, filterWithValue]) => {
      if (filterWithValue?.value != null) {
        newSearchParams.set(key, filterWithValue.value.toString());
      }
    });
    return <Navigate to={{ search: newSearchParams.toString() }} replace />;
  }

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Row>
        <Col xs={12}>
          <GroupSearchBar />
        </Col>
        <Col xs={12}>
          <GroupSearchResultRecap />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={3} lg={2}>
          <GroupSearchFilters />
        </Col>
        <Col xs={12} sm={9} lg={10}>
          <GroupSearchResults />
        </Col>
      </Row>
    </div>
  );
}
