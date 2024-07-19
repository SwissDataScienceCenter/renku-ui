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

// import { useCallback, useEffect } from "react";
// import { useDispatch } from "react-redux";

// import { setPage, setSearch, setTotals } from "./searchV2.slice";
// import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
// import { buildSearchQuery } from "./searchV2.utils";
// import { searchV2Api } from "./api/searchV2Api.api";

// const useStartNewSearch = () => {
//   const dispatch = useDispatch();
//   const searchState = useAppSelector((state) => state.searchV2);
//   const [startSearch, searchResult] = searchV2Api.endpoints.$get.useLazyQuery();

//   // update the search slice and start the new query
//   const startNewSearch = useCallback(() => {
//     const searchQuery = buildSearchQuery(searchState);

//     if (
//       searchResult.fulfilledTimeStamp &&
//       searchQuery === searchState.search.lastSearch &&
//       +new Date() - searchResult.fulfilledTimeStamp < 1000
//     )
//       return;

//     dispatch(setSearch(searchQuery));
//     const resetPage = searchState.search.lastSearch !== searchQuery;
//     if (resetPage) dispatch(setPage(1));
//     startSearch({
//       q: searchQuery,
//       page: resetPage ? 1 : searchState.search.page,
//       perPage: searchState.search.perPage,
//     });
//   }, [dispatch, searchState, startSearch, searchResult.fulfilledTimeStamp]);

//   // handle pagination results
//   useEffect(() => {
//     if (
//       searchResult.data &&
//       searchState.search.totalResults !==
//         searchResult.data?.pagingInfo.totalResult
//     ) {
//       dispatch(
//         setTotals({
//           results: searchResult.data?.pagingInfo.totalResult,
//           pages: searchResult.data?.pagingInfo.totalPages,
//         })
//       );
//     }
//   }, [
//     dispatch,
//     searchResult.data,
//     searchResult.data?.pagingInfo.totalResult,
//     searchResult.data?.pagingInfo.totalPages,
//     searchState.search.totalResults,
//   ]);

//   // handle changes that influence the UI appearance and requires a new backend search
//   useEffect(() => {
//     if (searchState.search.outdated) {
//       startNewSearch();
//     }
//   }, [searchState.search.outdated, startNewSearch]);

//   return { startNewSearch, searchResult };
// };

// export default useStartNewSearch;
