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
import cx from "classnames";
import { useDispatch } from "react-redux";
import { Card, CardBody, Col, Row } from "reactstrap";

import { AVAILABLE_FILTERS, toggleFilter } from "../searchV2.slice";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { SearchV2FilterOptions } from "../searchV2.types";

export default function SearchV2Filters() {
  const dispatch = useDispatch();
  const { filters } = useAppSelector((state) => state.searchV2);

  const filtersList = Object.entries(AVAILABLE_FILTERS).map(
    ([filterName, options]) => (
      <SearchV2Filter
        key={filterName}
        name={filterName}
        options={Object.entries(options).map(([key, value]) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          checked: !!(filters as any)[filterName]?.includes(key),
          key,
          value,
        }))}
        title={filterName.charAt(0).toUpperCase() + filterName.slice(1)}
        toggleOption={(value) => {
          dispatch(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toggleFilter({ filter: filterName as any, value: value as any })
          );
        }}
      />
    )
  );

  return (
    <>
      <Row className="mb-3">
        <Col className="d-sm-none" xs={12}>
          <h3>Filters</h3>
        </Col>
        <Col className={cx("d-flex", "flex-column", "gap-3")}>
          {filtersList}

          <SearchV2FilterContainer title="Creation date">
            Not yet implemented
          </SearchV2FilterContainer>
        </Col>
      </Row>
    </>
  );
}

interface SearchV2FilterContainerProps {
  children: React.ReactNode;
  title: string;
}
function SearchV2FilterContainer({
  children,
  title,
}: SearchV2FilterContainerProps) {
  return (
    <Card className={cx("border", "rounded")}>
      <CardBody>
        <p className={cx("form-text", "mb-1", "mt-0")}>{title}</p>
        {children}
      </CardBody>
    </Card>
  );
}

interface SearchV2FilterProps {
  name: string;
  options: SearchV2FilterOptions[];
  title: string;
  toggleOption: (key: string) => void;
}
function SearchV2Filter({
  name,
  options,
  title,
  toggleOption,
}: SearchV2FilterProps) {
  return (
    <SearchV2FilterContainer title={title}>
      {options.map(({ checked, key, value }) => {
        const id = `search-filter-${name}-${key}`;

        return (
          <div
            className={cx("form-rk-green", "d-flex", "align-items-center")}
            key={id}
          >
            <input
              className="form-check-input"
              id={id}
              type="checkbox"
              checked={checked}
              onChange={() => toggleOption(key)}
              data-cy={`user-role-${key}`}
            />
            <label
              className={cx("form-check-label", "ms-2", "mt-1")}
              htmlFor={id}
            >
              {value}
            </label>
          </div>
        );
      })}
    </SearchV2FilterContainer>
  );
}
