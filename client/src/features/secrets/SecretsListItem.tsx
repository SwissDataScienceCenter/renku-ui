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
import { useCallback, useState } from "react";
import { Card, CardBody, Collapse } from "reactstrap";

import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { TimeCaption } from "../../components/TimeCaption";
import SecretEdit from "./SecretEdit";
import SecretDelete from "./SecretDelete";
import { SecretDetails } from "./secrets.types";

interface SecretsListItemProps {
  secret: SecretDetails;
}
export default function SecretsListItem({ secret }: SecretsListItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = useCallback(() => {
    setShowDetails((showDetails) => !showDetails);
  }, []);

  return (
    <Card className="border" data-cy="secrets-list-item">
      <CardBody className="p-0">
        <button
          className={cx("d-flex", "w-100", "p-3", "bg-transparent", "border-0")}
          onClick={toggleDetails}
        >
          <div>{secret.name}</div>
          <div className="ms-auto">
            <ChevronFlippedIcon flipped={showDetails} />
          </div>
        </button>
      </CardBody>
      <Collapse isOpen={showDetails} mountOnEnter>
        <CardBody className={cx("border-top", "pb-0")}>
          <div>
            <div className="mb-2">
              <p className={cx("mb-0", "text-rk-text-light")}>ID</p>
              <p className="mb-0">{secret.id ? secret.id : "N/A"}</p>
            </div>
            <div className="mb-2">
              <p className={cx("mb-0", "text-rk-text-light")}>Last modified</p>
              <p className="mb-0">
                <TimeCaption
                  datetime={secret.modification_date}
                  enableTooltip
                  noCaption
                  prefix=""
                />
              </p>
            </div>
          </div>
        </CardBody>

        <CardBody className={cx("d-flex", "justify-content-end", "pt-0")}>
          <SecretEdit secret={secret} />
          <SecretDelete secret={secret} />
        </CardBody>
      </Collapse>
    </Card>
  );
}
