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

import { ReactNode } from "react";
import { MemoryRouter as BaseRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";

interface RouterProps {
  children?: ReactNode;
}

/** Temporary router while routing is being upgraded from react-router@v5 to v6. Used for tests. */
export default function MemoryRouter({ children }: RouterProps) {
  return (
    <BaseRouter>
      <CompatRouter>{children}</CompatRouter>
    </BaseRouter>
  );
}
