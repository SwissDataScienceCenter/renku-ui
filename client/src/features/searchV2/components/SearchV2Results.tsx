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
import cx from "classnames";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { Card, CardBody, Col, Row } from "reactstrap";

import searchV2Api from "../searchV2.api";
import { Loader } from "../../../components/Loader";
import { TimeCaption } from "../../../components/TimeCaption";
import { Url } from "../../../utils/helpers/url/Url";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { simpleHash } from "../../../utils/helpers/HelperFunctions";

export default function SearchV2Results() {
  return (
    <Row>
      <Col className="d-sm-none" xs={12}>
        <h3>Results</h3>
      </Col>
      <Col>
        <SearchV2ResultsContent />
      </Col>
    </Row>
  );
}

function SearchV2ResultsContent() {
  // get the search state
  const { search } = useAppSelector((state) => state.searchV2);
  const searchResults = searchV2Api.endpoints.getSearchResults.useQueryState(
    search.lastSearch != null ? search.lastSearch : skipToken
  );

  if (searchResults.isFetching) {
    return <Loader />;
  }
  if (search.lastSearch == null) {
    return <p>Start searching by typing in the search bar above.</p>;
  }

  if (!searchResults.data?.length) {
    return (
      <>
        <p>
          No results for{" "}
          <span className="fw-bold">{`"${search.lastSearch}"`}</span>.
        </p>
        <p>You can try another search, or change some filters.</p>
      </>
    );
  }

  const resultsOutput = searchResults.data.map((entity) => {
    if (entity.type === "Project") {
      const url = Url.get(Url.pages.v2Projects.show, { id: entity.id });
      return (
        <SearchV2ResultsCard key={entity.id} url={url} cardId={entity.id}>
          <h4 className="mb-0">{entity.name}</h4>
          <p className={cx("form-text", "mb-0")}>
            {entity.slug} - {entity.visibility}
          </p>
          <p className={cx("form-text", "text-rk-green")}>
            user-{entity.createdBy.id}
          </p>
          <p>{entity.description}</p>
          <p className="form-text mb-0">
            <TimeCaption datetime={entity.creationDate} prefix="Created" />
          </p>
        </SearchV2ResultsCard>
      );
    } else if (entity.type === "User") {
      const url = Url.get(Url.pages.v2Users.show, { id: entity.id });
      return (
        <SearchV2ResultsCard key={entity.id} url={url} cardId={entity.id}>
          <h4 className="mb-0">{entity.id}</h4>
          <p className="form-text mb-0">
            <TimeCaption datetime={entity.creationDate} prefix="Created" />
          </p>
        </SearchV2ResultsCard>
      );
    }
    // Unknown entity type, in case backend introduces new types before the UI catches up
    const fakeId = simpleHash(Math.random().toString());
    return (
      <SearchV2ResultsCard key={fakeId} cardId={fakeId}>
        <h4 className="mb-0">Unknown entity</h4>
        <p className="form-text mb-0">This entity type is not supported yet.</p>
      </SearchV2ResultsCard>
    );
  });

  return <Row>{resultsOutput}</Row>;
}

interface SearchV2ResultsCardProps {
  cardId: string;
  children: React.ReactNode;
  url?: string;
}
function SearchV2ResultsCard({
  cardId,
  children,
  url = "#",
}: SearchV2ResultsCardProps) {
  return (
    <Col key={cardId} xs={12} lg={6}>
      <Link className="text-decoration-none" to={url}>
        <Card className={cx("border", "rounded")}>
          <CardBody>{children}</CardBody>
        </Card>
      </Link>
    </Col>
  );
}
