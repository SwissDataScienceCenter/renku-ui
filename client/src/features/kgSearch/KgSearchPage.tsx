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

import React, { useCallback, useContext, useEffect, useState } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";

import { Col, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import SortingEntities, { SortingOptions } from "../../components/sortingEntities/SortingEntities";
import { FilterEntitySearch } from "../../components/entitySearchFilter/EntitySearchFilter";
import { SearchResultsHeader } from "../../components/searchResultsHeader/SearchResultsHeader";
import { SearchResultsContent } from "../../components/searchResultsContent/SearchResultsContent";
import { useSearchEntitiesQuery } from "./KgSearchApi";
import { searchStringToStateV2, stateToSearchStringV2, useKgSearchState } from "./KgSearchState";
import { KgAuthor, KgSearchState } from "./KgSearch";
import { TypeEntitySelection } from "../../components/typeEntityFilter/TypeEntityFilter";
import { VisibilitiesFilter } from "../../components/visibilityFilter/VisibilityFilter";
import { DatesFilter } from "../../components/dateFilter/DateFilter";
import QuickNav from "../../components/quicknav";
import AppContext from "../../utils/context/appContext";
import ProjectsInactiveKGWarning from "../dashboard/components/InactiveKgProjects";
import { kgSearchSlice, useKgSearchSlice } from "./KgSearchSlice";
import { useHistory, useLocation } from "react-router";


/* eslint-disable @typescript-eslint/ban-types */

interface SearchPageProps {
  isLoggedUser: boolean;
  userName?: string;
  model: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  // const kgSearchState = useSelector((state: RootStateOrAny) => state[kgSearchSlice.name] as KgSearchState);
  // const dispatch = useDispatch();
  // const setPhrase = useCallback((phrase: string) => dispatch(kgSearchSlice.actions.setPhrase(phrase)), [dispatch]);
  // console.log({ kgSearchState });

  const { kgSearchState, updateFromSearchString, setPage, setSort, reset } = useKgSearchSlice();
  const { phrase, sort, page, type, author, visibility, perPage, since, until, typeDate } = kgSearchState;
  // console.log({ kgSearchState });

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    console.log({ kgSearchState });

    const prevSearch = history.location.search.slice(1);
    const prevSearchState = searchStringToStateV2(prevSearch);
    const normalizedPrevSearch = stateToSearchStringV2(prevSearchState);

    const newSearch = stateToSearchStringV2(kgSearchState);

    console.log({ prevSearch, normalizedPrevSearch, newSearch});

     if (newSearch !== normalizedPrevSearch) {
      console.log("history.push()", { prevSearch: normalizedPrevSearch, newSearch });
      history.push({ search: newSearch });
    }

    // const newSearch = stateToSearchStringV2(kgSearchState);
    // // console.log({ prevSearch, newSearch });
    // if (newSearch !== prevSearch) {
    //   console.log("history.push()", { prevSearch, newSearch });
    //   history.push({ search: newSearch });
    // }
  }, [history, kgSearchState]);

  useEffect(() => {
    console.log("location.search", { search: location.search });
    updateFromSearchString(location.search);
  }, [location.search])

  // useEffect(() => {
  //   const ret = history.listen((location, action) => {
  //     console.log("listener", location.search, action);
  //     updateFromSearchString(location.search);
  //   });
  //   return ret;
  // }, [history, updateFromSearchString]);

  // const { searchState, setPage, setSort, removeFilters } = useKgSearchState();
  // const { phrase, sort, page, type, author, visibility, perPage, since, until, typeDate } = searchState;

  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(true);
  const { client } = useContext(AppContext);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useSelector((state: any) => state.stateModel.user);
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
  // const onRemoveFilters = () => { removeFilters(); };

  const { data, isFetching, isLoading, error } = useSearchEntitiesQuery(searchRequest);
  const filter = (
    <>
      { isOpenFilter ?
        <Col className="col-12 col-lg-3 col-xl-2 pb-2">
          <div className="d-none d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block filter-container">
            <FilterEntitySearch
              valuesDate={valuesDate} author={author} type={type} visibility={visibility} isLoggedUser={isLoggedUser} />
          </div>
        </Col>
        : null }
    </>
  );

  // eslint-disable-next-line
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
            total={error ? 0 : data?.total}
            phrase={decodeURIComponent(phrase)}
            sort={sort}
            isFiltersOpened={isOpenFilter}
            toggleFilter={() => setIsOpenFilter(!isOpenFilter)}
            toggleFilterModal={setIsOpenFilterModal}
            isOpenFilterModal={isOpenFilterModal}
            handleSort={(value: SortingOptions) => setSort(value)}
          />
        </Col>
        {filter}
        <Col className="col-12 col-lg-9 col-xl-10 mx-auto">
          <SearchResultsContent
            data={data}
            isFetching={isFetching}
            isLoading={isLoading}
            onPageChange={(value: number) => setPage(value)}
            // onRemoveFilters={onRemoveFilters}
            onRemoveFilters={reset}
            error={error}
          />
          <div className="d-sm-block d-md-none">
            <ModalFilter
              author={author}
              type={type}
              visibility={visibility}
              sort={sort}
              handleSort={(value: SortingOptions) => setSort(value)}
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
