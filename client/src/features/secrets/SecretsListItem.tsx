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

import { Loader } from "../../components/Loader";
import { useGetSecretDetailsQuery } from "./secrets.api";
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { TimeCaption } from "../../components/TimeCaption";
import SecretEdit from "./SecretEdit";
import SecretDelete from "./SecretDelete";

const NOT_AVAILABLE = "N/A";

interface SecretsListItemProps {
  secretName: string;
}
export default function SecretsListItem({ secretName }: SecretsListItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = useCallback(() => {
    setShowDetails((showDetails) => !showDetails);
  }, []);

  return (
    <Card className="border">
      <CardBody className="p-0">
        <button
          className={cx("d-flex", "w-100", "p-3", "bg-transparent", "border-0")}
          onClick={toggleDetails}
        >
          <div>{secretName}</div>
          <div className="ms-auto">
            <ChevronFlippedIcon flipped={showDetails} />
          </div>
        </button>
      </CardBody>
      <Collapse isOpen={showDetails} mountOnEnter>
        <SecretListItemDetails secretName={secretName} />
      </Collapse>
    </Card>
  );
}

function SecretListItemDetails({ secretName }: SecretsListItemProps) {
  const secretDetails = useGetSecretDetailsQuery(secretName);

  if (secretDetails.isLoading) return <Loader />;

  const detailSection = secretDetails.isError ? (
    <RtkOrNotebooksError dismissible={false} error={secretDetails.error} />
  ) : (
    <div>
      <div className="mb-2">
        <p className={cx("mb-0", "text-rk-text-light")}>ID</p>
        <p className="mb-0">
          {secretDetails.data?.id ? secretDetails.data.id : NOT_AVAILABLE}
        </p>
      </div>
      <div className="mb-2">
        <p className={cx("mb-0", "text-rk-text-light")}>Last modified</p>
        <p className="mb-0">
          <TimeCaption
            datetime={secretDetails.data?.modification_date}
            enableTooltip
            noCaption
            prefix=""
          />
        </p>
      </div>
    </div>
  );

  return (
    <>
      <CardBody className={cx("border-top", "pb-0")}>{detailSection}</CardBody>

      <CardBody className={cx("d-flex", "justify-content-end", "pt-0")}>
        <SecretEdit secretId={secretName} />
        <SecretDelete secretId={secretName} />
      </CardBody>
    </>
  );
}
