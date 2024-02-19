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

import { Button, Input, InputGroup } from "reactstrap";

export default function SearchV2() {
  return (
    <>
      <h2>Search v2</h2>
      <InputGroup>
        <Input
          className={cx("form-control", "rounded-0", "rounded-start")}
          placeholder="Search..."
          tabIndex={1} // ! Link the search button to the default action
        />
        <Button color="secondary" className="rounded-end">
          Search
        </Button>
      </InputGroup>
    </>
  );
}
