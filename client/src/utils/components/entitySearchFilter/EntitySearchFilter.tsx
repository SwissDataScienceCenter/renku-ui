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
import "./EntitySearchFilter.css";
import { TypeEntityFilter } from "../typeEntityFilter/TypeEntityFilter";
import { AuthorFilter } from "../authorFilter/AuthorFilter";
import { VisibilityFilter } from "../visibilityFilter/VisibilityFilter";
/**
 *  renku-ui
 *
 *  EntitySearchFilter.tsx
 *  Entity search filter component
 */

export interface FilterProps {
}

const FilterEntitySearch = ({}: FilterProps) => {
  const visibilityHandler = () => {
    // handle visibility change
  };
  const typeHandler = () => {
    // handle visibility change
  };
  const authorHandler = () => {
    // handle visibility change
  };

  const defaultTypeValues = {
    dataset: true,
    project: true,
  };

  const defaultVisibilityValues = {
    public: true,
    internal: true,
    private: true,
  }

  return (
    <>
      <div className="filter-box">
        <h3 className="filter-label">FILTER BY</h3>
        <div><TypeEntityFilter handler={typeHandler} value={defaultTypeValues} /></div>
        <div><AuthorFilter handler={authorHandler} value="all"/></div>
        <div><VisibilityFilter handler={visibilityHandler} value={defaultVisibilityValues} /></div>
      </div>
    </>
  )
}

export { FilterEntitySearch };
