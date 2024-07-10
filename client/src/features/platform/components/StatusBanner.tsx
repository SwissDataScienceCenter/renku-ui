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
import { useContext, useMemo } from "react";

import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import { useGetPlatformConfigQuery } from "../api/platform.api";
import { useGetSummaryQuery } from "../statuspage-api/statuspage.api";
import {
  Incidents,
  StatusPageSummary,
} from "../statuspage-api/statuspage.types";
import { AppParams } from "../../../utils/context/appParams.types";

const FIVE_MINUTES_MILLIS = 5 * 60 * 1_000;

interface StatusBannerProps {
  params: AppParams | undefined;
}

export default function StatusBanner({ params }: StatusBannerProps) {
  const statusPageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  const { data: summary } = useGetSummaryQuery(
    statusPageId ? { statusPageId } : skipToken,
    {
      pollingInterval: FIVE_MINUTES_MILLIS,
    }
  );

  const { data: platformConfig } = useGetPlatformConfigQuery(undefined, {
    pollingInterval: FIVE_MINUTES_MILLIS,
  });

  return (
    <StatusBannerDisplay
      summary={summary}
      incidentBannerContent={platformConfig?.maintenance_banner ?? ""}
    />
  );
}

interface StatusBannerDisplayProps {
  summary: StatusPageSummary | null | undefined;
  incidentBannerContent: string;
}

function StatusBannerDisplay({
  summary,
  incidentBannerContent,
}: StatusBannerDisplayProps) {
  const incidents = summary?.incidents ?? [];

  return (
    <>
      <IncidentsBanner
        incidents={incidents}
        incidentBannerContent={incidentBannerContent}
      />
    </>
  );
}

interface IncidentsBannerProps {
  incidents: Incidents;
  incidentBannerContent: string;
}

function IncidentsBanner({
  incidents,
  incidentBannerContent,
}: IncidentsBannerProps) {
  if (!incidents.length && !incidentBannerContent) {
    return null;
  }

  return <div>INC</div>;
}
