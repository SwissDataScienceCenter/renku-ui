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
import * as React from "react";
import { useDispatch } from "react-redux";

import { KgAuthor } from "../../../features/kgSearch/KgSearch";
import { setAuthor, setType, setVisibility } from "../../../features/kgSearch/KgSearchSlice";
import { TypeEntityFilter, TypeEntitySelection } from "../typeEntityFilter/TypeEntityFilter";
import { AuthorFilter } from "../authorFilter/AuthorFilter";
import { VisibilitiesFilter, VisibilityFilter } from "../visibilityFilter/VisibilityFilter";
import "./EntitySearchFilter.css";

/**
 *  renku-ui
 *
 *  EntitySearchFilter.tsx
 *  Entity search filter component
 */

export interface FilterProps {
  author: KgAuthor;
  type: TypeEntitySelection;
  visibility: VisibilitiesFilter;
  isLoggedUser: boolean;
}

const FilterEntitySearch = ({ author, type, visibility, isLoggedUser }: FilterProps) => {
  const dispatch = useDispatch();
  const authorComponent = isLoggedUser ? (
    <div><AuthorFilter
      handler={(value: KgAuthor) => dispatch(setAuthor(value))}
      value={author} /></div>
  ) : null;
  return (
    <>
      <h3 className="filter-label d-none d-sm-none d-md-none d-lg-block d-xl-block pb-3">Filter by</h3>
      <div className="filter-box">
        <div><TypeEntityFilter
          handler={(value: TypeEntitySelection) => dispatch(setType(value))}
          value={type} /></div>
        {authorComponent}
        <div><VisibilityFilter
          handler={(value: VisibilitiesFilter) => dispatch(setVisibility(value))}
          value={visibility} /></div>
      </div>
    </>
  );
};

export { FilterEntitySearch };
