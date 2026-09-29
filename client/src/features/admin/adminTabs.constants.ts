/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import {
  Archive,
  Cpu,
  PlayCircle,
  Plugin,
  WrenchAdjustableCircle,
} from "react-bootstrap-icons";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

export const ADMIN_TABS = [
  {
    path: ABSOLUTE_ROUTES.v2.admin.root,
    title: "Incidents and Maintenance",
    icon: WrenchAdjustableCircle,
    dataCy: "admin-incidents-link",
  },
  {
    path: ABSOLUTE_ROUTES.v2.admin.computeResources,
    title: "Compute Resources",
    icon: Cpu,
    dataCy: "admin-compute-resources-link",
  },
  {
    path: ABSOLUTE_ROUTES.v2.admin.integrations,
    title: "Integrations",
    icon: Plugin,
    dataCy: "admin-integrations-link",
  },
  {
    path: ABSOLUTE_ROUTES.v2.admin.sessionEnvironments,
    title: "Session Environments",
    icon: PlayCircle,
    dataCy: "admin-session-environments-link",
  },
  {
    path: ABSOLUTE_ROUTES.v2.admin.projectStorage,
    title: "Project Storage",
    icon: Archive,
    dataCy: "admin-project-storage-link",
  },
];
