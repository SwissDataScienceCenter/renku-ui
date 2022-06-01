/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Col, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import SortingEntities, { SortingOptions } from "../../utils/components/sortingEntities/SortingEntities";
import { FilterEntitySearch } from "../../utils/components/entitySearchFilter/EntitySearchFilter";
import { SearchResultsHeader } from "../../utils/components/searchResultsHeader/SearchResultsHeader";
import { SearchResultsContent } from "../../utils/components/searchResultsContent/SearchResultsContent";
import { useSearchEntitiesQuery } from "./KgSearchApi";
import { setPage, setSort, reset, useKgSearchFormSelector } from "./KgSearchSlice";
import { KgAuthor } from "./KgSearch";
import { TypeEntitySelection } from "../../utils/components/typeEntityFilter/TypeEntityFilter";
import { VisibilitiesFilter } from "../../utils/components/visibilityFilter/VisibilityFilter";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SearchPageProps {
  isLoggedUser: boolean;
  userName?: string;
}

interface ModalFilterProps {
  author: KgAuthor;
  type: TypeEntitySelection;
  visibility: VisibilitiesFilter;
  sort: SortingOptions;
  handleSort: Function;
  isOpen: boolean;
  onToggle: Function;
  isLoggedUser: boolean;
}

const ModalFilter = ({
  author,
  type,
  visibility,
  sort,
  handleSort,
  isOpen,
  onToggle,
  isLoggedUser,
}: ModalFilterProps) => {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className="filter-modal">
      <ModalHeader toggle={onToggle}>
        <span className="filter-title">Filter by</span>
      </ModalHeader>
      <ModalBody>
        <div className="bg-white px-4 pb-4 w-100">
          <FilterEntitySearch author={author} type={type} visibility={visibility} isLoggedUser={isLoggedUser} />
          <SortingEntities styleType="mobile" sort={sort} setSort={handleSort} />
        </div>
      </ModalBody>
    </Modal>
  );
};

function SearchPage({ userName, isLoggedUser }: SearchPageProps) {
  const { phrase, sort, page, type, author, visibility, perPage } = useKgSearchFormSelector(
    (state) => state.kgSearchForm
  );
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  const dispatch = useDispatch();
  const searchRequest = {
    phrase,
    sort,
    page,
    perPage,
    author,
    type,
    visibility,
    userName,
  };
  const onRemoveFilters = () => {
    dispatch(reset());
  };

  const { data, isFetching, isLoading } = useSearchEntitiesQuery(searchRequest);
  const filter = (
    <>
      <div className="d-sm-block d-md-block d-lg-none d-xl-none d-xxl-none text-end">
        <div className="fw-bold" onClick={() => setIsOpenFilterModal(!isOpenFilterModal)}>
          Filter & Sort <FontAwesomeIcon icon={isOpenFilterModal ? faAngleUp : faAngleDown} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-2 d-none d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block">
        <FilterEntitySearch author={author} type={type} visibility={visibility} isLoggedUser={isLoggedUser} />
      </div>
    </>
  );

  return (
    <>
      <Row>
        <Col className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-2 pb-2">{filter}</Col>
        <Col className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-10">
          <SearchResultsHeader
            total={data?.total}
            phrase={phrase}
            sort={sort}
            handleSort={(value: SortingOptions) => dispatch(setSort(value))}
          />
          <SearchResultsContent
            data={data}
            isFetching={isFetching}
            isLoading={isLoading}
            onPageChange={(value: number) => dispatch(setPage(value))}
            phrase={phrase}
            onRemoveFilters={onRemoveFilters}
          />
          <div className="d-sm-block d-md-none d-lg-none d-xl-none d-xxl-none">
            <ModalFilter
              author={author}
              type={type}
              visibility={visibility}
              sort={sort}
              handleSort={(value: SortingOptions) => dispatch(setSort(value))}
              isOpen={isOpenFilterModal}
              onToggle={() => setIsOpenFilterModal(!isOpenFilterModal)}
              isLoggedUser={isLoggedUser}
            />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
