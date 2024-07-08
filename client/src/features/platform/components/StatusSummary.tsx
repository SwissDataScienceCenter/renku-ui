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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { BoxArrowUpRight, CheckCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { Fragment, useContext, useMemo } from "react";
import { WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { TimeCaption } from "../../../components/TimeCaption";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { useGetUserInfoQuery } from "../../user/keycloakUser.api";
import { useGetSummaryQuery } from "../statuspage-api/statuspage.api";
import { StatusPageSummary } from "../statuspage-api/statuspage.types";

const FIVE_MINUTES_MILLIS = 5 * 60 * 1_000;

export default function StatusSummary() {
  const { params } = useContext(AppContext);
  const statusPageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  if (!statusPageId) {
    return <NoStatusPage />;
  }

  return <StatuspageDisplay statusPageId={statusPageId} />;
}

function NoStatusPage() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );
  const { data: userInfo } = useGetUserInfoQuery(
    userLogged ? undefined : skipToken
  );

  return (
    <WarnAlert dismissible={false}>
      <h3>Status Page not configured</h3>
      <p className="mb-0">
        This instance of Renku cannot provide its current status.
      </p>
      {userInfo?.isLoggedIn && userInfo.isAdmin && (
        <p className={cx("mb-0", "mt-1")}>
          As a Renku administrator, you can configure the status page in the{" "}
          <Link to="/admin">admin panel</Link>.
        </p>
      )}
    </WarnAlert>
  );
}

interface StatuspageDisplayProps {
  statusPageId: string;
}

function StatuspageDisplay({ statusPageId }: StatuspageDisplayProps) {
  const {
    data: summary,
    isLoading,
    error,
    fulfilledTimeStamp,
  } = useGetSummaryQuery(
    { statusPageId },
    { pollingInterval: FIVE_MINUTES_MILLIS }
  );

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !summary) {
    return (
      <>
        <p>
          Error: could not retrieve RenkuLab&apos;s status from statuspage.io.
        </p>
        <RtkOrNotebooksError error={error} dismissible={false} />
      </>
    );
  }

  return (
    <>
      <Row>
        <Col>
          <h3>RenkuLab Status</h3>
          <OverallStatus summary={summary} />

          <div>TODO</div>

          <h3>Components</h3>
          <ComponentsStatus summary={summary} />

          <div>TODO</div>

          <p className="mb-0">
            For further information, see{" "}
            <Link to={summary.page.url}>
              {summary.page.url}
              <BoxArrowUpRight className={cx("bi", "ms-1")} />
            </Link>
            .
          </p>
          <p>
            <TimeCaption
              datetime={new Date(fulfilledTimeStamp)}
              prefix="Status retrieved"
              suffix="; "
              enableTooltip
            />
            <TimeCaption
              datetime={summary.page.updated_at}
              prefix="last updated"
              suffix="."
              enableTooltip
            />
          </p>
        </Col>
      </Row>
      <pre>statusPageId = {statusPageId}</pre>
      <pre>{JSON.stringify(summary, null, 2)}</pre>
    </>
  );
}

interface OverallStatusProps {
  summary: StatusPageSummary;
}

function OverallStatus({ summary }: OverallStatusProps) {
  if (summary.status.indicator == "none") {
    return (
      <div className={cx("alert", "alert-success", "rounded", "p-3")}>
        <CheckCircleFill className={cx("bi", "me-1")} />
        {summary.status.description}
      </div>
    );
  }

  return (
    <div className={cx("alert", "alert-success", "rounded", "p-3")}>
      <CheckCircleFill className={cx("bi", "me-1")} />
      {summary.status.description}
    </div>
  );
}

interface ComponentsStatusProps {
  summary: StatusPageSummary;
}

function ComponentsStatus({ summary }: ComponentsStatusProps) {
  const components = useMemo(
    () =>
      [...summary.components]
        .filter(({ showcase }) => showcase)
        .sort((a, b) => a.position - b.position),
    [summary.components]
  );

  return (
    <Row className={cx("row-cols-2", "gy-2")}>
      {components.map((component) => (
        <Fragment key={component.id}>
          <Col xs={6} className="fw-bold">
            {component.name}
          </Col>
          <Col xs={6}>{component.status}</Col>
        </Fragment>
      ))}
    </Row>
  );
}
