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

export interface StatusPageSummary {
  page: StatusPageMetadata;
  components: StatusPageComponents;
  incidents: Incidents;
  scheduled_maintenances: ScheduledMaintenances;
  status: StatusPageOverallStatus;
}

export interface StatusPageMetadata {
  id: string;
  name: string;
  url: string;
  time_zone: string;
  updated_at: string;
}

export type StatusPageComponents = StatusPageComponent[];

export interface StatusPageComponent {
  id: string;
  name: string;
  status: string;
  position: number;
  showcase: boolean;
  only_show_if_degraded: boolean;
}

export type Incidents = Incident[];

export interface Incident {
  id: string;
  name: string;
  status: IncidentStatus;
  impact: StatusIndicator;
  incident_updates: IncidentUpdates;
  components: StatusPageComponents;
}

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type ScheduledMaintenances = ScheduledMaintenance[];

export interface ScheduledMaintenance {
  id: string;
  name: string;
  status: ScheduledMaintenanceStatus;
  scheduled_for: string;
  scheduled_until: string;
  incident_updates: IncidentUpdates;
}

export type ScheduledMaintenanceStatus =
  | "scheduled"
  | "in_progress"
  | "verifying"
  | "completed";

export type IncidentUpdates = IncidentUpdate[];

export interface IncidentUpdate {
  id: string;
  body: string;
  display_at: string;
}

export interface StatusPageOverallStatus {
  indicator: StatusIndicator;
  description: string;
}

export type StatusIndicator = "none" | "minor" | "major" | "critical";

export interface GetSummaryParams {
  statusPageId: string;
}
