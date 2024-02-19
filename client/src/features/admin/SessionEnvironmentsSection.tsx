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
 * limitations under the License.
 */

import { useGetSessionEnvironmentsQuery } from "../sessionsV2/sessionsV2.api";

export default function SessionEnvironmentsSection() {
  return (
    <section>
      <h2 className="fs-5">Session Environments - Renku 1.0</h2>
      <SessionEnvironments />
    </section>
  );
}

function SessionEnvironments() {
  const { data } = useGetSessionEnvironmentsQuery();

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
