/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useContext, useMemo } from "react";
import { Send } from "react-bootstrap-icons";
import { Button, Card, CardBody, CardText, CardTitle } from "reactstrap";

import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import { useGetUserQuery } from "../usersV2/api/users.api";

import styles from "./ContactUsCard.module.scss";

export default function ContactUsCard() {
  const { params } = useContext(AppContext);
  const SESSION_CLASS_EMAIL_US =
    params?.SESSION_CLASS_EMAIL_US ??
    DEFAULT_APP_PARAMS["SESSION_CLASS_EMAIL_US"];

  const { data: user } = useGetUserQuery(
    SESSION_CLASS_EMAIL_US.enabled ? undefined : skipToken
  );
  const name = useMemo(
    () =>
      user?.isLoggedIn && user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.isLoggedIn
        ? user?.first_name || user?.last_name
        : undefined,
    [user]
  );

  if (!SESSION_CLASS_EMAIL_US.enabled) {
    return null;
  }

  const url = new URL(`mailto:${SESSION_CLASS_EMAIL_US.email.to}`);
  url.searchParams.set("subject", SUBJECT);
  const signature = name || "<signature>";
  const renderedBody = BODY.replace(/[{][{]full_name[}][}]/g, `${signature}`);
  url.searchParams.set("body", renderedBody);

  return (
    <div
      data-cy="connected-services-contact-us-card"
      className={cx("col-12", "col-lg-6")}
    >
      <Card className={cx("h-100", "border-0", styles.card)}>
        <CardBody>
          <CardTitle>
            <h4>
              Do you have another platform you&apos;d like to connect to Renku?
            </h4>
          </CardTitle>
          <CardText>
            <Button
              className="stretched-link"
              color="outline-primary"
              tag="a"
              href={url.href}
            >
              <Send className={cx("bi", "me-1")} />
              Contact us
            </Button>{" "}
            to add it to this list!
          </CardText>
        </CardBody>
      </Card>
    </div>
  );
}

// TODO: Can we move this to the database?
const SUBJECT = "Renku Integration Request";
const BODY = `Hello Renku team,

I would like to be able to connect git repositories from <insert URL here> to Renku projects. Would it be possible to add it as a Renku Integration?

Best,

{{full_name}}`;
