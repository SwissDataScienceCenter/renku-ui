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

import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
} from "reactstrap";
import cx from "classnames";

import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import type {
  SessionEnvironment,
  SessionEnvironmentList,
} from "../sessionsV2/sessionsV2.types";
import AddSessionEnvironmentButton from "./AddSessionEnvironmentButton";
import { useGetSessionEnvironmentsQuery } from "./adminSessions.api";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import { TimeCaption } from "../../components/TimeCaption";

export default function SessionEnvironmentsSection() {
  return (
    <section className="mt-5">
      <h2 className="fs-5">Session Environments - Renku 1.0</h2>
      <SessionEnvironments />
    </section>
  );
}

function SessionEnvironments() {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkErrorAlert error={error} />;
  }

  return (
    <div>
      <AddSessionEnvironmentButton />

      <div className="mt-2">
        <SessionEnvironmentsListDisplay environments={environments} />
      </div>
    </div>
  );
}

interface SessionEnvironmentsListDisplayProps {
  environments: SessionEnvironmentList | undefined | null;
}

function SessionEnvironmentsListDisplay({
  environments,
}: SessionEnvironmentsListDisplayProps) {
  if (!environments || environments.length == 0) {
    return null;
  }

  return (
    <Container className="px-0" fluid>
      <Row>
        {environments.map((environment) => (
          <SessionEnvironmentDisplay
            key={environment.id}
            environment={environment}
          />
        ))}
      </Row>
    </Container>
  );
}

interface SessionEnvironmentDisplayProps {
  environment: SessionEnvironment;
}

function SessionEnvironmentDisplay({
  environment,
}: SessionEnvironmentDisplayProps) {
  const { container_image, creation_date, name, description } = environment;

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
            {/* <SessionV2Actions session={session} /> */}
          </CardTitle>
          <CardText className="mb-0">
            {description ?? <i>No description</i>}
          </CardText>
          <CardText className="mb-0">
            <CommandCopy command={container_image} />
          </CardText>
          <CardText>
            <TimeCaption
              datetime={creation_date}
              enableTooltip
              prefix="Created"
            />
          </CardText>
        </CardBody>
      </Card>
    </Col>
  );
}
