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
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
  Col,
  Collapse,
  Container,
  Row,
} from "reactstrap";

import { Loader } from "~/components/Loader";
import { TimeCaption } from "~/components/TimeCaption";
import { CommandCopy } from "~/components/commandCopy/CommandCopy";
import { RtkErrorAlert } from "~/components/errors/RtkErrorAlert";
import { ErrorLabel } from "~/components/formlabels/FormLabels";
import type {
  Environment as SessionEnvironment,
  EnvironmentList as SessionEnvironmentList,
} from "../sessionsV2/api/sessionLaunchersV2.api";
import { useGetEnvironmentsQuery } from "../sessionsV2/api/sessionLaunchersV2.api";
import { safeStringify } from "../sessionsV2/session.utils";
import AddSessionEnvironmentButton from "./AddSessionEnvironmentButton";
import DeleteSessionEnvironmentButton from "./DeleteSessionEnvironmentButton";
import UpdateSessionEnvironmentButton from "./UpdateSessionEnvironmentButton";
import { useCallback, useState } from "react";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";

export default function SessionEnvironmentsSection() {
  return (
    <section className="mt-4">
      <h2>Session Environments</h2>
      <SessionEnvironments />
    </section>
  );
}

function SessionEnvironments() {
  const { data: environments, error, isLoading } = useGetEnvironmentsQuery({});

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
      <Row className="gy-4">
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
  const {
    container_image,
    creation_date,
    name,
    default_url,
    description,
    port,
    gid,
    uid,
    working_directory,
    mount_directory,
    command,
    args,
    strip_path_prefix,
  } = environment;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Col className={cx("col-12", "col-sm-6")}>
      <Card>
        <CardHeader className={cx("fs-4", "p-0")} tag="h3">
          <button
            className={cx(
              "align-items-center",
              "bg-transparent",
              "border-0",
              "d-flex",
              "fw-bold",
              "gap-3",
              "p-3",
              "w-100"
            )}
            onClick={toggle}
            type="button"
          >
            {name}
            <div className="ms-auto">
              <ChevronFlippedIcon flipped={isOpen} />
            </div>
          </button>
        </CardHeader>

        <Collapse isOpen={isOpen}>
          <CardBody className="pt-0">
            <CardText className="mb-0">
              {description ? description : <i>No description</i>}
            </CardText>
            <CardText className="mb-0" tag="div">
              <CommandCopy command={container_image} />
            </CardText>
            <CardText className="mb-0">
              {default_url ? (
                <>
                  Default URL: <code>{default_url}</code>
                </>
              ) : (
                <i>
                  No default URL {"("}will use <code>{"/lab"}</code>
                  {")"}
                </i>
              )}
            </CardText>
            <CardText className="mb-0">
              Mount directory: <code>{mount_directory}</code>
            </CardText>
            <CardText className="mb-0">
              Work directory: <code>{working_directory}</code>
            </CardText>
            <CardText className="mb-0">
              Port: <code>{port}</code>
            </CardText>
            <CardText className="mb-0">
              GID: <code>{gid}</code>
            </CardText>
            <CardText className="mb-0">
              UID: <code>{uid}</code>
            </CardText>
            <CardText className="mb-0">
              Command:{" "}
              <EnvironmentCode value={command ? safeStringify(command) : "-"} />
            </CardText>
            <CardText className="mb-0">
              Args: <EnvironmentCode value={args ? safeStringify(args) : "-"} />
            </CardText>
            <CardText className="mb-0">
              Strip path prefix: {strip_path_prefix ? "Yes" : "No"}
            </CardText>
            <CardText>
              <TimeCaption
                datetime={creation_date}
                enableTooltip
                prefix="Created"
              />
            </CardText>

            <div className={cx("d-flex", "justify-content-end", "gap-2")}>
              <UpdateSessionEnvironmentButton environment={environment} />
              <DeleteSessionEnvironmentButton environment={environment} />
            </div>
          </CardBody>
        </Collapse>
      </Card>
    </Col>
  );
}

function EnvironmentCode({ value }: { value: string | null }) {
  if (value === null) return <ErrorLabel text={"Invalid JSON array value"} />;
  return <code>{value}</code>;
}
