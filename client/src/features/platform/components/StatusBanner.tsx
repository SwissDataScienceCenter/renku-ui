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
import { Duration } from "luxon";
import { useMemo } from "react";
import {
  BoxArrowUpRight,
  WrenchAdjustableCircleFill,
} from "react-bootstrap-icons";
import { Link, useLocation } from "react-router-dom-v5-compat";
import { Alert } from "reactstrap";

import LazyRenkuMarkdown from "../../../components/markdown/LazyRenkuMarkdown";
import { TimeCaption } from "../../../components/TimeCaption";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import { AppParams } from "../../../utils/context/appParams.types";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import useNow from "../../../utils/customHooks/useNow.hook";
import { ensureDateTime } from "../../../utils/helpers/DateTimeUtils";
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

const FIVE_MINUTES_MILLIS = Duration.fromObject({ minutes: 5 }).valueOf();

const SOON_MAINTENANCE_CUTOFF = Duration.fromObject({ days: 2 });
const MAINTENANCE_CUTOFF = Duration.fromObject({ days: 7 });

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
      className={cx(
        "container-xxl",
        "renku-container",
        "border-0",
        "rounded-0"
      )}
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
      className={cx(
        "container-xxl",
        "renku-container",
        "border-0",
        "rounded-0"
      )}
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
  const now = useNow();

  // We display:
  // 1. All ongoing maintenances
  // 2. If no maintenance is ongoing, we display the next upcoming maintenance.
  const maintenancesToDisplay = useMemo(() => {
    const sortedMaintenances = [...scheduledMaintenances].sort((a, b) =>
      ensureDateTime(a.scheduled_for)
        .diff(ensureDateTime(b.scheduled_for))
        .valueOf()
    );
    const ongoingMaintenances = sortedMaintenances.filter(
      (m) =>
        m.status === "in_progress" ||
        m.status === "verifying" ||
        ensureDateTime(m.scheduled_for).diff(now).valueOf() < 0
    );
    if (ongoingMaintenances.length > 0) {
      return ongoingMaintenances;
    }
    return sortedMaintenances.slice(0, 1);
  }, [now, scheduledMaintenances]);

  if (!scheduledMaintenances.length) {
    return null;
  }

  return (
    <>
      {maintenancesToDisplay.map((maintenance) => (
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
  const { name, incident_updates, scheduled_for, status } = maintenance;

  const color =
    status === "in_progress" || status === "verifying" ? "warning" : "info";

  const now = useNow();

  const ongoing =
    status === "in_progress" ||
    status === "verifying" ||
    ensureDateTime(scheduled_for).diff(now).valueOf() < 0;

  const caption = ongoing
    ? "Ongoing maintenance started"
    : "Maintenance scheduled in";

  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const location = useLocation();
  const isDashboard =
    (userLogged && location.pathname === "/") ||
    location.pathname === "/v2" ||
    location.pathname === "/v2/";

  // 1. There is a scheduled maintenance in < 48 hours: show it on all pages except the landing page
  // 2. There is a scheduled maintenance in < 7 days: show it on the v1 Dashboard and the v2 Dashboard
  const shouldDisplay = useMemo(
    () =>
      ensureDateTime(scheduled_for).diff(now).valueOf() <
        SOON_MAINTENANCE_CUTOFF.valueOf() ||
      (isDashboard &&
        ensureDateTime(scheduled_for).diff(now).valueOf() <
          MAINTENANCE_CUTOFF.valueOf()),
    [isDashboard, now, scheduled_for]
  );

  if (!shouldDisplay) {
    return null;
  }

  return (
    <Alert
      color={color}
      className={cx(
        "container-xxl",
        "renku-container",
        "border-0",
        "rounded-0"
      )}
      fade={false}
    >
      <h3 className="fs-5">
        <WrenchAdjustableCircleFill className={cx("bi", "me-1")} />
        {caption}{" "}
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
