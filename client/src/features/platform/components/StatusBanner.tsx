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

import {
  BoxArrowUpRight,
  WrenchAdjustableCircleFill,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Alert } from "reactstrap";
import LazyRenkuMarkdown from "../../../components/markdown/LazyRenkuMarkdown";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import { AppParams } from "../../../utils/context/appParams.types";
import { useGetPlatformConfigQuery } from "../api/platform.api";
import { useGetSummaryQuery } from "../statuspage-api/statuspage.api";
import type {
  Incident,
  Incidents,
  ScheduledMaintenance,
  ScheduledMaintenances,
  StatusPageSummary,
} from "../statuspage-api/statuspage.types";
import StatusPageIncidentUpdates from "./StatusPageIncidentUpdates";
import { TimeCaption } from "../../../components/TimeCaption";

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
      incidentBannerContent={platformConfig?.incident_banner ?? ""}
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
  const scheduledMaintenances = summary?.scheduled_maintenances ?? [];

  return (
    <>
      <IncidentsBanner
        incidents={incidents}
        incidentBannerContent={incidentBannerContent}
        summaryPageUrl={summary?.page.url ?? ""}
      />
      <MaintenanceBanner
        scheduledMaintenances={scheduledMaintenances}
        summaryPageUrl={summary?.page.url ?? ""}
      />
    </>
  );
}

interface IncidentsBannerProps {
  incidents: Incidents;
  incidentBannerContent: string;
  summaryPageUrl: string;
}

function IncidentsBanner({
  incidents,
  incidentBannerContent,
  summaryPageUrl,
}: IncidentsBannerProps) {
  if (!incidents.length && !incidentBannerContent) {
    return null;
  }

  if (incidents.length) {
    return (
      <StatusPageIncidents
        incidents={incidents}
        summaryPageUrl={summaryPageUrl}
      />
    );
  }

  return (
    <ManuallyDeclaredIncident incidentBannerContent={incidentBannerContent} />
  );
}

interface StatusPageIncidentsProps {
  incidents: Incidents;
  summaryPageUrl: string;
}

function StatusPageIncidents({
  incidents,
  summaryPageUrl,
}: StatusPageIncidentsProps) {
  return (
    <>
      {incidents.map((incident) => (
        <StatusPageIncident
          key={incident.id}
          incident={incident}
          summaryPageUrl={summaryPageUrl}
        />
      ))}
    </>
  );
}

interface StatusPageIncidentProps {
  incident: Incident;
  summaryPageUrl: string;
}

function StatusPageIncident({
  incident,
  summaryPageUrl,
}: StatusPageIncidentProps) {
  const color =
    incident.impact === "none"
      ? "dark"
      : incident.impact === "maintenance"
      ? "info"
      : incident.impact === "minor"
      ? "warning"
      : "danger";

  return (
    <Alert
      color={color}
      className={cx("container-xxl", "renku-container")}
      fade={false}
    >
      <h3>Ongoing incident: {incident.name}</h3>
      <StatusPageIncidentUpdates incidentUpdates={incident.incident_updates} />
      {summaryPageUrl && (
        <p className="mb-0">
          For further information, see{" "}
          <Link to={summaryPageUrl} target="_blank" rel="noreferrer noopener">
            {summaryPageUrl}
            <BoxArrowUpRight className={cx("bi", "ms-1")} />
          </Link>
          .
        </p>
      )}
    </Alert>
  );
}

interface ManuallyDeclaredIncidentProps {
  incidentBannerContent: string;
}

function ManuallyDeclaredIncident({
  incidentBannerContent,
}: ManuallyDeclaredIncidentProps) {
  return (
    <Alert
      color="danger"
      className={cx("container-xxl", "renku-container")}
      fade={false}
    >
      <h3>Ongoing incident</h3>
      <LazyRenkuMarkdown markdownText={incidentBannerContent} />
    </Alert>
  );
}

interface MaintenanceBannerProps {
  scheduledMaintenances: ScheduledMaintenances;
  summaryPageUrl: string;
}

function MaintenanceBanner({
  scheduledMaintenances,
  summaryPageUrl,
}: MaintenanceBannerProps) {
  if (!scheduledMaintenances.length) {
    return null;
  }

  return (
    <>
      {scheduledMaintenances.map((maintenance) => (
        <StatusPageMaintenance
          key={maintenance.id}
          maintenance={maintenance}
          summaryPageUrl={summaryPageUrl}
        />
      ))}
    </>
  );
}

interface StatusPageMaintenanceProps {
  maintenance: ScheduledMaintenance;
  summaryPageUrl: string;
}

function StatusPageMaintenance({
  maintenance,
  summaryPageUrl,
}: StatusPageMaintenanceProps) {
  const { name, incident_updates, scheduled_for } = maintenance;

  return (
    <Alert
      color="info"
      className={cx("container-xxl", "renku-container")}
      fade={false}
    >
      <h3 className="fs-5">
        <WrenchAdjustableCircleFill className={cx("bi", "me-1")} />
        Maintenance scheduled in{" "}
        <TimeCaption datetime={scheduled_for} enableTooltip noCaption />: {name}
      </h3>
      <StatusPageIncidentUpdates incidentUpdates={incident_updates} />
      {summaryPageUrl && (
        <p className="mb-0">
          For further information, see{" "}
          <Link to={summaryPageUrl} target="_blank" rel="noreferrer noopener">
            {summaryPageUrl}
            <BoxArrowUpRight className={cx("bi", "ms-1")} />
          </Link>
          .
        </p>
      )}
    </Alert>
  );
}
