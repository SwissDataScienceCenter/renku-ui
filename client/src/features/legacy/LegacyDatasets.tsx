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

import { useContext } from "react";
import { Navigate } from "react-router";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";

export default function LegacyDatasets() {
  const { params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return (
      <Navigate
        // eslint-disable-next-line spellcheck/spell-checker
        to={`${ABSOLUTE_ROUTES.v2.search}?q=type%3Adataconnector`}
        replace
      />
    );
  }
  return <Navigate to={`${ABSOLUTE_ROUTES.v1.search}?type=dataset`} replace />;
}
