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

import { Visibilities } from "../../components/visibility/Visibility";

interface ComputeVisibilities {
  visibilities: Visibilities[];
  disabled: Visibilities[];
  default: Visibilities;
}
export const getComputeVisibilities = (
  options: Visibilities[]
): ComputeVisibilities => {
  if (options.includes(Visibilities.Private)) {
    return {
      visibilities: [Visibilities.Private],
      disabled: [Visibilities.Public, Visibilities.Internal],
      default: Visibilities.Private,
    };
  } else if (options.includes(Visibilities.Internal)) {
    return {
      visibilities: [Visibilities.Private, Visibilities.Internal],
      disabled: [Visibilities.Public],
      default: Visibilities.Internal,
    };
  }
  return {
    visibilities: [
      Visibilities.Private,
      Visibilities.Internal,
      Visibilities.Public,
    ],
    disabled: [],
    default: Visibilities.Public,
  };
};
