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

import { ReactNode } from "react";
import { Col, Row } from "reactstrap";

import AdminPageNav from "./AdminPageNav";

interface AdminPageLayoutProps {
  children?: ReactNode;
}
export default function AdminPageLayout({ children }: AdminPageLayoutProps) {
  return (
    <Row>
      <Col xs={12}>
        <h1>Admin Panel</h1>
        <p>
          Manage platform configuration, including incidents, compute resources,
          integrations, session environments, and project storage.
        </p>
      </Col>
      <Col xs={12}>
        <AdminPageNav className="mb-3" />
      </Col>
      <Col xs={12}>
        <main>{children}</main>
      </Col>
    </Row>
  );
}
