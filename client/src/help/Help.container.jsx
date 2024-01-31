/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Help.container.js
 *  Container components for help
 */

import { useContext } from "react";

import AppContext from "../utils/context/appContext";
import { Help as HelpPresent } from "./Help.present";

export default function Help() {
  const { model, params } = useContext(AppContext);
  const statuspageId = params.STATUSPAGE_ID;

  return (
    <HelpPresent model={model} params={params} statuspageId={statuspageId} />
  );
}
