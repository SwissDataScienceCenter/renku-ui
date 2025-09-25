/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useContext } from "react";

import AppContext from "../../utils/context/appContext";

import LazyRootV1 from "../rootV1/LazyRootV1";
import NavbarV2 from "../rootV2/NavbarV2";

import NoLegacySupport from "./NoLegacySupport";

export default function LegacyRoot() {
  const { params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return (
      <div className={cx("d-flex", "flex-column", "w-100")}>
        <NavbarV2 />
        <NoLegacySupport />
      </div>
    );
  }
  return <LazyRootV1 />;
}
