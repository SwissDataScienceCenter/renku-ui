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

import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Col, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import SortingEntities, { SortingOptions } from "../../utils/components/sortingEntities/SortingEntities";
import { FilterEntitySearch } from "../../utils/components/entitySearchFilter/EntitySearchFilter";
import { SearchResultsHeader } from "../../utils/components/searchResultsHeader/SearchResultsHeader";
import { SearchResultsContent } from "../../utils/components/searchResultsContent/SearchResultsContent";
import { useSearchEntitiesQuery } from "./KgSearchApi";
import { setPage, setSort, removeFilters, useKgSearchFormSelector } from "./KgSearchSlice";
import { KgAuthor } from "./KgSearch";
import { TypeEntitySelection } from "../../utils/components/typeEntityFilter/TypeEntityFilter";
import { VisibilitiesFilter } from "../../utils/components/visibilityFilter/VisibilityFilter";
import { DatesFilter } from "../../utils/components/dateFilter/DateFilter";
import { ProjectsInactiveKGWarning } from "../../landing/Landing.present";
import QuickNav from "../../utils/components/quicknav";
import AppContext from "../../utils/context/appContext";

interface SearchPageProps {
  isLoggedUser: boolean;
  userName?: string;
  model: any;
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
  valuesDate: DatesFilter;
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
  valuesDate
}: ModalFilterProps) => {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className="filter-modal">
      <ModalHeader toggle={onToggle}>
        <span className="filter-title">Filters</span>
      </ModalHeader>
      <ModalBody>
        <div className="pb-4 w-100">
          <FilterEntitySearch
            valuesDate={valuesDate} author={author} type={type} visibility={visibility} isLoggedUser={isLoggedUser} />
          <SortingEntities styleType="mobile" sort={sort} setSort={handleSort} />
        </div>
      </ModalBody>
    </Modal>
  );
};

function SearchPage({ userName, isLoggedUser, model }: SearchPageProps) {
  const { phrase, sort, page, type, author, visibility, perPage, since, until, typeDate } = useKgSearchFormSelector(
    (state) => state.kgSearchForm
  );
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(true);
  // @ts-ignore
  const { client } = useContext(AppContext);
  const user = useSelector((state: any) => state.stateModel.user);
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
    since,
    until,
  };

  const valuesDate = {
    since,
    until,
    type: typeDate
  };
  const onRemoveFilters = () => {
    dispatch(removeFilters());
  };

  const { data, isFetching, isLoading } = useSearchEntitiesQuery(searchRequest);
  const filter = (
    <>
      { isOpenFilter ?
        <Col className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-2 pb-2">
          <div className="d-none d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block filter-container">
            <FilterEntitySearch
              valuesDate={valuesDate} author={author} type={type} visibility={visibility} isLoggedUser={isLoggedUser} />
          </div>
        </Col>
        : null }
    </>
  );

  // @ts-ignore
  const searchNav = <QuickNav client={client} model={model} user={user} />;
  return (
    <>
      <Row>
        <ProjectsInactiveKGWarning />
        <Col className="col-12">
          {searchNav}
        </Col>
        <Col className={isOpenFilter ? "col-12 pb-2 m-auto search-header-container" :
          "col-10 pb-2 m-auto search-result-header search-header-container"}>
          <SearchResultsHeader
            total={data?.total}
            phrase={phrase}
            sort={sort}
            isFiltersOpened={isOpenFilter}
            toggleFilter={() => setIsOpenFilter(!isOpenFilter)}
            toggleFilterModal={setIsOpenFilterModal}
            isOpenFilterModal={isOpenFilterModal}
            handleSort={(value: SortingOptions) => dispatch(setSort(value))}
          />
        </Col>
        {filter}
        <Col className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-10 mx-auto">
          <SearchResultsContent
            data={data}
            isFetching={isFetching}
            isLoading={isLoading}
            onPageChange={(value: number) => dispatch(setPage(value))}
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
              valuesDate={valuesDate}
            />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
