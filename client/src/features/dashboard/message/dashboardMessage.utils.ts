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

import { DashboardMessageParams } from "./DashboardMessage.types";

export function validateDashboardMessageParams(
  params: unknown
): DashboardMessageParams {
  if (
    params == null ||
    typeof params !== "object" ||
    !("DASHBOARD_MESSAGE" in params)
  ) {
    return { enabled: false };
  }

  const params_ = params as { DASHBOARD_MESSAGE: unknown };
  if (
    params_.DASHBOARD_MESSAGE == null ||
    typeof params_.DASHBOARD_MESSAGE !== "object"
  ) {
    return { enabled: false };
  }

  const rawDashboardParams = params_.DASHBOARD_MESSAGE as {
    [key: string]: unknown;
  };

  const enabled = !!rawDashboardParams.enabled;

  const text =
    typeof rawDashboardParams.text === "string" ? rawDashboardParams.text : "";

  const additionalText =
    typeof rawDashboardParams.additionalText === "string"
      ? rawDashboardParams.additionalText
      : "";

  const dismissible = !!rawDashboardParams.dismissible;

  const rawStyle =
    typeof rawDashboardParams.style === "string"
      ? rawDashboardParams.style.trim().toLowerCase()
      : "";
  const style =
    rawStyle === "plain"
      ? "plain"
      : rawStyle === "success"
      ? "success"
      : rawStyle === "info"
      ? "info"
      : rawStyle === "warning"
      ? "warning"
      : rawStyle === "danger"
      ? "danger"
      : null;

  if (enabled && text && style) {
    return {
      enabled,
      text,
      additionalText,
      style,
      dismissible,
    };
  }

  return {
    enabled: false,
  };
}
