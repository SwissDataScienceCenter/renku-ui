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

import { useKgSearchContext } from "../../features/kgSearch/KgSearchContext";
import { DateFilter, DatesFilter } from "../dateFilter/DateFilter";
import {
  TypeEntityFilter,
  TypeEntitySelection,
} from "../typeEntityFilter/TypeEntityFilter";
import UserRolesFilter from "../userRolesFilter/UserRolesFilter";
import type { UserRoles } from "../userRolesFilter/userRolesFilter.types";
import {
  VisibilitiesFilter,
  VisibilityFilter,
} from "../visibilityFilter/VisibilityFilter";
import "./EntitySearchFilter.css";

/**
 *  renku-ui
 *
 *  EntitySearchFilter.tsx
 *  Entity search filter component
 */

export interface FilterProps {
  // author: KgAuthor;
  type: TypeEntitySelection;
  role: UserRoles;
  visibility: VisibilitiesFilter;
  isLoggedUser: boolean;
  valuesDate: DatesFilter;
}

const FilterEntitySearch = ({
  // author,
  type,
  role,
  visibility,
  isLoggedUser,
  valuesDate,
}: FilterProps) => {
  const {
    reducers: { setDates, setType, setUserRole, setVisibility },
  } = useKgSearchContext();

  // const authorComponent = isLoggedUser ? (
  //   <div>
  //     <AuthorFilter
  //       handler={(value: KgAuthor) => setAuthor(value)}
  //       value={author}
  //     />
  //   </div>
  // ) : null;

  const userRoleComponent = isLoggedUser && (
    <div>
      <UserRolesFilter role={role} setUserRole={setUserRole} />
    </div>
  );

  const visibilityComponent = isLoggedUser ? (
    <div>
      <VisibilityFilter
        handler={(value: VisibilitiesFilter) => setVisibility(value)}
        value={visibility}
      />
    </div>
  ) : null;

  return (
    <>
      <div className="filter-box">
        <div>
          <TypeEntityFilter
            handler={(value: TypeEntitySelection) => setType(value)}
            value={type}
          />
        </div>
        {userRoleComponent}
        {visibilityComponent}
        <div>
          <DateFilter dates={valuesDate} onDatesChange={setDates} />
        </div>
      </div>
    </>
  );
};

export { FilterEntitySearch };
