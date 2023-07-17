/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { useContext } from "react";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
import { Col, Row } from "reactstrap";
import { ErrorAlert, InfoAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import { User } from "../../../model/RenkuModels";
import AppContext from "../../../utils/context/appContext";
import { useGetSessionsQuery } from "../sessions.api";
import SessionsList from "./SessionsList";
import AnonymousSessionsDisabledNotice from "./AnonymousSessionsDisabledNotice";

export default function AnonymousSessionsList() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled = !!(
    params as { ANONYMOUS_SESSIONS?: boolean }
  ).ANONYMOUS_SESSIONS;

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <ContainerWrap>
        <AnonymousSessionsDisabledNotice />
      </ContainerWrap>
    );
  }

  return (
    <ContainerWrap>
      <AnonymousSessionsEnabledList />
    </ContainerWrap>
  );
}

function AnonymousSessionsEnabledList() {
  const { data: sessions, isLoading } = useGetSessionsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (!sessions) {
    return (
      <ErrorAlert>
        <p className="mb-0">Error while fetching sessions.</p>
      </ErrorAlert>
    );
  }

  console.log({ sessions });

  return (
    <>
      <Row className={cx("pt-2", "pb-3")}>
        <Col className={cx("d-flex", "mb-2", "justify-content-between")}>
          <h2 className="sessions-title">Sessions</h2>
        </Col>
      </Row>
      <SessionsList sessions={sessions} />
      <InfoAlert timeout={0}>
        <span>
          You can start a new session from the <i>Sessions</i> tab of a project.
        </span>
      </InfoAlert>
    </>
  );
}
