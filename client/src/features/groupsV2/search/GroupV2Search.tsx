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
import { useLayoutEffect } from "react";
import { useSearchParams } from "react-router";
import { Col, Row } from "reactstrap";
import { Loader } from "~/components/Loader";
import { getSearchQueryMissingFilters } from "./groupSearch.utils";
import GroupSearchFilters from "./GroupSearchFilters";
import GroupSearchQueryInput from "./GroupSearchQueryInput";
import GroupSearchResultRecap from "./GroupSearchResultRecap";
import GroupSearchResults from "./GroupSearchResults";

export default function GroupV2Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Add any missing default parameter. There shouldn't be anything content-dependant.
  useLayoutEffect(() => {
    const missingParams = getSearchQueryMissingFilters(searchParams);
    if (Object.keys(missingParams).length > 0) {
      const newSearchParams = new URLSearchParams(searchParams);
      Object.entries(missingParams).forEach(([key, value]) => {
        newSearchParams.set(key, String(value));
      });
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // This prevents loading the page on semi-ready content and sending unnecessary requests.
  const missingParams = getSearchQueryMissingFilters(searchParams);
  if (Object.keys(missingParams).length > 0) {
    return <Loader />;
  }

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Row>
        <Col xs={12}>
          <GroupSearchQueryInput />
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
