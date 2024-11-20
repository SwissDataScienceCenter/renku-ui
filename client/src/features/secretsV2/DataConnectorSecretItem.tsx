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
import { Badge, Col, ListGroupItem, Row } from "reactstrap";

import { TimeCaption } from "../../components/TimeCaption";
import { type SecretWithId } from "../usersV2/api/users.api";

interface DataConnectorSecretItemProps {
  secret: SecretWithId;
}

export default function DataConnectorSecretItem({
  secret,
}: DataConnectorSecretItemProps) {
  const { name, modification_date, data_connector_ids } = secret;

  //   const { projects, secretSlots, error, isLoading } = useGetRelatedProjects({
  //     secret,
  //   });

  //   const usedInContent = isLoading ? (
  //     <>
  //       <Loader className="me-1" inline size={16} />
  //       Loading related projects...
  //     </>
  //   ) : error || !projects || !secretSlots ? (
  //     <>
  //       <p>Error: could not load related projects</p>
  //       {error && <RtkOrNotebooksError error={error} dismissible={false} />}
  //     </>
  //   ) : (
  //     <GeneralSecretUsedIn projects={projects} secretSlots={secretSlots} />
  //   );

  const isOrphanSecret = data_connector_ids.length == 0;

  return (
    <ListGroupItem action>
      <Row>
        <Col>
          <div className={cx("align-items-center", "d-flex")}>
            <span className={cx("fw-bold", "me-2")}>{name}</span>
            {isOrphanSecret && <Badge color="danger">Orphan Secret</Badge>}
          </div>
          <div className={cx("text-light-emphasis", "small")}>
            Edited{" "}
            <TimeCaption datetime={modification_date} enableTooltip noCaption />
          </div>
          <div>
            <pre>{JSON.stringify(data_connector_ids)}</pre>
          </div>
          {/* <div>{usedInContent}</div> */}
        </Col>
        {/* <SessionSecretActions secretSlot={secretSlot} /> */}
      </Row>
    </ListGroupItem>
  );
}
