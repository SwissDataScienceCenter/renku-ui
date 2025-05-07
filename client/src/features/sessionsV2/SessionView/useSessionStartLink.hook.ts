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
import { generatePath } from "react-router";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import AppContext from "../../../utils/context/appContext";

export default function useSessionStartLink({
  launcherId,
  namespace,
  slug,
}: {
  launcherId: string;
  namespace: string;
  slug: string;
}) {
  const startPath = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcherId,
      namespace: namespace,
      slug: slug,
    }
  );
  const { params } = useContext(AppContext);
  const baseUrl = params?.BASE_URL ?? window.location.href;
  const url = new URL(startPath, baseUrl);
  return { url };
}
