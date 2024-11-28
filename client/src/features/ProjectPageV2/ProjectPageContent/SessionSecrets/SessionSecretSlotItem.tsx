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
import { ArrowRight, Key, Lock } from "react-bootstrap-icons";
import { Badge, Col, ListGroupItem, Row } from "reactstrap";

import { useGetUserSecretByIdQuery } from "../../../usersV2/api/users.api";
import SessionSecretActions from "./SessionSecretActions";
import type { SessionSecretSlotWithSecret } from "./sessionSecrets.types";

interface SessionSecretSlotItemProps {
  secretsMountDirectory: string;
  secretSlot: SessionSecretSlotWithSecret;
  noActions?: boolean;
}

export default function SessionSecretSlotItem({
  secretsMountDirectory,
  secretSlot,
  noActions,
}: SessionSecretSlotItemProps) {
  const { filename, name, description } = secretSlot.secretSlot;
  const fullPath = `${secretsMountDirectory}/${filename}`;

  return (
    <ListGroupItem action={!noActions} data-cy="session-secret-slot-item">
      <Row>
        <Col>
          <div className={cx("align-items-center", "d-flex")}>
            <span className={cx("fw-bold", "me-2")}>{name}</span>
            {secretSlot.secretId ? (
              <Badge
                className={cx(
                  "border",
                  "border-success",
                  "bg-success-subtle",
                  "text-success-emphasis"
                )}
                pill
              >
                <Key className={cx("bi", "me-1")} />
                Secret saved
                <ArrowRight className={cx("bi", "mx-1")} />
                <SessionSecretSlotItemSecretReference
                  userSecretId={secretSlot.secretId}
                />
              </Badge>
            ) : (
              <Badge
                className={cx(
                  "border",
                  "border-dark-subtle",
                  "bg-light",
                  "text-dark-emphasis"
                )}
                pill
              >
                <Lock className={cx("bi", "me-1")} />
                Secret not provided
              </Badge>
            )}
          </div>
          <div>
            Location in sessions: <code>{fullPath}</code>
          </div>
          {description && <p className="mb-0">{description}</p>}
        </Col>
        {!noActions && <SessionSecretActions secretSlot={secretSlot} />}
      </Row>
    </ListGroupItem>
  );
}

interface SessionSecretSlotItemSecretReferenceProps {
  userSecretId: string;
}

function SessionSecretSlotItemSecretReference({
  userSecretId,
}: SessionSecretSlotItemSecretReferenceProps) {
  const { data: userSecret, error } = useGetUserSecretByIdQuery({
    secretId: userSecretId,
  });

  if (error || !userSecret) {
    return null;
  }

  return <>{userSecret.name}</>;
}
