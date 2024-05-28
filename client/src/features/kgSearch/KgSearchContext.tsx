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

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom-v5-compat";
import {
  DateFilterTypes,
  DatesFilter,
} from "../../components/dateFilter/DateFilter";
import { SortingOptions } from "../../components/sortingEntities/SortingEntities";
import { TypeEntitySelection } from "../../components/typeEntityFilter/TypeEntityFilter";
import type { UserRoles } from "../../components/userRolesFilter/userRolesFilter.types";
import { VisibilitiesFilter } from "../../components/visibilityFilter/VisibilityFilter";
import { KgSearchState } from "./KgSearch.types";
import {
  defaultSearchState,
  searchStringToState,
  stateToSearchString,
} from "./KgSearchState";

interface KgSearchContextType {
  kgSearchState: KgSearchState;
  reducers: {
    setDates: (dates: DatesFilter) => void;
    setMyProjects: () => void;
    setMyDatasets: () => void;
    setPhrase: (phrase: string) => void;
    setPage: (page: number) => void;
    setSort: (sort: SortingOptions) => void;
    setType: (type: TypeEntitySelection) => void;
    setUserRole: (role: UserRoles) => void;
    setVisibility: (visibility: VisibilitiesFilter) => void;
    reset: () => void;
  };
}

const KgSearchContext = createContext<KgSearchContextType | null>(null);

interface KgSearchContextProviderProps {
  children?: ReactNode;
}

export const KgSearchContextProvider = ({
  children,
}: KgSearchContextProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const kgSearchState = useMemo(() => {
    const state = searchStringToState(location.search);
    return state;
  }, [location.search]);

  const setDates = useCallback(
    (dates: DatesFilter) => {
      const search = stateToSearchString({
        ...kgSearchState,
        since: dates.since ?? "",
        until: dates.until ?? "",
        typeDate: dates.type ?? DateFilterTypes.all,
        page: 1,
      });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const setMyProjects = useCallback(() => {
    const search = stateToSearchString({
      ...kgSearchState,
      type: { project: true, dataset: false },
      role: { owner: true, maintainer: false, reader: false },
      phrase: "",
      page: 1,
    });
    navigate({ search });
  }, [history, kgSearchState]);
  const setMyDatasets = useCallback(() => {
    const search = stateToSearchString({
      ...kgSearchState,
      type: { project: false, dataset: true },
      role: { owner: true, maintainer: false, reader: false },
      phrase: "",
      page: 1,
    });
    navigate({ search });
  }, [history, kgSearchState]);
  const setPhrase = useCallback(
    (phrase: string) => {
      const search = stateToSearchString({
        ...kgSearchState,
        phrase,
        page: 1,
      });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const setPage = useCallback(
    (page: number) => {
      const search = stateToSearchString({ ...kgSearchState, page });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const setSort = useCallback(
    (sort: SortingOptions) => {
      const search = stateToSearchString({ ...kgSearchState, sort, page: 1 });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const setType = useCallback(
    (type: TypeEntitySelection) => {
      const search = stateToSearchString({ ...kgSearchState, type, page: 1 });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const setUserRole = useCallback(
    (role: UserRoles) => {
      const search = stateToSearchString({
        ...kgSearchState,
        role,
        page: 1,
      });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const setVisibility = useCallback(
    (visibility: VisibilitiesFilter) => {
      const search = stateToSearchString({
        ...kgSearchState,
        visibility,
        page: 1,
      });
      navigate({ search });
    },
    [history, kgSearchState]
  );
  const reset = useCallback(() => {
    const search = stateToSearchString(defaultSearchState);
    navigate({ search });
  }, [history]);

  const reducers = {
    setDates,
    setMyProjects,
    setMyDatasets,
    setPhrase,
    setPage,
    setSort,
    setType,
    setUserRole,
    setVisibility,
    reset,
  };

  return (
    <KgSearchContext.Provider value={{ kgSearchState, reducers }}>
      {children}
    </KgSearchContext.Provider>
  );
};

export const useKgSearchContext = () => {
  const context = useContext(KgSearchContext);
  if (context == null) {
    throw new Error(
      "useKgSearchContext() must be called within a <KgSearchContextProvider/>"
    );
  }

  return context;
};
