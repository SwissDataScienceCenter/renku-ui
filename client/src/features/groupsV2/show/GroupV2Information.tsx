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
import { Clock, InfoCircle, JournalAlbum } from "react-bootstrap-icons";
import { generatePath } from "react-router-dom-v5-compat";
import { Card, CardBody, CardHeader } from "reactstrap";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants.ts";
import GroupV2MemberListDisplay from "../members/GroupV2MemberListDisplay.tsx";
import useGroupPermissions from "../utils/useGroupPermissions.hook.ts";
import { useGroup } from "./GroupPageContainer.tsx";
import { TimeCaption } from "../../../components/TimeCaption.tsx";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard.tsx";
import { EditButtonLink } from "../../../components/buttons/Button.tsx";

interface GroupInformationProps {
  output?: "plain" | "card";
}
export default function GroupInformation({
  output = "plain",
}: GroupInformationProps) {
  const { group } = useGroup();

  const permissions = useGroupPermissions({ groupSlug: group.slug });

  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.groups.show.settings, {
    slug: group.slug ?? "",
  });

  const information = (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <GroupInformationBox
        icon={<JournalAlbum className="bi" />}
        title="identifier:"
      >
        <p className="mb-0">@{group.slug}</p>
      </GroupInformationBox>
      <GroupInformationBox icon={<Clock className="bi" />} title="Created:">
        <p className="mb-0">
          <TimeCaption datetime={group.creation_date} className={cx("fs-6")} />
        </p>
      </GroupInformationBox>
      <GroupV2MemberListDisplay group={group.slug} />
    </div>
  );
  return output === "plain" ? (
    information
  ) : (
    <Card data-cy="project-info-card">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <h4 className="m-0">
            <InfoCircle className={cx("me-1", "bi")} />
            Info
          </h4>

          <div>
            <PermissionsGuard
              disabled={
                <EditButtonLink
                  disabled={true}
                  to={settingsUrl}
                  tooltip="Your role does not allow modifying group information"
                />
              }
              enabled={
                <EditButtonLink
                  data-cy="project-settings-edit"
                  to={settingsUrl}
                  tooltip="Modify project information"
                />
              }
              requestedPermission="write"
              userPermissions={permissions.permissions}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody>{information}</CardBody>
    </Card>
  );
}

interface GroupInformationBoxProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: React.ReactNode;
}
export function GroupInformationBox({
  children,
  icon,
  title,
}: GroupInformationBoxProps) {
  return (
    <div>
      <p className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
        {icon}
        {title}
      </p>
      <div className="ms-4">{children}</div>
    </div>
  );
}
