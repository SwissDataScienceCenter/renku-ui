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
 * limitations under the License.
 */

import cx from "classnames";
import { PlusLg, ShieldLock } from "react-bootstrap-icons";
import { Badge, Button, Card, CardBody, CardHeader } from "reactstrap";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";

export default function ProjectSessionSecrets() {
  const { project } = useProject();
  const permissions = useProjectPermissions({ projectId: project.id });

  return (
    <Card>
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("m-0", "me-2")}>
              <ShieldLock className={cx("me-1", "bi")} />
              Session Secrets
            </h4>
            <Badge>42</Badge>
          </div>

          <div className="my-auto">
            <PermissionsGuard
              disabled={null}
              enabled={
                <Button
                  color="outline-primary"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  size="sm"
                >
                  <PlusLg className="bi" />
                </Button>
              }
              requestedPermission="write"
              userPermissions={permissions}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody>ProjectSessionSecrets</CardBody>
    </Card>
  );
}
