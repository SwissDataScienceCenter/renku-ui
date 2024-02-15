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
import { useCallback, useState } from "react";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import AddSessionV2Button from "./AddSessionV2Button";
import DeleteSessionV2Modal from "./DeleteSessionV2Modal";
import UpdateSessionV2Modal from "./UpdateSessionV2Modal";
import { useGetSessionsV2Query } from "./sessionsV2.api";
import { SessionV2 } from "./sessionsV2.types";

export default function SessionsV2() {
  return (
    <div>
      <h3>Sessions</h3>
      <div>
        <AddSessionV2Button />
      </div>
      <div className="mt-2">
        <SessionsV2ListDisplay />
      </div>
    </div>
  );
}

function SessionsV2ListDisplay() {
  const { data: sessions, error, isLoading } = useGetSessionsV2Query();

  if (isLoading) {
    return (
      <p>
        <Loader className="bi" inline size={16} />
        Loading sessions...
      </p>
    );
  }

  if (error) {
    return <RtkErrorAlert error={error} />;
  }

  if (!sessions || sessions.length == 0) {
    return null;
  }

  return (
    <Container className="px-0" fluid>
      <Row>
        {sessions.map((session) => (
          <SessionV2Display key={session.id} session={session} />
        ))}
      </Row>
    </Container>
  );
}

interface SessionV2DisplayProps {
  session: SessionV2;
}

function SessionV2Display({ session }: SessionV2DisplayProps) {
  const { name, description, creationDate, environmentDefinition } = session;

  return (
    <Col>
      <Card>
        <CardBody>
          <CardTitle
            className={cx(
              "d-flex",
              "flex-row",
              "justify-content-between",
              "align-items-center"
            )}
          >
            <h5 className={cx("mb-0", "fs-5")}>{name}</h5>
            <SessionV2Actions session={session} />
          </CardTitle>
          <CardText className="mb-0">
            {description ?? <i>No description</i>}
          </CardText>
          <CardText className="mb-0">
            <CommandCopy command={environmentDefinition} />
          </CardText>
          <CardText>
            <TimeCaption
              datetime={creationDate}
              enableTooltip
              prefix="Created"
            />
          </CardText>
          <Button className={cx()} type="button" role="button">
            Start
          </Button>
        </CardBody>
      </Card>
    </Col>
  );
}

function SessionV2Actions({ session }: SessionV2DisplayProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);

  return (
    <>
      <UncontrolledDropdown>
        <DropdownToggle
          className={cx("p-2", "rounded-circle")}
          color="outline-rk-green"
        >
          <div className="lh-1">
            <ThreeDotsVertical className="bi" />
            <span className="visually-hidden">Actions</span>
          </div>
        </DropdownToggle>
        <DropdownMenu className="btn-with-menu-options" end>
          <DropdownItem onClick={toggleUpdate}>Edit</DropdownItem>
          <DropdownItem onClick={toggleDelete}>Delete</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>

      <UpdateSessionV2Modal
        isOpen={isUpdateOpen}
        session={session}
        toggle={toggleUpdate}
      />
      <DeleteSessionV2Modal
        isOpen={isDeleteOpen}
        session={session}
        toggle={toggleDelete}
      />
    </>
  );
}
