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
import { useContext } from "react";
import {
  BoxArrowUpRight,
  CheckCircleFill,
  XCircleFill,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";

import { Loader } from "../../components/Loader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Docs } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import { useGetPlatformConfigQuery } from "../platform/api/platform.api";
import StatusBanner from "../platform/components/StatusBanner";
import { useGetSummaryQuery } from "../platform/statuspage-api/statuspage.api";

export default function IncidentsAndMaintenanceSection() {
  const { params } = useContext(AppContext);
  const statusPageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  const result = useGetPlatformConfigQuery();

  return (
    <section>
      <h2 className="fs-5">Incidents And Maintenance</h2>

      <p>
        <Link
          to={Docs.rtdHowToGuide("admin/incidents-maintenance.html")}
          target="_blank"
          rel="noreferrer noopener"
        >
          Renku documentation about incidents and maintenance
          <BoxArrowUpRight className={cx("bi", "ms-1")} />
        </Link>
      </p>

      <StatusPageCheck statusPageId={statusPageId} />

      <p>TODO: update incident banner</p>

      <div>
        <p>Current status banner</p>
        <StatusBanner params={params} />
      </div>
    </section>
  );
}

interface StatusPageCheckProps {
  statusPageId: string;
}

function StatusPageCheck({ statusPageId }: StatusPageCheckProps) {
  const {
    data: summary,
    isLoading,
    error,
  } = useGetSummaryQuery(statusPageId ? { statusPageId } : skipToken);

  const statusPageManageUrl = `https://manage.statuspage.io/pages/${statusPageId}`;

  if (!statusPageId) {
    return (
      <p>
        Status Page ID: <span className="fst-italic">Not configured</span>
      </p>
    );
  }

  const checkContent = isLoading ? (
    <p>
      <Loader inline className="me-1" size={16} />
      Checking status from statuspage.io...
    </p>
  ) : error || summary == null ? (
    <>
      <p>
        <XCircleFill className={cx("bi", "me-1", "text-danger")} />
        Error: could not retrieve RenkuLab's status from statuspage.io.
      </p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : (
    <p>
      <CheckCircleFill className={cx("bi", "me-1", "text-success")} />
      Status retrieved from{" "}
      <Link to={summary.page.url} target="_blank" rel="noreferrer noopener">
        {summary.page.url}
        <BoxArrowUpRight className={cx("bi", "ms-1")} />
      </Link>
      .
    </p>
  );

  return (
    <>
      <p>
        Status Page ID:{" "}
        <Link
          to={statusPageManageUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {statusPageId}
        </Link>{" "}
        (click to open the management page)
      </p>
      {checkContent}
    </>
  );
}
