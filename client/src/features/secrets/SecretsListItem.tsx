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
import { Card, CardBody } from "reactstrap";

import { TimeCaption } from "../../components/TimeCaption";
import SecretItemActions from "../secretsV2/SecretItemActions";
import type { SecretWithId } from "../usersV2/api/users.api";

interface SecretsListItemProps {
  secret: SecretWithId;
}

export default function SecretsListItem({ secret }: SecretsListItemProps) {
  return (
    <Card
      className="border"
      data-cy="secrets-list-item"
      key={secret.id + secret.modification_date} // force re-render on updates
    >
      <CardBody>
        <div
          className={cx(
            "d-flex",
            "gap-3",
            "flex-wrap",
            "align-items-center",
            "w-100"
          )}
        >
          <span className="fw-bold">{secret.name}</span>
          <span className={cx("text-rk-text-light", "my-auto small")}>
            Edited{" "}
            <TimeCaption
              datetime={secret.modification_date}
              enableTooltip
              noCaption
              prefix=""
            />
          </span>
          <SecretItemActions secret={secret} />
        </div>
        <div>
          Filename: <code>{secret.default_filename}</code>
        </div>
      </CardBody>
    </Card>
  );
}
