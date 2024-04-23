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
import SecretEdit from "./SecretEdit";
import SecretDelete from "./SecretDelete";
import { SecretDetails } from "./secrets.types";

interface SecretsListItemProps {
  secret: SecretDetails;
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
          <span className="text-rk-text-light my-auto small">
            Edited {+new Date(secret.modification_date) - +new Date() < 5_000}
            <TimeCaption
              datetime={secret.modification_date}
              enableTooltip
              noCaption
              prefix=""
            />
          </span>
          <div className={cx("ms-auto", "d-flex", "gap-2")}>
            <SecretEdit secret={secret} />
            <SecretDelete secret={secret} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
