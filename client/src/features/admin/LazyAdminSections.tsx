/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { lazy, Suspense } from "react";

import PageLoader from "~/components/PageLoader";

const IncidentsAndMaintenanceSection = lazy(
  () => import("./IncidentsAndMaintenanceSection"),
);
const ComputeResourcesSection = lazy(() => import("./ComputeResourcesSection"));
const ConnectedServicesSection = lazy(() => import("./IntegrationsSection"));
const SessionEnvironmentsSection = lazy(
  () => import("./SessionEnvironmentsSection"),
);
const ProjectStorageAllowSection = lazy(
  () => import("./ProjectStorageAllowSection"),
);

export function LazyIncidentsAndMaintenanceSection() {
  return (
    <Suspense fallback={<PageLoader />}>
      <IncidentsAndMaintenanceSection />
    </Suspense>
  );
}

export function LazyComputeResourcesSection() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ComputeResourcesSection />
    </Suspense>
  );
}

export function LazyConnectedServicesSection() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ConnectedServicesSection />
    </Suspense>
  );
}

export function LazySessionEnvironmentsSection() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SessionEnvironmentsSection />
    </Suspense>
  );
}

export function LazyProjectStorageAllowSection() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProjectStorageAllowSection />
    </Suspense>
  );
}
