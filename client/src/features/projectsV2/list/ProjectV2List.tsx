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
import { Link } from "react-router-dom-v5-compat";

import FormSchema from "../../../components/formschema/FormSchema";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import WipBadge from "../shared/WipBadge";
import ProjectListDisplay from "./ProjectV2ListDisplay";

export default function ProjectV2List() {
  const newProjectUrl = ABSOLUTE_ROUTES.v2.projects.new;
  return (
    <FormSchema
      showHeader={true}
      title="List Projects (V2)"
      description={
        <>
          <div>
            All visible projects <WipBadge />{" "}
          </div>
          <div className="mt-3">
            <Link className={cx("btn", "btn-secondary")} to={newProjectUrl}>
              Create New Project
            </Link>
          </div>
        </>
      }
    >
      <ProjectListDisplay />
    </FormSchema>
  );
}
