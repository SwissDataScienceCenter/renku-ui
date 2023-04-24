/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { ReactNode, createContext, useCallback, useContext, useMemo } from "react";
import { useHistory, useLocation } from "react-router";
import { DateFilterTypes, DatesFilter } from "../../components/dateFilter/DateFilter";
import { SortingOptions } from "../../components/sortingEntities/SortingEntities";
import { TypeEntitySelection } from "../../components/typeEntityFilter/TypeEntityFilter";
import { VisibilitiesFilter } from "../../components/visibilityFilter/VisibilityFilter";
import { KgAuthor, KgSearchState } from "./KgSearch";
import { searchStringToStateV2, stateToSearchStringV2 } from "./KgSearchState";

interface KgSearchContextType {
  kgSearchState: KgSearchState;
  reducers: {
    setAuthor: (author: KgAuthor) => void,
    setDates: (dates: DatesFilter) => void,
    setMyProjects: ()=> void,
    setMyDatasets: () =>void,
    setPhrase: (phrase: string) => void,
    setPage: (page: number) => void,
    setSort: (sort: SortingOptions) => void,
    setType: (type: TypeEntitySelection) => void,
    setVisibility: (visibility: VisibilitiesFilter) =>void,
    reset: () => void,
  };
}

const defaultSearchState: KgSearchState = {
  author: "all",
  page: 1,
  perPage: 24,
  phrase: "",
  since: "",
  sort: SortingOptions.DescMatchingScore,
  type: { project: true, dataset: false, },
  typeDate: DateFilterTypes.all,
  until: "",
  visibility: { private: true, public: true, internal: true },
};

const KgSearchContext = createContext<KgSearchContextType | null>(null);

interface KgSearchContextProviderProps {
  children?: ReactNode;
}

export const KgSearchContextProvider = ({ children }: KgSearchContextProviderProps) => {
  const location = useLocation();
  const history = useHistory();

  const kgSearchState = useMemo(() => {
    const state = searchStringToStateV2(location.search);
    return state;
  }, [location.search]);

  const setAuthor = useCallback((author: KgAuthor) => {
    const search = stateToSearchStringV2({ ...kgSearchState, author, page: 1 });
    history.push({ search });
  }, [history, kgSearchState]);
  const setDates = useCallback((dates: DatesFilter) => {
    const search = stateToSearchStringV2({ ...kgSearchState,
      since: dates.since ?? "",
      until: dates.until ?? "",
      typeDate: dates.type ?? DateFilterTypes.all,
      page: 1,
    });
    history.push({ search });
  }, [history, kgSearchState]);
  const setMyProjects = useCallback(() => {
    const search = stateToSearchStringV2({ ...kgSearchState,
      type: { project: true, dataset: false },
      author: "user",
      phrase: "",
      page: 1,
    });
    history.push({ search });
  }, [history, kgSearchState]);
  const setMyDatasets = useCallback(() => {
    const search = stateToSearchStringV2({ ...kgSearchState,
      type: { project: false, dataset: true },
      author: "user",
      phrase: "",
      page: 1,
    });
    history.push({ search });
  }, [history, kgSearchState]);
  const setPhrase = useCallback((phrase: string) => {
    const search = stateToSearchStringV2({ ...kgSearchState, phrase, page: 1, });
    history.push({ search });
  }, [history, kgSearchState]);
  const setPage = useCallback((page: number) => {
    const search = stateToSearchStringV2({ ...kgSearchState, page });
    history.push({ search });
  }, [history, kgSearchState]);
  const setSort = useCallback((sort: SortingOptions) => {
    const search = stateToSearchStringV2({ ...kgSearchState, sort, page: 1, });
    history.push({ search });
  }, [history, kgSearchState]);
  const setType = useCallback((type: TypeEntitySelection) => {
    const search = stateToSearchStringV2({ ...kgSearchState, type, page: 1, });
    history.push({ search });
  }, [history, kgSearchState]);
  const setVisibility = useCallback((visibility: VisibilitiesFilter) => {
    const search = stateToSearchStringV2({ ...kgSearchState, visibility, page: 1, });
    history.push({ search });
  }, [history, kgSearchState]);
  const reset = useCallback(() => {
    const search = stateToSearchStringV2(defaultSearchState);
    history.push({ search });
  }, [history]);

  const reducers = { setAuthor,
    setDates, setMyProjects, setMyDatasets, setPhrase, setPage, setSort, setType, setVisibility, reset };

  return (<KgSearchContext.Provider value={{ kgSearchState, reducers }}>
    {children}
  </KgSearchContext.Provider>);
};

export const useKgSearchContext = () => {
  const context = useContext(KgSearchContext);
  if (context == null)
    throw new Error("useKgSearchContext() must be called within a <KgSearchContextProvider/>");

  return context;
};
