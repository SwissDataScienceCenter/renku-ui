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

import AddSessionV2Button from "./AddSessionV2Button";
import { useGetSessionsV2FakeQuery } from "./sessionsV2.api";

export default function SessionsV2() {
  return (
    <div>
      <h3>Sessions</h3>
      <div>
        <AddSessionV2Button />
      </div>
      <div>
        <SessionsV2ListDisplay />
      </div>
    </div>
  );
}

function SessionsV2ListDisplay() {
  const { data } = useGetSessionsV2FakeQuery();

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
