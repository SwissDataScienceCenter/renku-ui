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
import { ErrorAlert } from "../../../../components/Alert.jsx";
import { Loader } from "../../../../components/Loader.tsx";

export function FetchingResourcePools() {
  return (
    <div className="form-label">
      <Loader className="me-1" inline size={16} />
      Fetching available resource pools...
    </div>
  );
}

interface ErrorOrNotAvailableResourcePoolsProps {
  title?: string;
}
export function ErrorOrNotAvailableResourcePools({
  title,
}: ErrorOrNotAvailableResourcePoolsProps) {
  return (
    <ErrorAlert dismissible={false}>
      <h3 className={cx("fs-6", "fw-bold")}>
        {title ?? "Error on loading available session resource pools"}
      </h3>
      <p className="mb-0">
        Modifying the session is not possible at the moment. You can try to{" "}
        <a
          className={cx("btn", "btn-sm", "btn-primary", "mx-1")}
          href={window.location.href}
          onClick={() => window.location.reload()}
        >
          reload the page
        </a>
        .
      </p>
    </ErrorAlert>
  );
}
