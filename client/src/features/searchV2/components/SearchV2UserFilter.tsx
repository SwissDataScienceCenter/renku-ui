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
import { Button } from "reactstrap";
import { XLg } from "react-bootstrap-icons";
import { SearchV2FilterContainer } from "./SearchV2Filters.tsx";

interface SearchV2UserFilterProps {
  createdBy: string;
  removeUserFilter: () => void;
}

export function SearchV2UserFilter({
  createdBy,
  removeUserFilter,
}: SearchV2UserFilterProps) {
  if (!createdBy) return null;
  return (
    <SearchV2FilterContainer name="User" title="User">
      <Button onClick={removeUserFilter} className="px-2 btn-outline-rk-green">
        {createdBy} <XLg />
      </Button>
    </SearchV2FilterContainer>
  );
}
